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
      setToken(null)
      setUser(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
    }

    const handleTokenRefreshed = () => {
      setToken(localStorage.getItem('access_token') || null)
    }

    window.addEventListener('story-store:auth-invalid', handleAuthInvalid)
    window.addEventListener('story-store:token-refreshed', handleTokenRefreshed)
    return () => {
      window.removeEventListener('story-store:auth-invalid', handleAuthInvalid)
      window.removeEventListener('story-store:token-refreshed', handleTokenRefreshed)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    const { access_token, refresh_token, user: userData } = res.data
    setToken(access_token)
    setUser(userData)
    localStorage.setItem('access_token', access_token)
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('user', JSON.stringify(userData))
    return res
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  const updateUser = (updatedUser) => {
    if (!updatedUser) return
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const register = async (payload) => {
    return api.post('/api/auth/register', payload)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
