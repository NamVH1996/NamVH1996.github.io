export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}

export const API_ENDPOINTS = {
  // Alert endpoints
  alerts: '/api/alerts',
  alertById: (id: string) => `/api/alerts/${id}`,
  alertStats: '/api/alerts/stats',

  // User endpoints (example)
  users: '/api/users',
  userById: (id: string) => `/api/users/${id}`,
}
