import Layout from '../components/Layout.jsx'

export default function Analytics() {
  return (
    <Layout>
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-gray-400 text-sm mb-6">
          Defect trends and production quality reports will appear here.
        </p>
        <div className="border border-dashed border-gray-700 rounded-lg p-10 text-center text-gray-500 text-sm max-w-3xl">
          Coming soon — charts will be added once we have enough inspection data and finalize what metrics to track.
        </div>
      </div>
    </Layout>
  )
}