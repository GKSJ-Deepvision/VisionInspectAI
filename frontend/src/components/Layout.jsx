import Header from './Header.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">

      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        {children}
      </main>

    </div>
  )
}