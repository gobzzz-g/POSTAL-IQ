FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY backend/ ./backend/
COPY data/ ./data/

# Install backend dependencies via uv
RUN uv pip install --system \
    fastapi uvicorn pydantic pydantic-settings sqlalchemy psycopg2-binary \
    alembic scikit-learn pandas numpy rapidfuzz python-multipart pyjwt bcrypt \
    email-validator

# Run dataset import & train ranker
RUN python -m backend.scripts.import_dataset && python -m backend.scripts.train_model

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
