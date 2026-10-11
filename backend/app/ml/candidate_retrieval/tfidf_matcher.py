import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Tuple, Dict, Any, Optional

class TfidfPostalMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            min_df=1,
            sublinear_tf=True
        )
        self.tfidf_matrix = None
        self.doc_ids: List[int] = []
        self.is_fitted: bool = False

    def fit(self, documents: List[str], doc_ids: List[int]):
        if not documents:
            return
        self.doc_ids = doc_ids
        self.tfidf_matrix = self.vectorizer.fit_transform(documents)
        self.is_fitted = True

    def find_similar(self, query: str, top_k: int = 15, min_score: float = 0.15) -> List[Tuple[int, float]]:
        if not self.is_fitted or self.tfidf_matrix is None or not query:
            return []

        query_vec = self.vectorizer.transform([query])
        # Cosine similarity between query and all documents
        scores = (self.tfidf_matrix * query_vec.T).toarray().ravel()
        
        # Get top-k indices
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            score = float(scores[idx])
            if score >= min_score:
                results.append((self.doc_ids[idx], score))
        return results

    def save(self, filepath: str):
        if not self.is_fitted:
            return
        import joblib
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"vectorizer": self.vectorizer, "tfidf_matrix": self.tfidf_matrix, "doc_ids": self.doc_ids}, filepath)

    def load(self, filepath: str) -> bool:
        if not os.path.exists(filepath):
            return False
        import joblib
        try:
            data = joblib.load(filepath)
            self.vectorizer = data["vectorizer"]
            self.tfidf_matrix = data["tfidf_matrix"]
            self.doc_ids = data["doc_ids"]
            self.is_fitted = True
            return True
        except Exception:
            return False

tfidf_matcher = TfidfPostalMatcher()
