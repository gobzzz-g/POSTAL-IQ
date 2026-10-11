import re
import unicodedata
from typing import Dict, Tuple, List, Optional
from rapidfuzz import process, fuzz
from backend.app.ml.preprocessing.abbreviations import expand_abbreviations

# Regex for noisy text
PHONE_REGEX = re.compile(r'(?:\+?91[\s\-]?)?[6-9]\d{9}')
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
URL_REGEX = re.compile(r'https?://\S+|www\.\S+')
MULTI_SPACE_REGEX = re.compile(r'\s+')
PUNCT_REGEX = re.compile(r'[,;:/|\\~#\-]+')

DEFAULT_POSTAL_VOCAB = [
    "gandhipuram", "coimbatore", "connaught", "daryaganj", "shakarpur",
    "hauz", "khas", "koramangala", "kormangala", "indiranagar", "whitefield",
    "gachibowli", "hinjewadi", "bandra", "andheri", "patna", "bengaluru",
    "chennai", "mumbai", "hyderabad", "delhi", "gurugram", "noida", "kolkata"
]

class AddressNormalizer:
    def __init__(self, vocabulary: Optional[List[str]] = None):
        self.vocabulary = list(vocabulary or DEFAULT_POSTAL_VOCAB)
        self._vocab_lower = {v.lower(): v for v in self.vocabulary}

    def update_vocabulary(self, terms: List[str]):
        for t in terms:
            if t and len(t) > 3:
                self._vocab_lower[t.lower()] = t

    def normalize(self, raw_text: str) -> Tuple[str, Dict[str, str]]:
        if not raw_text:
            return "", {}

        # 1. Unicode NFKD normalization
        text = unicodedata.normalize("NFKD", raw_text)
        
        # 2. Strip noise: phones, emails, urls
        text = PHONE_REGEX.sub(" ", text)
        text = EMAIL_REGEX.sub(" ", text)
        text = URL_REGEX.sub(" ", text)
        
        # 3. Lowercase
        text = text.lower()
        
        # 4. Normalize punctuation
        text = PUNCT_REGEX.sub(" ", text)
        text = MULTI_SPACE_REGEX.sub(" ", text).strip()
        
        # 5. Expand abbreviations
        text = expand_abbreviations(text)
        text = MULTI_SPACE_REGEX.sub(" ", text).strip()

        # 6. Spell-checking / typo suggestion on tokens against vocabulary
        corrections: Dict[str, str] = {}
        if self._vocab_lower:
            words = text.split()
            corrected_words = []
            for w in words:
                # Only check words longer than 4 chars that are not digits
                if len(w) >= 5 and not w.isdigit() and w not in self._vocab_lower:
                    # Check closest match with high cutoff (score >= 82)
                    match = process.extractOne(
                        w,
                        self._vocab_lower.keys(),
                        scorer=fuzz.ratio,
                        score_cutoff=82
                    )
                    if match:
                        best_word, score, _ = match
                        corrections[w] = self._vocab_lower[best_word]
                        corrected_words.append(best_word)
                    else:
                        corrected_words.append(w)
                else:
                    corrected_words.append(w)
            text = " ".join(corrected_words)

        return text, corrections

normalizer = AddressNormalizer()
