"""
IntelliFAQ - Comprehensive Unit & Integration Tests
Tests:
- Exact FAQ matching
- Variations and alternate phrasing
- Spelling variations and typo tolerance
- Unnecessary / filler words
- Unrelated questions (below threshold)
- Empty questions and whitespace handling
- Dynamic similarity threshold
- API endpoints (POST /api/chat, GET /api/faqs, GET /api/suggestions, GET /api/health)
"""

import os
import sys

# Ensure backend root is in python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(CURRENT_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.nlp_processor import NLPProcessor
from app.services.faq_matcher import FAQMatcher

client = TestClient(app)


# -------------------------------------------------------------
# Unit Tests: NLP Processor
# -------------------------------------------------------------

def test_nlp_processor_cleaning():
    processor = NLPProcessor()
    raw = "What is React.js?? And how does it work?!"
    cleaned = processor.clean_text(raw)
    assert "react" in cleaned
    assert "?" not in cleaned
    assert "!" not in cleaned


def test_nlp_processor_tokenization():
    processor = NLPProcessor()
    text = "What is Docker containerization?"
    tokens = processor.tokenize(text)
    assert "docker" in tokens
    assert "containerization" in tokens


def test_nlp_processor_stopwords():
    processor = NLPProcessor()
    tokens = ["what", "is", "fastapi", "framework"]
    filtered = processor.remove_stopwords(tokens)
    assert "fastapi" in filtered
    assert "framework" in filtered


def test_nlp_processor_pipeline():
    processor = NLPProcessor()
    res = processor.preprocess("Can you explain what React components are?")
    assert len(res) > 0
    assert "component" in res or "components" in res


# -------------------------------------------------------------
# Unit Tests: FAQ Matcher & Similarity
# -------------------------------------------------------------

@pytest.fixture(scope="module")
def matcher():
    return FAQMatcher()


def test_exact_faq_matching(matcher):
    """Test 1: Exact FAQ Question match"""
    result = matcher.match("What is React?")
    assert result["success"] is True
    assert result["is_confident"] is True
    assert "React is an open-source JavaScript library" in result["answer"]
    assert result["similarity_score"] >= 0.70


def test_different_wording_matching(matcher):
    """Test 2: Natural variation / rephrasing"""
    result = matcher.match("Could you tell me what FastAPI is used for in Python?")
    assert result["success"] is True
    assert result["is_confident"] is True
    assert "FastAPI is a modern" in result["answer"]
    assert result["matched_question"] == "What is FastAPI?"


def test_spelling_variation_matching(matcher):
    """Test 3: Acronym and punctuation variations (e.g. reactjs vs React.js)"""
    result = matcher.match("Tell me about reactjs and how it renders")
    assert result["success"] is True
    assert result["is_confident"] is True
    assert "React" in result["answer"]


def test_unnecessary_words_matching(matcher):
    """Test 4: Query padded with filler words and conversational chatter"""
    result = matcher.match("Hey bro, please kindly explain what Docker and containers are in software dev")
    assert result["success"] is True
    assert result["is_confident"] is True
    assert "Docker is an open platform" in result["answer"]


def test_unrelated_questions(matcher):
    """Test 5: Completely unrelated questions must be rejected under similarity threshold"""
    unrelated_queries = [
        "How do I bake chocolate chip cookies?",
        "What is the weather in Tokyo right now?",
        "Who won the 1998 football world cup?",
        "Best recipe for spaghetti carbonara"
    ]
    for query in unrelated_queries:
        result = matcher.match(query)
        assert result["success"] is False
        assert result["is_confident"] is False
        assert "Sorry, I couldn't find a relevant answer" in result["answer"]
        assert result["similarity_score"] < matcher.threshold


def test_empty_questions(matcher):
    """Test 6: Empty queries and whitespace"""
    result = matcher.match("")
    assert result["success"] is False
    assert result["is_confident"] is False

    result_spaces = matcher.match("    ")
    assert result_spaces["success"] is False


def test_similarity_threshold_behavior(matcher):
    """Test 7: Configurable similarity threshold prevents borderline false positives"""
    # High strict threshold should reject moderate matches
    strict_threshold = 0.95
    result = matcher.match("How do I make an API?", threshold=strict_threshold)
    # Unless exact 1.0, score below 0.95 will be rejected
    if result["similarity_score"] < strict_threshold:
        assert result["is_confident"] is False
        assert result["success"] is False


# -------------------------------------------------------------
# Integration Tests: FastAPI Endpoints
# -------------------------------------------------------------

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["total_faqs_indexed"] > 0


def test_api_suggestions():
    response = client.get("/api/suggestions?count=4")
    assert response.status_code == 200
    data = response.json()
    assert len(data["suggestions"]) == 4


def test_api_faqs_listing():
    response = client.get("/api/faqs")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["faqs"]) == data["total"]


def test_api_chat_success():
    response = client.post("/api/chat", json={"question": "What is Python?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["is_confident"] is True
    assert "Python is a high-level" in data["answer"]
    assert data["similarity_score"] > 0.40
    assert len(data["related_questions"]) > 0


def test_api_chat_unrelated():
    response = client.post("/api/chat", json={"question": "How to make homemade pizza?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["is_confident"] is False
    assert "couldn't find a relevant answer" in data["answer"]


def test_api_chat_validation_empty():
    response = client.post("/api/chat", json={"question": "   "})
    assert response.status_code == 400
