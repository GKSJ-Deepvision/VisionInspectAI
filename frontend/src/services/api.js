const BASE_URL = 'http://localhost:5000'

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, { method: 'OPTIONS' })
    return true
  } catch (err) {
    return false
  }
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
const DEFECT_TYPES = [
  { type: 'Surface Scratch', typeScore: 35 },
  { type: 'Surface Crack', typeScore: 95 },
  { type: 'Missing Component', typeScore: 90 },
  { type: 'Discoloration', typeScore: 25 },
  { type: 'Dent', typeScore: 60 },
]

function computeSeverity({ size, location, defectType, confidence }) {
  const score = size * 0.3 + location * 0.25 + defectType * 0.25 + confidence * 0.2
  let level = 'Low'
  if (score >= 80) level = 'Critical'
  else if (score >= 60) level = 'High'
  else if (score >= 40) level = 'Medium'
  return { score: Math.round(score), level }
}

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

// Pretends to call the backend's /api/inspect endpoint
export async function inspectImage(file) {
  await new Promise((resolve) => setTimeout(resolve, 1500)) // fakes network + AI processing time

  const defect = DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)]
  const size = randomBetween(20, 95)
  const location = randomBetween(20, 95)
  const confidence = randomBetween(65, 99)
  const severity = computeSeverity({ size, location, defectType: defect.typeScore, confidence })

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    defectType: defect.type,
    severity,
    result: severity.level === 'Critical' || severity.level === 'High' ? 'FAIL' : 'PASS',
    confidence,
    inspectedAt: new Date().toISOString(),
  }
}
export async function getInspectionHistory() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return JSON.parse(localStorage.getItem('vi_inspections') || '[]')
}

export async function saveInspection(record) {
  const existing = JSON.parse(localStorage.getItem('vi_inspections') || '[]')
  const updated = [record, ...existing].slice(0, 50)
  localStorage.setItem('vi_inspections', JSON.stringify(updated))
  return updated
}