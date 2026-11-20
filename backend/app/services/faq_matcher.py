"""
IntelliFAQ - FAQ Matcher Engine
Handles FAQ loading, TF-IDF vectorization, cosine similarity computation,
confidence scoring, and threshold-based answer retrieval.
"""

import json
import os
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.nlp_processor import NLPProcessor


class FAQMatcher:
    """
    Intelligent FAQ Matcher using TF-IDF and Cosine Similarity.
    """

    def __init__(
        self,
        data_path: Optional[str] = None,
        similarity_threshold: float = 0.32,
        ngram_range: Tuple[int, int] = (1, 2),
    ):
        self.threshold = similarity_threshold
        self.ngram_range = ngram_range
        self.nlp = NLPProcessor()

        # Resolve path to data file
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.data_path = os.path.join(base_dir, "data", "faqs.json")
        else:
            self.data_path = data_path

        self.faqs: List[Dict[str, Any]] = []
        self.pattern_records: List[Dict[str, Any]] = []  # Flat list of individual patterns mapped to their FAQ
        self.preprocessed_corpus: List[str] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None

        # Load and fit
        self.reload_dataset()

    def reload_dataset(self) -> None:
        """
        Loads the FAQ dataset from JSON and refits the TF-IDF vectorizer.
        """
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"FAQ dataset file not found at {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            self.faqs = json.load(f)

        self._build_index()

    def add_faq(self, faq_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dynamically adds a new FAQ to the dataset, saves to JSON, and updates the TF-IDF matrix.
        """
        if not faq_dict.get("id"):
            import uuid
            faq_dict["id"] = f"faq_{uuid.uuid4().hex[:8]}"

        self.faqs.append(faq_dict)
        try:
            with open(self.data_path, "w", encoding="utf-8") as f:
                json.dump(self.faqs, f, indent=2, ensure_ascii=False)
        except Exception as e:
            self.faqs.pop()
            raise e

        self._build_index()
        return faq_dict

    def _build_index(self) -> None:
        """
        Builds the searchable corpus from FAQ canonical questions, variations, and keywords,
        and fits the Scikit-learn TF-IDF Vectorizer.
        """
        self.pattern_records = []
        self.preprocessed_corpus = []

        for faq in self.faqs:
            patterns = faq.get("patterns", [])
            canonical_q = faq.get("question", "")
            keywords = " ".join(faq.get("keywords", []))

            # Include canonical question
            all_phrasings = set(patterns)
            if canonical_q:
                all_phrasings.add(canonical_q)

            for pattern in all_phrasings:
                preprocessed = self.nlp.preprocess(pattern)
                if preprocessed:
                    self.pattern_records.append({
                        "pattern": pattern,
                        "faq_id": faq.get("id"),
                        "faq": faq
                    })
                    self.preprocessed_corpus.append(preprocessed)

            # Also index an auxiliary entry combining canonical question with keywords
            if keywords:
                kw_augmented = f"{canonical_q} {keywords}"
                kw_preprocessed = self.nlp.preprocess(kw_augmented)
                if kw_preprocessed and kw_preprocessed not in self.preprocessed_corpus:
                    self.pattern_records.append({
                        "pattern": canonical_q,
                        "faq_id": faq.get("id"),
                        "faq": faq
                    })
                    self.preprocessed_corpus.append(kw_preprocessed)

        if not self.preprocessed_corpus:
            raise ValueError("FAQ dataset produced an empty corpus after preprocessing.")

        # Initialize and fit TfidfVectorizer
        # sublinear_tf=True applies sublinear scaling (1 + log(tf)) to prevent dominance of frequent words
        self.vectorizer = TfidfVectorizer(
            ngram_range=self.ngram_range,
            sublinear_tf=True,
            lowercase=False  # Preprocessing already lowercases
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.preprocessed_corpus)

    def set_threshold(self, threshold: float) -> None:
        """
        Dynamically updates the confidence threshold.
        """
        if not (0.0 <= threshold <= 1.0):
            raise ValueError("Threshold must be between 0.0 and 1.0")
        self.threshold = threshold

    def get_confidence_label(self, score: float) -> str:
        """
        Returns a human-readable match level indicating textual similarity.
        """
        if score >= 0.85:
            return "Very High Textual Match"
        elif score >= 0.65:
            return "High Textual Match"
        elif score >= 0.45:
            return "Moderate Textual Match"
        elif score >= self.threshold:
            return "Fair Textual Match"
        else:
            return "Below Similarity Threshold"

    def match(self, question: str, threshold: Optional[float] = None) -> Dict[str, Any]:
        """
        Processes a user question, transforms it with TF-IDF,
        computes cosine similarity, and returns the top matching FAQ or fallback.
        """
        active_threshold = threshold if threshold is not None else self.threshold

        if not question or not question.strip():
            return {
                "success": False,
                "question": question,
                "answer": "Please ask a question to receive assistance.",
                "matched_question": None,
                "similarity_score": 0.0,
                "confidence_label": "No Input",
                "is_confident": False,
                "related_questions": self.get_random_suggestions(3),
                "debug_info": {"reason": "empty_query"}
            }

        # Step 2: NLP Preprocessing of user question
        preprocessed_query = self.nlp.preprocess(question)

        if not preprocessed_query:
            return {
                "success": False,
                "question": question,
                "answer": "Sorry, I couldn't find a relevant answer. Please try asking differently.",
                "matched_question": None,
                "similarity_score": 0.0,
                "confidence_label": "Unrecognized Query",
                "is_confident": False,
                "related_questions": self.get_random_suggestions(3),
                "debug_info": {"reason": "preprocessed_query_empty"}
            }

        # Step 3: TF-IDF Vectorization
        try:
            query_vector = self.vectorizer.transform([preprocessed_query])
        except Exception as e:
            return {
                "success": False,
                "question": question,
                "answer": "Sorry, an error occurred while processing your question.",
                "matched_question": None,
                "similarity_score": 0.0,
                "confidence_label": "Error",
                "is_confident": False,
                "related_questions": self.get_random_suggestions(3),
                "debug_info": {"error": str(e)}
            }

        # Step 4: Cosine Similarity
        # Calculate cosine similarity against all indexed pattern vectors
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # Find best match
        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])
        best_record = self.pattern_records[best_idx]
        matched_faq = best_record["faq"]

        # Aggregate scores per unique FAQ to find other close candidates
        faq_scores: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        for idx, score in enumerate(similarities):
            rec = self.pattern_records[idx]
            f_id = rec["faq_id"]
            if f_id not in faq_scores or score > faq_scores[f_id][0]:
                faq_scores[f_id] = (float(score), rec["faq"])

        # Rank FAQs by score descending
        ranked_faqs = sorted(faq_scores.values(), key=lambda x: x[0], reverse=True)

        # Related questions from matched FAQ plus any closely ranked FAQs
        related = list(matched_faq.get("related_questions", []))
        for score, faq in ranked_faqs[1:3]:
            if score >= 0.15 and faq.get("question") not in related:
                related.append(faq.get("question"))

        # Deduplicate and cap related questions
        seen = set()
        deduped_related = []
        for q in related:
            if q and q not in seen and q != matched_faq.get("question"):
                seen.add(q)
                deduped_related.append(q)
            if len(deduped_related) >= 3:
                break

        # Fallback to random suggestions if related questions list is empty
        if not deduped_related:
            deduped_related = self.get_random_suggestions(3, exclude_id=matched_faq.get("id"))

        # Step 5: Confidence Threshold check
        is_confident = best_score >= active_threshold
        confidence_label = self.get_confidence_label(best_score)

        if not is_confident:
            return {
                "success": False,
                "question": question,
                "answer": "Sorry, I couldn't find a relevant answer. Please try asking differently.",
                "matched_question": matched_faq.get("question"),
                "similarity_score": round(best_score, 4),
                "confidence_label": confidence_label,
                "is_confident": False,
                "threshold": active_threshold,
                "related_questions": deduped_related,
                "debug_info": {
                    "matched_pattern": best_record["pattern"],
                    "preprocessed_query": preprocessed_query,
                    "reason": "below_threshold"
                }
            }

        return {
            "success": True,
            "question": question,
            "answer": matched_faq.get("answer"),
            "matched_question": matched_faq.get("question"),
            "similarity_score": round(best_score, 4),
            "confidence_label": confidence_label,
            "is_confident": True,
            "threshold": active_threshold,
            "category": matched_faq.get("category"),
            "related_questions": deduped_related,
            "debug_info": {
                "matched_pattern": best_record["pattern"],
                "preprocessed_query": preprocessed_query,
                "faq_id": matched_faq.get("id")
            }
        }

    def get_all_faqs(self) -> List[Dict[str, Any]]:
        """
        Returns all FAQs in the dataset.
        """
        return self.faqs

    def get_all_questions(self) -> List[Dict[str, Any]]:
        """
        Returns concise listing of all FAQ questions and categories.
        """
        return [
            {
                "id": f.get("id"),
                "question": f.get("question"),
                "category": f.get("category")
            }
            for f in self.faqs
        ]

    def get_random_suggestions(self, count: int = 4, exclude_id: Optional[str] = None) -> List[str]:
        """
        Returns a list of suggested questions.
        """
        candidates = [f.get("question") for f in self.faqs if f.get("id") != exclude_id and f.get("question")]
        if not candidates:
            return []
        import random
        return random.sample(candidates, min(count, len(candidates)))
