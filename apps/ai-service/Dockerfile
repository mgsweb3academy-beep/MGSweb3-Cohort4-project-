FROM python:3.12-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY apps/ai-service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/ai-service/ ./

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
