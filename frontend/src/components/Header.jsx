import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { checkBackendHealth } from '../services/api.js'
import eyeLogo from '../assets/eye-logo.png'

export default function Header() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const [isOnline, setIsOnline] = useState(null)

  useEffect(() => {
    let mounted = true

    async function check() {
      const result = await checkBackendHealth()
      if (mounted) setIsOnline(result)
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
    navigate('/login')
  }

  const navItems =
  user?.role === 'Faculty Inspector'
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/inspection', label: 'Inspection' },
        { to: '/history', label: 'History' },
        { to: '/reports', label: 'Reports' },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/inspection', label: 'Inspection' },
        { to: '/history', label: 'History' },
        { to: '/analytics', label: 'Analytics' },
        { to: '/reports', label: 'Reports' },
      ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700">
      
      <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">

        {/* ================= LOGO ================= */}
        <div className="flex items-center gap-3">

          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src={eyeLogo}
              alt="VisionInspect AI"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-wide">
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
        <div className="flex items-center gap-5">

          {/* Operator Name & Role */}
          <div className="text-right">

            <h3 className="text-white font-semibold text-base">
              {user?.name || 'Himabindhu Ravuri'}
            </h3>

            <p className="text-xs uppercase tracking-[2px] text-blue-400 mt-1">
              {user?.role || 'Quality Engineer'}
            </p>

          </div>


          {/* ================= LOGOUT ICON ================= */}
          <button
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-800 border border-gray-700 hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
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
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>

          </button>

        </div>

      </div>

    </header>
  )
}