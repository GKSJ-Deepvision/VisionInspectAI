const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, { method: 'OPTIONS' })
    return true
  } catch (err) {
    return false
  }
}

export async function getAnalytics(token) {
  const res = await fetch(`${BASE_URL}/api/analytics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to load analytics')
  }

  return res.json()
}

export async function getAnalyticsByStatus(token) {
  const res = await fetch(`${BASE_URL}/api/analytics/by-status`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to load analytics by status')
  }

  return res.json()
}

export async function loginRequest(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    throw new Error('Invalid username or password')
  }

  return res.json() // { message, access_token, token_type, user: { id, username, email } }
}
export async function registerRequest(username, password, email) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  })

  if (!res.ok) {
    throw new Error('Registration failed — username may already exist')
  }

  return res.json()
}


// Pretends to call the backend's /api/inspect endpoint
export async function inspectImage(file, category, token) {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("category", category);

  const res = await fetch(`${BASE_URL}/api/inspection/predict`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "Inspection failed");
  }

  return data.data ?? data;
}
export async function getInspectionHistory(token, params = {}) {
  const query = new URLSearchParams({
    limit: 50,
    offset: 0,
    ...params,
  })

  const res = await fetch(
    `${BASE_URL}/api/history?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error('Failed to load inspection history')
  }

  return res.json()
}
export async function saveInspection(record) {
  const existing = JSON.parse(localStorage.getItem('vi_inspections') || '[]')
  const updated = [record, ...existing].slice(0, 50)
  localStorage.setItem('vi_inspections', JSON.stringify(updated))
  return updated
}
export async function getReports(token) {
  const res = await fetch(`${BASE_URL}/api/reports`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load reports");
  }

  return res.json();
}


export async function exportReportsCSV(token, filters = {}) {
  const params = new URLSearchParams({ format: "csv", ...filters })

  const res = await fetch(`${BASE_URL}/api/reports/export?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to export report")
  }

  return res.blob()
}