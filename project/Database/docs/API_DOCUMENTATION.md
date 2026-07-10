# VisionInspect-AI Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Endpoints

### Authentication (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- **Request:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "registered",
    "user": {
      "id": 1,
      "username": "string",
      "email": "string"
    }
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Request:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "logged in",
    "user": {
      "id": 1,
      "username": "string",
      "email": "string"
    }
  }
  ```

---

### File Upload (`/api/upload`)

#### Upload Image
- **POST** `/api/upload`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file` (required): Image file (.jpg, .png, .bmp, .tiff)
- **Response:** `201 Created`
  ```json
  {
    "message": "uploaded",
    "filename": "string",
    "path": "string"
  }
  ```

---

### Inspection (`/api/inspection`)

#### List All Inspections
- **GET** `/api/inspection`
- **Response:** `200 OK`
  ```json
  [
    {
      "id": 1,
      "filename": "string",
      "status": "pending|completed|error",
      "score": 0.0,
      "created_at": "2024-01-01T00:00:00"
    }
  ]
  ```

#### Create Inspection
- **POST** `/api/inspection`
- **Request:**
  ```json
  {
    "filename": "string",
    "status": "pending",
    "score": 0.0,
    "user_id": 1
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "id": 1,
    "filename": "string",
    "status": "pending",
    "score": 0.0,
    "user_id": 1
  }
  ```

#### Get Inspection Details
- **GET** `/api/inspection/<id>`
- **Response:** `200 OK`
  ```json
  {
    "id": 1,
    "filename": "string",
    "status": "string",
    "score": 0.0,
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00"
  }
  ```

#### Update Inspection
- **PUT** `/api/inspection/<id>`
- **Request:**
  ```json
  {
    "status": "completed",
    "score": 0.85
  }
  ```
- **Response:** `200 OK`

---

### Analytics (`/api/analytics`)

#### Get Summary Analytics
- **GET** `/api/analytics`
- **Response:** `200 OK`
  ```json
  {
    "summary": {
      "total_inspections": 10,
      "average_score": 0.72,
      "max_score": 0.95,
      "min_score": 0.15
    }
  }
  ```

#### Get Analytics by Status
- **GET** `/api/analytics/by-status`
- **Response:** `200 OK`
  ```json
  {
    "by_status": [
      {
        "status": "completed",
        "count": 8
      },
      {
        "status": "pending",
        "count": 2
      }
    ]
  }
  ```

---

### History (`/api/history`)

#### Get Inspection History
- **GET** `/api/history`
- **Query Parameters:**
  - `limit` (default: 50): Number of records to return
  - `offset` (default: 0): Number of records to skip
- **Response:** `200 OK`
  ```json
  {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "results": [
      {
        "id": 1,
        "user_id": 1,
        "filename": "string",
        "status": "completed",
        "score": 0.85,
        "created_at": "2024-01-01T00:00:00"
      }
    ]
  }
  ```

#### Get Specific Inspection
- **GET** `/api/history/<id>`
- **Response:** `200 OK`
  ```json
  {
    "id": 1,
    "user_id": 1,
    "filename": "string",
    "status": "completed",
    "score": 0.85,
    "created_at": "2024-01-01T00:00:00"
  }
  ```

---

### Dataset (`/api/dataset`)

#### List Dataset Categories
- **GET** `/api/dataset`
- **Response:** `200 OK`
  ```json
  {
    "dataset_root": "/path/to/dataset",
    "categories": ["bottle", "cable", "capsule", ...]
  }
  ```

#### Get Category Files
- **GET** `/api/dataset/<category>/files`
- **Query Parameters:**
  - `split` (default: train): "train" or "test"
- **Response:** `200 OK`
  ```json
  {
    "category": "bottle",
    "split": "train",
    "files": ["image1.jpg", "image2.jpg", ...]
  }
  ```

---

## Error Responses

All endpoints may return error responses:

### 400 Bad Request
```json
{
  "error": "Description of what went wrong"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., user already exists)
- `500 Internal Server Error`: Server-side error

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_PATH=../instance/backend.db
DATASET_ROOT=../ai/dataset
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```
