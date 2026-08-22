FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install base dependencies
COPY src/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install the lightweight CPU-only version of PyTorch
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy all source code into the container
COPY src /app/src
COPY src/backend /app

# Set PYTHONPATH to include all source directories for imports
ENV PYTHONPATH="/app:/app/src:/app/src/inference:/app/src/backend"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]