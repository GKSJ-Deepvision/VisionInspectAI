import { createContext, useContext, useState, useEffect } from 'react'
import { loginRequest } from '../services/api.js'

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

 async function loginUser({ username, password }) {
  const data = await loginRequest(username, password)
  setUser({
    name: data.user.username,
    email: data.user.email,
    token: data.access_token,
  })
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