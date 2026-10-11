import logging
import sys
import re

# Redact potential sensitive tokens such as full phone numbers, emails, credit cards
PHONE_RE = re.compile(r'\b(?:\+91|91)?[6-9]\d{9}\b')
EMAIL_RE = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')

class AddressSanitizingFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        orig = super().format(record)
        # Redact phones and emails from logs
        orig = PHONE_RE.sub('[REDACTED_PHONE]', orig)
        orig = EMAIL_RE.sub('[REDACTED_EMAIL]', orig)
        return orig

def setup_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        AddressSanitizingFormatter(
            "%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    )
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.handlers = [handler]
    
    # Silence noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

logger = logging.getLogger("postaliq")
