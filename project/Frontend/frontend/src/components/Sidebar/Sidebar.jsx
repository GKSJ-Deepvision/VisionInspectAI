import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/inspection', label: 'Inspection' },
  { to: '/history', label: 'History' },
  { to: '/analytics', label: 'Analytics' },
]

export default function Sidebar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logoutUser()
    navigate('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-700">
        <p className="font-bold text-white text-sm">VisionInspect AI</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm transition ${
                isActive
                  ? 'bg-blue-400/10 text-blue-400'
                  : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">{user?.name}</p>
        <p className="text-[11px] text-gray-500 mb-3">{user?.role}</p>
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-400">
          Log out
        </button>
      </div>
    </aside>
  )
}