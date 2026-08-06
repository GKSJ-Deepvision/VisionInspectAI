import { createContext, useContext, useState, useEffect } from 'react'
import { loginRequest } from '../services/api.js'

const AuthContext = createContext(null)

// ============================================================
// ROLE-BASED PERMISSIONS
//
// Quality Inspector:
// - Dashboard
// - Perform Image Inspection
// - View own History
//
// Factory Supervisor:
// - Dashboard
// - View all Inspectors' History
// - View Analytics
// - View Reports
// ============================================================

const ROLE_PERMISSIONS = {
quality_inspector: [
'dashboard',
'inspection',
'history',
],

factory_supervisor: [
'dashboard',
'history',
'analytics',
'reports',
],
}

export function AuthProvider({ children }) {
const [user, setUser] = useState(() => {
try {
const saved = localStorage.getItem('vi_user')


  return saved
    ? JSON.parse(saved)
    : null

} catch (error) {
  console.error(
    'Failed to load saved user:',
    error
  )

  return null
}


})

// ==========================================================
// SAVE USER WHEN USER STATE CHANGES
// ==========================================================

useEffect(() => {
if (user) {
localStorage.setItem(
'vi_user',
JSON.stringify(user)
)
} else {
localStorage.removeItem(
'vi_user'
)
}
}, [user])

// ==========================================================
// LOGIN
// ==========================================================

async function loginUser({
username,
password,
}) {
const data = await loginRequest(
username,
password
)


const loggedInUser = {
  name: data.user.username,
  email: data.user.email,
  token: data.access_token,
  role: data.user.role,
}

setUser(loggedInUser)

return loggedInUser


}

// ==========================================================
// LOGOUT
// ==========================================================

function logoutUser() {
setUser(null)


localStorage.removeItem(
  'vi_user'
)


}

// ==========================================================
// CHECK PAGE PERMISSION
// ==========================================================

function hasPermission(permission) {
if (!user?.role) {
return false
}


const permissions =
  ROLE_PERMISSIONS[user.role] || []

return permissions.includes(
  permission
)


}

// ==========================================================
// CHECK USER ROLE
// ==========================================================

function hasRole(...roles) {
if (!user?.role) {
return false
}


return roles.includes(
  user.role
)


}

// ==========================================================
// GET USER PERMISSIONS
// ==========================================================

function getUserPermissions() {
if (!user?.role) {
return []
}


return (
  ROLE_PERMISSIONS[user.role] || []
)


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
return useContext(
AuthContext
)
}
