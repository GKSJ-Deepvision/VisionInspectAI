# VisionInspect AI — Frontend (Week 1 & 2 milestone)

Frontend for the manufacturing defect detection & quality inspection platform.

## What's built
- **Login page** (`/login`) — role selection (Quality Engineer / Factory Supervisor), auth form. Currently issues a mock token in the browser so the rest of the UI can be demoed; swap in the real `/auth/login` API call once the backend team exposes it.
- **Inspection dashboard** (`/dashboard`) — image upload (drag-and-drop or click), inspection run trigger, and a live log table showing defect type, severity score/level, and pass/reject decision.
- Severity scoring on the frontend currently uses a **mock calculation** that mirrors the spec's formula (Size×30% + Location×25% + Defect Type×25% + Confidence×20%) with random inputs, purely so the UI has real numbers to render. Replace with the actual model output once the detection API is ready.

## Stack
Next.js 14 (pages router) + Tailwind CSS, no backend calls yet — everything is wired to run standalone for demo purposes.

## Run locally
```bash
npm install
npm run dev
```
Visit http://localhost:3000 — it redirects to `/login`.

## Next steps / TODO for integration
- Replace mock token logic in `pages/login.js` with a real POST to the auth endpoint.
- Replace `runMockInspection()` in `pages/dashboard.js` with a real call to the defect detection API, passing the uploaded image.
- Add role-based route guarding once backend roles/permissions are finalized.
