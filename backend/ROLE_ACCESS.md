# Backend Role Access

Supported roles are:

- `quality_inspector` - upload files, run inspections, and view own inspection history/results
- `quality_engineer` - all Quality Inspector access plus update inspections, analytics, and dataset read access
- `admin` - access to all current backend API groups

The role is returned by both `POST /api/auth/login` and `GET /api/auth/me` in `user.role`. It is also included in the JWT.

## API Matrix

| API | Quality Inspector | Quality Engineer | Admin |
|---|---:|---:|---:|
| `POST /api/auth/register` | Public | Public | Public |
| `POST /api/auth/login` | Public | Public | Public |
| `GET /api/auth/me` | Yes | Yes | Yes |
| `POST /api/upload` | Yes | Yes | Yes |
| `GET /api/inspection` | Yes | Yes | Yes |
| `POST /api/inspection` | Yes | Yes | Yes |
| `POST /api/inspection/image` | Yes | Yes | Yes |
| `GET /api/inspection/<id>` | Own records | Own records | Own records |
| `PUT /api/inspection/<id>` | No | Own records | Own records |
| `GET /api/history` | Own records | Own records | Own records |
| `GET /api/history/<id>` | Own records | Own records | Own records |
| `GET /api/analytics` | No | Yes | Yes |
| `GET /api/analytics/by-status` | No | Yes | Yes |
| `GET /api/dataset` | No | Yes | Yes |
| `GET /api/dataset/<category>/files` | No | Yes | Yes |

Unauthorized requests return `401`. Authenticated users with insufficient role permissions return `403` and the response includes the current role.

## Demo Credentials

All three accounts use password `VisionInspect123!`:

| Username | Role | Email |
|---|---|---|
| `inspector.demo` | `quality_inspector` | `inspector.demo@visioninspect.local` |
| `engineer.demo` | `quality_engineer` | `engineer.demo@visioninspect.local` |
| `admin.demo` | `admin` | `admin.demo@visioninspect.local` |

Seed or reset them with:

```powershell
Push-Location backend
python seed_demo_users.py
Pop-Location
```

These are local demo credentials only. Production deployments should use hashed passwords and environment-managed account provisioning.

## Login Example

```json
{
  "message": "logged in",
  "access_token": "<JWT>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "inspector.demo",
    "email": "inspector.demo@visioninspect.local",
    "role": "quality_inspector"
  }
}
```
