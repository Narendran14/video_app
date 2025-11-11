import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.role) setUser(parsed)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const login = (payload) => {
    const data = typeof payload === 'string' ? { role: payload } : payload
    if (!data?.role) return
    const normalized = {
      role: data.role,
      email: data.email || '',
      name: data.name || ''
    }
    setUser(normalized)
    try { localStorage.setItem('user', JSON.stringify(normalized)) } catch (e) {}
  }

  const logout = () => {
    setUser(null)
    try { localStorage.removeItem('user') } catch (e) {}
  }

  const role = user?.role || null

  return (
    <AuthContext.Provider value={{ role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
