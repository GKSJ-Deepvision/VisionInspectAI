import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vi_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('vi_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('vi_user')
    }
  }, [user])

  function loginUser({ name, role }) {
    const fakeToken = btoa(`${name}:${role}:${Date.now()}`)
    setUser({ name, role, token: fakeToken })
  }

  function logoutUser() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}