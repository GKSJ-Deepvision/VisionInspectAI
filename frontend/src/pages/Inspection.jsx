import { useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { inspectImage } from '../services/api.js'

export default function Inspection() {
  const { user } = useAuth()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState('')
  const [isInspecting, setIsInspecting] = useState(false)
  const [results, setResults] = useState([])

  function handleFiles(files) {
    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    )

    if (imageFiles.length === 0) {
      setMessage('Please select valid image files.')
      return
    }

    setSelectedFiles(prev => [...prev, ...imageFiles])
    setMessage('')
  }

  function handleFileChange(event) {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)

    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files)
    }
  }

  function removeFile(index) {
    setSelectedFiles(prev =>
      prev.filter((_, fileIndex) => fileIndex !== index)
    )
  }

  async function handleInspection() {
    if (selectedFiles.length === 0) {
      setMessage('Please select at least one image.')
      return
    }

    if (!user?.token) {
      setMessage('Authentication token not found. Please login again.')
      return
    }

    setIsInspecting(true)
    setMessage('')
    setResults([])

    try {
      const inspectionResults = []

      for (const file of selectedFiles) {
        const result = await inspectImage(file, user.token)

        inspectionResults.push({
          fileName: file.name,
          ...result,
        })
      }

      setResults(inspectionResults)
      setMessage('AI inspection completed successfully.')
    } catch (error) {
      console.error('Inspection error:', error)
      setMessage(error.message || 'AI inspection failed. Please try again.')
    } finally {
      setIsInspecting(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">

          {/* Page Header */}
          <div className="mb-10">
            <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
              VisionInspect AI
            </p>

            <h1 className="text-4xl font-bold mt-3">
              Image Inspection
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Upload product images for AI-powered defect detection
              and quality inspection.
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-xl">

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-10h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Upload Component Images
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Supported formats: JPG, JPEG, PNG
                </p>
              </div>
            </div>

            {/* Drop Zone */}
            <label
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`block cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                isDragging
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-950/50 hover:border-blue-500 hover:bg-blue-500/5'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center">

                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-5">
                  <svg
                    className="w-8 h-8 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold">
                  Click to select images
                </h3>

                <p className="text-gray-500 mt-2">
                  or drag and drop your images here
                </p>

                <span className="inline-block mt-5 px-5 py-2 bg-gray-800 rounded-lg text-sm text-gray-300">
                  Browse Files
                </span>

              </div>
            </label>

            {/* Selected Images */}
            {selectedFiles.length > 0 && (
              <div className="mt-8">

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Selected Images
                  </h3>

                  <span className="text-sm text-gray-400">
                    {selectedFiles.length} image
                    {selectedFiles.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="relative bg-gray-950 border border-gray-800 rounded-xl overflow-hidden"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-36 object-cover"
                      />

                      <button
                        onClick={() => removeFile(index)}
                        disabled={isInspecting}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center disabled:opacity-50"
                        title="Remove image"
                      >
                        ×
                      </button>

                      <p className="p-3 text-xs text-gray-400 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}

                </div>

                {/* Inspection Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleInspection}
                    disabled={isInspecting}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInspecting
                      ? 'Running AI Inspection...'
                      : 'Start AI Inspection'}
                  </button>
                </div>

              </div>
            )}

            {/* Message */}
            {message && (
              <div className="mt-6 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                {message}
              </div>
            )}

            {/* Inspection Results */}
            {results.length > 0 && (
              <div className="mt-8">

                <h2 className="text-xl font-semibold mb-4">
                  Inspection Results
                </h2>

                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={`${result.fileName}-${index}`}
                      className="bg-gray-950 border border-gray-800 rounded-xl p-5"
                    >
                      <h3 className="font-semibold text-white">
                        {result.fileName}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">

                        <p className="text-gray-400">
                          Status:{' '}
                          <span className="text-white">
                            {result.status || 'N/A'}
                          </span>
                        </p>

                        <p className="text-gray-400">
                          AI Score:{' '}
                          <span className="text-white">
                            {result.ai_score ?? result.score ?? 'N/A'}
                          </span>
                        </p>

                        <p className="text-gray-400">
                          Inspection ID:{' '}
                          <span className="text-white">
                            {result.inspection_id || result.id || 'N/A'}
                          </span>
                        </p>

                        <p className="text-gray-400">
                          User ID:{' '}
                          <span className="text-white">
                            {result.user_id || 'N/A'}
                          </span>
                        </p>

                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </Layout>
  )
}