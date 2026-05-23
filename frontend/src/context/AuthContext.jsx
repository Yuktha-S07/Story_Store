import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  useEffect(() => {
    const handleAuthInvalid = (event) => {
      const message = event?.detail?.message || 'Your session expired. Please sign in again.'
      setToken(null)
      setUser(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      window.dispatchEvent(
        new CustomEvent('story-store:toast', {
          detail: { message, type: 'info' },
        }),
      )
    }

    window.addEventListener('story-store:auth-invalid', handleAuthInvalid)
    return () => window.removeEventListener('story-store:auth-invalid', handleAuthInvalid)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    const { access_token, user: userData } = res.data
    setToken(access_token)
    setUser(userData)
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    return res
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  const register = async (payload) => {
    return api.post('/api/auth/register', payload)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
