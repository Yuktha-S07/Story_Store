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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const detail = error?.response?.data?.detail
    const message = typeof detail === 'string' ? detail.toLowerCase() : ''

    if (status === 401 || status === 403 || message.includes('invalid token') || message.includes('not authenticated')) {
      window.localStorage.removeItem('access_token')
      window.localStorage.removeItem('user')
      window.dispatchEvent(
        new CustomEvent('story-store:auth-invalid', {
          detail: {
            message: 'Your session expired. Please sign in again.',
          },
        }),
      )
    }

    return Promise.reject(error)
  },
)

export default api
