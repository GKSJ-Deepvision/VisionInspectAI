import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Layout from '../components/Layout.jsx'
import loginBg from '../assets/login-background.png'

function StatCard({ label, value, color }) {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <h3 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h3>
    </div>
  )
}

function ActionCard({ title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-blue-400 transition-all"
    >
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400 mt-2">{desc}</p>
    </button>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const history = []

  const total = history.length
  const failed = history.filter(h => h.result === 'FAIL').length
  const passed = total - failed
  const critical = history.filter(
    h => h.severity?.level === 'Critical'
  ).length

  return (
    <Layout>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(5,10,25,.75),rgba(5,10,25,.82)),url(${loginBg})`
        }}
      >
        <div className="max-w-7xl mx-auto px-8 pt-10 pb-8">

          {/* Hero Section */}
          <section className="rounded-3xl bg-black/35 backdrop-blur-md border border-white/10 p-8">

            <p className="text-blue-400 uppercase tracking-[0.3em] text-sm">
              VisionInspect AI
            </p>

            <h1 className="text-4xl font-bold text-white mt-4 leading-tight">
              Manufacturing Defect Detection
              <br />
              & Quality Inspection System
            </h1>

            <p className="text-gray-300 mt-6 max-w-2xl text-lg">
              Welcome {user?.name}. Perform AI-powered inspections, monitor
              quality and review inspection history from one place.
            </p>

            <div className="mt-8">
              <button
                onClick={() => navigate('/inspection')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
              >
                Start Inspection
              </button>
            </div>

          </section>

          {/* Quick Actions */}
          <section className="mt-8">

            <h2 className="text-white text-2xl font-semibold mb-5">
              Quick Actions
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              <ActionCard
                title="New Inspection"
                desc="Upload a component image and start inspection."
                onClick={() => navigate('/inspection')}
              />

              <ActionCard
                title="Inspection History"
                desc="Review previous inspection records."
                onClick={() => navigate('/history')}
              />

              <ActionCard
                title="Analytics"
                desc="View inspection statistics and trends."
                onClick={() => navigate('/analytics')}
              />

            </div>

          </section>

          {/* Inspection Overview */}
          <section className="mt-8">

            <h2 className="text-white text-2xl font-semibold mb-5">
              Inspection Overview
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

              <StatCard
                label="Total Inspected"
                value={total}
                color="text-blue-400"
              />

              <StatCard
                label="Passed"
                value={passed}
                color="text-green-400"
              />

              <StatCard
                label="Failed"
                value={failed}
                color="text-red-400"
              />

              <StatCard
                label="Critical"
                value={critical}
                color="text-yellow-400"
              />

            </div>

          </section>

        </div>
      </div>
    </Layout>
  )
}