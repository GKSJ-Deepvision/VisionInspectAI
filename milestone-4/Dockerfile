FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV and Anomalib
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies and explicitly install opencv headless
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir opencv-python-headless

# Copy the entire backend folder, including the ai module and results (trained weights)
COPY . .

# Ensure the uploads directory exists
RUN mkdir -p /app/uploads

# Expose FastAPI port
EXPOSE 8000

# Start Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
