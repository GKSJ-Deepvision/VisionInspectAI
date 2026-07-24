import { createContext, useContext, useState, useEffect } from 'react'
import { loginRequest } from '../services/api.js'

const AuthContext = createContext(null)

// Role-based permissions
//
// Quality Inspector:
// - Can access Dashboard
// - Can perform Image Inspection
//
// Quality Engineer:
// - Can access Dashboard
// - Can perform Image Inspection
// - Can view History
// - Can view Analytics
// - Can view Reports
//
// Admin:
// - Has full access to all available modules
const ROLE_PERMISSIONS = {
  quality_inspector: [
    'dashboard',
    'inspection',
    'history',
  ],

  quality_engineer: [
    'dashboard',
    'inspection',
    'history',
    'analytics',
    'reports',
  ],

  admin: [
    'dashboard',
    'inspection',
    'history',
    'analytics',
    'reports',
    'admin',
  ],
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vi_user')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load saved user:', error)
      return null
    }
  })

  // Save user whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('vi_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('vi_user')
    }
  }, [user])

  // Login
  async function loginUser({ username, password }) {
    const data = await loginRequest(username, password)

    const loggedInUser = {
  name: data.user.username,
  email: data.user.email,
  token: data.access_token,
  role: data.user.role,
}

    setUser(loggedInUser)

    return loggedInUser
  }

  // Logout
  function logoutUser() {
    setUser(null)
    localStorage.removeItem('vi_user')
  }

  // Check if current user has permission for a specific page
  function hasPermission(permission) {
    if (!user?.role) {
      return false
    }

    const permissions = ROLE_PERMISSIONS[user.role] || []

    return permissions.includes(permission)
  }

  // Check if current user has one of the specified roles
  function hasRole(...roles) {
    if (!user?.role) {
      return false
    }

    return roles.includes(user.role)
  }

  // Get all permissions of current user
  function getUserPermissions() {
    if (!user?.role) {
      return []
    }

    return ROLE_PERMISSIONS[user.role] || []
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginUser,
        logoutUser,
        hasPermission,
        hasRole,
        getUserPermissions,
        ROLE_PERMISSIONS,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}