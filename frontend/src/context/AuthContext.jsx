import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'
import { ensureKeyPair, publicKeyString } from '../utils/messageCrypto'

export const AuthContext = createContext()

const keyPublishedFor = new Set()

async function publishEncryptionKey(userId) {
  try {
    const kp = await ensureKeyPair(userId)
    if (!kp || !api.defaults.headers.common['Authorization']) return
    await api.put('/api/users/me/encryption-key', { public_key: publicKeyString(kp.publicJwk) })
  } catch (err) {
    console.warn('Failed to publish encryption key:', err)
  }
}

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
    if (user?._id && token && !keyPublishedFor.has(user._id)) {
      keyPublishedFor.add(user._id)
      publishEncryptionKey(user._id)
    }
  }, [user, token])

  useEffect(() => {
    const handleAuthInvalid = (event) => {
      setToken(null)
      setUser(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
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
