import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const facultyInspectorNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/inspection', label: 'Create Inspection' },
  { to: '/history', label: 'Inspection History' },
]

const qualityEngineerNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/inspection', label: 'All Inspections' },
  { to: '/history', label: 'History' },
  { to: '/analytics', label: 'Analytics' },
]

export default function Sidebar() {
  const { user, logoutUser } = useAuth()
  const navItems = user?.role === 'Faculty Inspector' ? facultyInspectorNav : qualityEngineerNav
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

    </aside>
  )
}