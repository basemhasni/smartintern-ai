FROM python:3.11.9-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    APP_ENV=production \
    PORT=8000 \
    SMARTINTERN_ALLOW_MODEL_DOWNLOAD=false \
    RAG_ALLOW_MODEL_DOWNLOAD=false

WORKDIR /app

RUN groupadd --gid 10001 smartintern \
  && useradd --uid 10001 --gid smartintern --no-create-home --home-dir /app --shell /usr/sbin/nologin smartintern

COPY requirements.txt ./
RUN python -m pip install --no-cache-dir --requirement requirements.txt

COPY --chown=smartintern:smartintern app ./app

USER smartintern

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.getenv('PORT', '8000') + '/health', timeout=3)"

CMD ["sh", "-c", "exec python -m uvicorn app.main:app --host 0.0.0.0 --port \"${PORT:-8000}\""]
