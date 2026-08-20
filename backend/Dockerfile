FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libxcb1 \
    libxext6 \
    libsm6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY AI/ ./AI/

RUN mkdir -p /app/backend/uploads /app/backend/outputs/heatmaps /app/backend/instance

WORKDIR /app/backend

EXPOSE 5000

CMD ["sh", "-c", "python download_models.py && python app.py"]