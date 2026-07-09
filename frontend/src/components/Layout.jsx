import Sidebar from './Sidebar/Sidebar.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}