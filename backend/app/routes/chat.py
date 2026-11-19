"""
IntelliFAQ - Chat and FAQ API Routes
Provides endpoints for querying the chatbot, fetching FAQs, retrieving suggestions,
and inspecting system health.
"""

from typing import List, Optional, Any, Dict
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.services.faq_matcher import FAQMatcher

router = APIRouter(prefix="/api", tags=["FAQ Chatbot"])

# Initialize FAQ Matcher singleton
matcher = FAQMatcher()


# --- Pydantic Schemas ---

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000, description="User's query in natural language", json_schema_extra={"example": "What is React?"})
    threshold: Optional[float] = Field(None, ge=0.0, le=1.0, description="Optional custom similarity threshold override")


class ChatResponse(BaseModel):
    success: bool
    question: str
    answer: str
    matched_question: Optional[str] = None
    similarity_score: float
    confidence_label: Optional[str] = None
    is_confident: bool
    category: Optional[str] = None
    related_questions: List[str] = Field(default_factory=list)
    similarity_explanation: str = "Cosine similarity of TF-IDF vectors representing textual similarity, not factual certainty."


class FAQItem(BaseModel):
    id: str
    category: str
    question: str
    answer: str
    patterns: List[str]
    related_questions: List[str]


class ThresholdUpdateRequest(BaseModel):
    threshold: float = Field(..., ge=0.0, le=1.0, description="New default similarity threshold")


# --- Route Endpoints ---

@router.post("/chat", response_model=ChatResponse, summary="Send a question to IntelliFAQ")
async def chat_endpoint(payload: ChatRequest):
    """
    Submits a natural language question to the NLP FAQ pipeline.
    Preprocesses the text, computes TF-IDF cosine similarity,
    and returns the best answer if above the similarity threshold.
    """
    cleaned_query = payload.question.strip()
    if not cleaned_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty or only whitespace."
        )

    result = matcher.match(cleaned_query, threshold=payload.threshold)
    return ChatResponse(
        success=result["success"],
        question=result["question"],
        answer=result["answer"],
        matched_question=result.get("matched_question"),
        similarity_score=result["similarity_score"],
        confidence_label=result.get("confidence_label"),
        is_confident=result["is_confident"],
        category=result.get("category"),
        related_questions=result.get("related_questions", []),
        similarity_explanation="Score reflects textual vector similarity (TF-IDF & Cosine Similarity) between questions."
    )


@router.get("/faqs", summary="List all FAQs")
async def get_faqs(category: Optional[str] = Query(None, description="Optional category filter")):
    """
    Returns all available FAQs in the system, optionally filtered by category.
    """
    faqs = matcher.get_all_faqs()
    if category:
        faqs = [f for f in faqs if f.get("category", "").lower() == category.lower()]
    return {
        "total": len(faqs),
        "faqs": faqs
    }


@router.get("/suggestions", summary="Get suggested questions")
async def get_suggestions(count: int = Query(4, ge=1, le=10)):
    """
    Returns random or popular suggested questions to display on the welcome screen.
    """
    suggestions = matcher.get_random_suggestions(count=count)
    return {
        "suggestions": suggestions
    }


@router.get("/health", summary="Health check endpoint")
async def health_check():
    """
    Returns current health status and NLP engine readiness.
    """
    return {
        "status": "healthy",
        "service": "IntelliFAQ API",
        "total_faqs_indexed": len(matcher.faqs),
        "total_patterns_indexed": len(matcher.pattern_records),
        "similarity_threshold": matcher.threshold,
        "engine": "TF-IDF + Cosine Similarity (Scikit-Learn & NLTK)"
    }


@router.get("/threshold", summary="Get current similarity threshold")
async def get_threshold():
    """
    Returns the current active similarity threshold.
    """
    return {"threshold": matcher.threshold}


@router.post("/threshold", summary="Update similarity threshold")
async def update_threshold(payload: ThresholdUpdateRequest):
    """
    Updates the active similarity threshold.
    """
    matcher.set_threshold(payload.threshold)
    return {
        "message": f"Similarity threshold successfully updated to {payload.threshold}",
        "threshold": matcher.threshold
    }
