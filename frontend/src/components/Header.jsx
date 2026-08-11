import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { checkBackendHealth } from '../services/api.js'
import eyeLogo from '../assets/eye-logo.png'

export default function Header() {
const { user, logoutUser, hasPermission } = useAuth()
const navigate = useNavigate()

const [isOnline, setIsOnline] = useState(null)
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

useEffect(() => {
let mounted = true


async function check() {
  const result = await checkBackendHealth()

  if (mounted) {
    setIsOnline(result)
  }
}

check()

const interval = setInterval(check, 10000)

return () => {
  mounted = false
  clearInterval(interval)
}


}, [])

function handleLogout() {
logoutUser()
setMobileMenuOpen(false)
navigate('/login')
}

// Navigation items based on user permissions
const allNavItems = [
{
to: '/dashboard',
label: 'Dashboard',
permission: 'dashboard',
},
{
to: '/inspection',
label: 'Inspection',
permission: 'inspection',
},
{
to: '/history',
label: 'History',
permission: 'history',
},
{
to: '/analytics',
label: 'Analytics',
permission: 'analytics',
},
{
to: '/reports',
label: 'Reports',
permission: 'reports',
},
]

// Only show navigation items the current user has permission to access
const navItems = allNavItems.filter((item) =>
hasPermission(item.permission)
)

return ( <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700">


  <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between">

    {/* ================= LOGO ================= */}
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">

      <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
        <img
          src={eyeLogo}
          alt="VisionInspect AI"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="min-w-0">
        <h1 className="text-lg sm:text-2xl font-extrabold tracking-wide truncate">
          <span className="text-white">
            VisionInspect
          </span>{' '}

          <span className="text-blue-400">
            AI
          </span>
        </h1>

        {/* Backend Status */}
        <div className="flex items-center gap-2 text-xs mt-1">

          <span
            className={`w-2 h-2 rounded-full ${
              isOnline === null
                ? 'bg-gray-500'
                : isOnline
                ? 'bg-green-400 animate-pulse'
                : 'bg-red-400 animate-pulse'
            }`}
          />

          <span
            className={
              isOnline
                ? 'text-green-400 font-medium'
                : isOnline === null
                ? 'text-gray-400'
                : 'text-red-400 font-medium'
            }
          >
            {isOnline === null
              ? 'Checking...'
              : isOnline
              ? 'Backend Online'
              : 'Backend Offline'}
          </span>

        </div>
      </div>

    </div>


    {/* ================= NAVIGATION ================= */}
    <nav className="hidden md:flex items-center gap-6">

      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}

    </nav>


    {/* ================= USER SECTION ================= */}
    <div className="flex items-center gap-3 sm:gap-5">

      {/* Operator Name & Role */}
      <div className="text-right hidden sm:block">

        <h3 className="text-white font-semibold text-base">
          {user?.name || 'Himabindhu Ravuri'}
        </h3>

        <p className="text-xs uppercase tracking-[2px] text-blue-400 mt-1">
          {{
            quality_inspector: 'Quality Inspector',
            factory_supervisor: 'Factory Supervisor',
          }[user?.role] || 'Quality Inspector'}
        </p>

      </div>


      {/* ================= LOGOUT ICON ================= */}
      <button
        onClick={handleLogout}
        title="Logout"
        aria-label="Logout"
        className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded-xl bg-gray-800 border border-gray-700 hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
      >

        {/* Door + Arrow Logout Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />

          <polyline points="10 17 15 12 10 7" />

          <line
            x1="15"
            y1="12"
            x2="3"
            y2="12"
          />
        </svg>

      </button>

      {/* ================= MOBILE MENU TOGGLE ================= */}
      <button
        onClick={() => setMobileMenuOpen((open) => !open)}
        title="Menu"
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
        className="md:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {mobileMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

    </div>

  </div>

  {/* ================= MOBILE NAVIGATION PANEL ================= */}
  {mobileMenuOpen && (
    <nav className="md:hidden border-t border-gray-700 bg-gray-900/98 backdrop-blur-md px-4 py-3 flex flex-col gap-1">

      {/* Operator name shown here on mobile since it's hidden in the header row */}
      <div className="sm:hidden px-2 pb-2 mb-1 border-b border-gray-800">
        <h3 className="text-white font-semibold text-sm">
          {user?.name || 'Himabindhu Ravuri'}
        </h3>
        <p className="text-xs uppercase tracking-[2px] text-blue-400 mt-1">
          {{
            quality_inspector: 'Quality Inspector',
            factory_supervisor: 'Factory Supervisor',
          }[user?.role] || 'Quality Inspector'}
        </p>
      </div>

      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}

    </nav>
  )}

</header>


)
}
