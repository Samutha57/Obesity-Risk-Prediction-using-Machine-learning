const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText
    try {
      const j = await res.json()
      detail = j.detail ?? JSON.stringify(j)
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }
  return res.json()
}

export function predict(payload) {
  return fetch(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handle)
}

export function compare() {
  return fetch(`${BASE}/compare`).then(handle)
}

export function featureImportance() {
  return fetch(`${BASE}/feature-importance`).then(handle)
}

export function confusionMatrix() {
  return fetch(`${BASE}/confusion-matrix`).then(handle)
}

export function recommend(obesityLevel) {
  return fetch(`${BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ obesity_level: obesityLevel }),
  }).then(handle)
}

export function loginApi(email, password) {
  return fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handle)
}

export function signupApi(name, email, password) {
  return fetch(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then(handle)
}
