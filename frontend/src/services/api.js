import axios from 'axios'

// Dynamically resolve API URL: use configured value, or same host as frontend (works via Vite proxy from any device)
const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('access_token')

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = window.localStorage.getItem('refresh_token')
  if (!refreshToken) return false

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/api/auth/refresh`, { refresh_token: refreshToken })
      .then((res) => {
        const newAccessToken = res.data?.access_token
        if (newAccessToken) {
          window.localStorage.setItem('access_token', newAccessToken)
          window.dispatchEvent(new CustomEvent('story-store:token-refreshed'))
          return true
        }
        return false
      })
      .catch((err) => {
        console.error('Token refresh failed:', err?.response?.status)
        return false
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function handleAuthInvalid() {
  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('refresh_token')
  window.localStorage.removeItem('user')
  window.dispatchEvent(
    new CustomEvent('story-store:auth-invalid', {
      detail: {
        message: 'Your session expired. Please sign in again.',
      },
    }),
  )
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config
    const status = error?.response?.status
    const detail = error?.response?.data?.detail
    const message = typeof detail === 'string' ? detail.toLowerCase() : ''

    const isAuthError = status === 401 || status === 403 || message.includes('invalid token') || message.includes('not authenticated')

    if (!isAuthError || !original || original._retry) {
      return Promise.reject(error)
    }

    // Try to refresh the access token once with the refresh token
    const canRefresh = await refreshAccessToken()
    if (canRefresh) {
      original._retry = true
      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${window.localStorage.getItem('access_token')}`
      return api(original)
    }

    handleAuthInvalid()
    return Promise.reject(error)
  },
)

export default api
