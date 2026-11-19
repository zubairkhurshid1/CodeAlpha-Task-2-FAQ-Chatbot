"""
IntelliFAQ - Natural Language Processing (NLP) Preprocessor
Performs text cleaning, tokenization, stopword removal, and normalization
using NLTK with intelligent domain-aware token preservation.
"""

import re
import string
from typing import List

try:
    import nltk
    from nltk.stem import PorterStemmer
    try:
        from nltk.tokenize import word_tokenize
        word_tokenize("test")
        HAS_PUNKT = True
    except Exception:
        HAS_PUNKT = False

    try:
        from nltk.corpus import stopwords
        NLTK_STOPWORDS = set(stopwords.words('english'))
    except Exception:
        NLTK_STOPWORDS = None

    try:
        from nltk.stem import WordNetLemmatizer
        lemmatizer_instance = WordNetLemmatizer()
        lemmatizer_instance.lemmatize("dogs")
        HAS_WORDNET = True
    except Exception:
        HAS_WORDNET = False

    NLTK_AVAILABLE = True
except Exception:
    NLTK_AVAILABLE = False
    HAS_PUNKT = False
    NLTK_STOPWORDS = None
    HAS_WORDNET = False


class NLPProcessor:
    """
    Robust text preprocessor for the FAQ Chatbot.
    Cleans, normalizes, tokenizes, and reduces words to their base forms.
    """

    DEFAULT_STOPWORDS = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
        "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
        "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
        "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for",
        "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
        "herself", "him", "himself", "his", "i", "if", "in", "into", "is", "isn't",
        "it", "it's", "its", "itself", "just", "me", "more", "most", "my", "myself",
        "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
        "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
        "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
        "themselves", "then", "there", "these", "they", "this", "those", "through",
        "to", "too", "under", "until", "up", "very", "was", "we", "were", "what",
        "when", "where", "which", "while", "who", "whom", "with", "would", "you",
        "your", "yours", "yourself", "yourselves"
    }

    TECH_REPLACEMENTS = {
        r"\b(react\.js|reactjs|react\s+js)\b": "react",
        r"\b(node\.js|nodejs|node\s+js)\b": "nodejs",
        r"\b(vue\.js|vuejs|vue\s+js)\b": "vue",
        r"\b(next\.js|nextjs|next\s+js)\b": "nextjs",
        r"\b(express\.js|expressjs|express\s+js)\b": "express",
        r"\b(c\+\+)\b": "cpp",
        r"\b(c\#)\b": "csharp",
        r"\b(ci\/cd|ci-cd)\b": "cicd",
        r"\b(tf-idf|tfidf)\b": "tfidf",
        r"\b(vdom)\b": "virtual dom",
        r"\b(restful)\b": "rest",
    }

    def __init__(self, use_stemming: bool = False):
        self.use_stemming = use_stemming
        self.stop_words = self.DEFAULT_STOPWORDS
        self.lemmatizer = None

        if NLTK_AVAILABLE and HAS_WORDNET:
            try:
                self.lemmatizer = WordNetLemmatizer()
            except Exception:
                self.lemmatizer = None

        if NLTK_AVAILABLE and NLTK_STOPWORDS:
            self.stop_words = NLTK_STOPWORDS

    def clean_text(self, text: str) -> str:
        """
        Cleans and normalizes input text:
        - Lowercases
        - Normalizes known tech acronyms and frameworks
        - Removes special symbols except alphanumerics and essential whitespace
        """
        if not text:
            return ""

        cleaned = text.lower().strip()

        # Preserve tech abbreviations
        for pattern, replacement in self.TECH_REPLACEMENTS.items():
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

        # Replace hyphens and slashes with spaces for compound words
        cleaned = re.sub(r"[\/\-_]", " ", cleaned)

        # Remove punctuation marks
        cleaned = re.sub(r"[^\w\s]", "", cleaned)

        # Collapse repeated whitespace
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def tokenize(self, text: str) -> List[str]:
        """
        Tokenizes text into a list of word tokens.
        """
        cleaned = self.clean_text(text)
        if not cleaned:
            return []

        if NLTK_AVAILABLE and HAS_PUNKT:
            try:
                tokens = word_tokenize(cleaned)
            except Exception:
                tokens = cleaned.split()
        else:
            tokens = cleaned.split()

        return tokens

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """
        Removes stopwords while preserving meaningful terms.
        If all tokens are stopwords, retains them to avoid empty representation.
        """
        filtered = [token for token in tokens if token not in self.stop_words]
        return filtered if filtered else tokens

    def lemmatize_or_stem(self, tokens: List[str]) -> List[str]:
        """
        Normalizes inflected word forms to their base lemma
        (e.g., components -> component, libraries -> library).
        """
        processed = []
        for token in tokens:
            root = token
            if self.lemmatizer:
                try:
                    root = self.lemmatizer.lemmatize(token)
                except Exception:
                    root = token
            if root == token:
                # Rule-based tech-friendly lemmatization
                if token.endswith("ies") and len(token) > 4:
                    root = token[:-3] + "y"
                elif token.endswith("es") and len(token) > 3 and not token.endswith(("pes", "tes", "ses", "kes", "mes")):
                    root = token[:-2]
                elif token.endswith("s") and not token.endswith(("ss", "us", "is", "as", "os")) and len(token) > 3:
                    root = token[:-1]
                elif token.endswith("ing") and len(token) > 5:
                    root = token[:-3]
            processed.append(root)
        return processed

    def preprocess(self, text: str) -> str:
        """
        Full preprocessing pipeline:
        1. Clean text (lowercase, remove punctuation, normalize tech terms)
        2. Tokenize
        3. Remove stopwords
        4. Lemmatize / normalize
        5. Return space-separated normalized string suitable for TF-IDF Vectorizer
        """
        if not text or not text.strip():
            return ""

        tokens = self.tokenize(text)
        if not tokens:
            return ""

        tokens = self.remove_stopwords(tokens)
        tokens = self.lemmatize_or_stem(tokens)

        return " ".join(tokens)
