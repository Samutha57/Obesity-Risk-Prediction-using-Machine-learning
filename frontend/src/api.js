const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(url, options) {
  try {
    const res = await fetch(url, options)
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
    return await res.json()
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to backend API server (http://localhost:8000). Please start the FastAPI backend.')
    }
    throw err
  }
}

export function predict(payload) {
  return request(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function compare() {
  return request(`${BASE}/compare`)
}

export function featureImportance() {
  return request(`${BASE}/feature-importance`)
}

export function confusionMatrix() {
  return request(`${BASE}/confusion-matrix`)
}

export function recommend(obesityLevel) {
  return request(`${BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ obesity_level: obesityLevel }),
  })
}

export function loginApi(email, password) {
  return request(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function signupApi(name, email, password) {
  return request(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
}
