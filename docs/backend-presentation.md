# VisionInspectAI Backend Presentation

Target time: 3-4 minutes

## 0:00-0:30 - Backend role

"My part is the backend for VisionInspectAI. It exposes a Flask REST API that connects the frontend to authentication, image uploads, AI inspection, persistent inspection history, and analytics. The backend stores users and inspection results in SQLite and returns JSON responses to the React frontend."

Main entry point: [backend/app.py](../backend/app.py)

## 0:30-1:20 - Request flow

Show [backend/routes/inspection.py](../backend/routes/inspection.py), especially `inspect_image`:

1. The request must include a valid JWT Bearer token.
2. The uploaded filename is cleaned with `secure_filename`.
3. The image is saved in the configured upload directory.
4. `run_inference` processes the saved image.
5. The result is stored with the authenticated user's ID.
6. The API returns the inspection status, score, filename, user ID, and database ID.

Short explanation:

"The user ID comes from the verified token, not from request JSON. That prevents one user from creating or reading another user's inspection records."

## 1:20-2:00 - Authentication and API structure

Show [backend/routes/auth.py](../backend/routes/auth.py):

- `POST /api/auth/register` creates a user and returns a 24-hour JWT.
- `POST /api/auth/login` verifies credentials and returns a JWT.
- `GET /api/auth/me` validates the token and returns the current profile.

Registered API groups in [backend/app.py](../backend/app.py):

- `/api/auth` - registration, login, current user
- `/api/upload` - authenticated file upload
- `/api/inspection` - create, upload-and-inspect, list, read, update
- `/api/history` - previous results
- `/api/analytics` - summary and results grouped by status
- `/api/dataset` - dataset operations when available

## 2:00-2:40 - AI service and persistence

Show [backend/services/inference.py](../backend/services/inference.py):

"The inference service is isolated behind `run_inference`, so the API does not need to know model details. At the moment, the service loads the image and uses a placeholder score based on average pixel intensity. The intended replacement point is `compute_anomaly_score`, where the trained PatchCore model can be connected without changing the API contract."

Show the tables initialized in [backend/app.py](../backend/app.py):

- `users`: identity, email, role, and credentials
- `inspection_results`: owner, filename, status, score, timestamp

## 2:40-3:20 - Security and test evidence

Point to [backend/tests/test_backend.py](../backend/tests/test_backend.py):

- Registration and login return authenticated users.
- Stored roles are preserved at login.
- History and analytics are isolated per user.
- A user cannot read or update another user's inspection.
- Malformed JWT subjects are rejected with `401`.
- Uploads require authentication and sanitize unsafe filenames.
- Image inspection persists the authenticated user ID.

Test command:

```powershell
cd VisionInspectAI-main\backend
python -m pytest tests/test_backend.py -q
```

Observed result:

```text
8 passed in 0.71s
```

## Optional 20-second demo

1. Register or log in from the frontend.
2. Upload an image on the Inspection page.
3. Show the returned status and score.
4. Open History and Analytics to show that the saved result appears there.

Useful endpoint examples:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/inspection/image
GET  /api/history
GET  /api/analytics
```

## Closing sentence

"So the backend provides the secure application workflow around the AI model: it authenticates users, processes and records inspections, isolates each user's data, and exposes history and analytics for the frontend."

## Presenter note

Do not describe the current score as a production PatchCore prediction. The integration point exists, but the current implementation explicitly uses a placeholder image-statistics score until the trained model is wired in.
