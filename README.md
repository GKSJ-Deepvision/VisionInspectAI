# VisionInspect AI — Frontend

## What's built
- **Login** (`/login`) — role selection (Quality Engineer / Factory Supervisor), mock auth token.
- **Quality Engineer dashboard** (`/dashboard`) — image upload, and a rich Inspection Result panel showing:
  - Uploaded image
  - "Processed" image with a simulated defect heatmap overlay
  - Prediction, confidence (with progress bar), severity score/level, pass/fail
  - A running inspection log table
- **Factory Supervisor dashboard** — plant-wide stats, 7-day trend, escalation queue with Approve/Escalate actions.

## Backend integration status
Everything currently runs on **mock data** in `lib/api.js`. The expected real API contract is documented at the top of that file — once the backend team confirms the actual `/api/upload` response shape, only `runInspection()` needs to change; no component needs edits.

Heatmap is currently a CSS-rendered overlay at a random position — swap for the backend's real heatmap image/coordinates once available. "Processed image" is currently the same uploaded image with a CSS filter applied as a placeholder — swap for the backend's actual processed image URL once available.

## Run locally
```bash
npm install
npm run dev
```
