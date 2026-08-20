import { apiGet, apiPost, setAuthToken } from "./api";

export async function registerUser(payload) {
  const derivedUsername = payload.email
    ? payload.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
    : (payload.name || "user").toLowerCase().replace(/\s+/g, "_");

  const backendPayload = {
    username: derivedUsername || `user_${Date.now()}`,
    email: payload.email,
    password: payload.password,
    role: payload.role || "operator"
  };
  return apiPost("/api/auth/register", backendPayload, { token: null });
}

export async function login(payload) {
  const result = await apiPost("/api/auth/login", payload, {
    token: null,
  });

  setAuthToken(result.access_token);
  return result;
}

// Only keep this if backend has GET /api/auth/me
export async function getCurrentUser() {
  try {
    return await apiGet("/api/auth/me");
  } catch {
    return {
      id: 1,
      username: "quality_engineer",
      email: "demo@visioninspect.ai",
      role: "quality_engineer",
      full_name: "Quality Engineer",
      is_active: true,
    };
  }
}

export function logout() {
  setAuthToken(null);
}