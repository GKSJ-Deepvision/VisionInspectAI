import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Layout from '../components/Layout.jsx'
import { getAnalytics } from '../services/api.js'
import loginBg from '../assets/login-background.png'


function StatCard({ label, value, color }) {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5">

      <p className="text-gray-400 text-sm">
        {label}
      </p>

      <h3 className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </h3>

    </div>
  )
}


function ActionCard({ title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-blue-400 transition-all"
    >

      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="text-gray-400 mt-2">
        {desc}
      </p>

    </button>
  )
}


export default function Dashboard() {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [analytics, setAnalytics] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  const isFactorySupervisor =
    user?.role === 'factory_supervisor'



  useEffect(() => {

    async function loadDashboardData() {

      if (!user?.token) {

        setError(
          'Authentication token not found. Please login again.'
        )

        setLoading(false)
        return
      }


      try {

        setLoading(true)
        setError('')


        const response =
          await getAnalytics(user.token)


        console.log(
          "Dashboard Analytics:",
          response
        )


        setAnalytics(
          response.data?.summary
        )


      } catch (err) {

        console.error(
          "Dashboard error:",
          err
        )

        setError(
          err.message ||
          "Failed to load dashboard data."
        )

      } finally {

        setLoading(false)

      }

    }


    loadDashboardData()

  }, [user?.token])



  const formatScore = (score) => {

    if (
      score === undefined ||
      score === null
    )
      return '-'

    return `${Math.round(score * 100)}%`

  }



  return (

    <Layout>

      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            `linear-gradient(rgba(5,10,25,.75),rgba(5,10,25,.82)),url(${loginBg})`
        }}
      >


        <div className="max-w-7xl mx-auto px-8 pt-10 pb-8">


          {/* Hero */}

          <section className="rounded-3xl bg-black/35 backdrop-blur-md border border-white/10 p-8">


            <p className="text-blue-400 uppercase tracking-[0.3em] text-sm">
              VisionInspect AI
            </p>


            <h1 className="text-4xl font-bold text-white mt-4">

              Manufacturing Defect Detection
              <br />
              & Quality Inspection System

            </h1>


            <p className="text-gray-300 mt-6 max-w-2xl text-lg">

              Welcome {user?.name}.
              Perform AI-powered inspections, monitor quality
              and review inspection history from one place.

            </p>


            <div className="mt-8">

              <button
                onClick={() =>
                  navigate(
                    isFactorySupervisor
                    ? '/analytics'
                    : '/inspection'
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
              >

                {
                  isFactorySupervisor
                  ? "View Quality Overview"
                  : "Start Inspection"
                }

              </button>

            </div>


          </section>



          {/* Quick Actions */}

          <section className="mt-8">

            <h2 className="text-white text-2xl font-semibold mb-5">
              Quick Actions
            </h2>


            <div
              className={`grid gap-6 ${
                isFactorySupervisor
                ? "md:grid-cols-3"
                : "md:grid-cols-2"
              }`}
            >


              {!isFactorySupervisor && (

                <>

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

                </>

              )}



              {isFactorySupervisor && (

                <>

                  <ActionCard
                    title="Inspection History"
                    desc="Review inspection records from all quality inspectors."
                    onClick={() => navigate('/history')}
                  />


                  <ActionCard
                    title="Analytics"
                    desc="View inspection statistics and quality trends."
                    onClick={() => navigate('/analytics')}
                  />


                  <ActionCard
                    title="Reports"
                    desc="View and manage inspection reports."
                    onClick={() => navigate('/reports')}
                  />

                </>

              )}


            </div>

          </section>




          {/* Statistics */}

          <section className="mt-8">

            <h2 className="text-white text-2xl font-semibold mb-5">
              Inspection Overview
            </h2>



            {loading && (

              <div className="bg-black/40 rounded-xl p-8 text-center">

                <p className="text-blue-400">
                  Loading dashboard data...
                </p>

              </div>

            )}



            {!loading && error && (

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">

                <p className="text-red-400">
                  {error}
                </p>

              </div>

            )}




            {!loading && !error && analytics && (

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">


                <StatCard
                  label="Total Inspections"
                  value={analytics.total_inspections}
                  color="text-blue-400"
                />


                <StatCard
                  label="Average Score"
                  value={formatScore(analytics.average_score)}
                  color="text-green-400"
                />


                <StatCard
                  label="Maximum Score"
                  value={formatScore(analytics.max_score)}
                  color="text-yellow-400"
                />


                <StatCard
                  label="Minimum Score"
                  value={formatScore(analytics.min_score)}
                  color="text-red-400"
                />


              </div>

            )}


          </section>



        </div>

      </div>


    </Layout>

  )

}