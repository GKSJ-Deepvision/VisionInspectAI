import { useState, useRef } from 'react'
import { inspectImage, saveInspection } from '../services/api.js'
const severityColor = {
  Critical: 'text-red-400 border-red-400/40 bg-red-400/10',
  High: 'text-amber-400 border-amber-400/40 bg-amber-400/10',
  Medium: 'text-amber-400 border-amber-400/40 bg-amber-400/10',
  Low: 'text-green-400 border-green-400/40 bg-green-400/10',
}

export default function Upload() {
  const [files, setFiles] = useState([])
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  function handleFiles(fileList) {
    const arr = Array.from(fileList).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setFiles(arr)
    setResults([])
  }

async function runInspection() {
  if (files.length === 0) return
  setScanning(true)
  const outcomes = []
  for (const f of files) {
    const result = await inspectImage(f.file)
    result.preview = f.preview
    outcomes.push(result)
    await saveInspection(result)
  }
  setResults(outcomes)
  setScanning(false)
}

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-1">Image Upload</h1>
      <p className="text-gray-400 text-sm mb-6">Upload product images for defect inspection.</p>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 transition mb-6 max-w-2xl"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-gray-300 text-sm">Click to select images</p>
      </div>

      {files.length > 0 && (
        <div className="mb-6 max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-300">{files.length} image(s) selected</p>
            <button
              onClick={runInspection}
              disabled={scanning}
              className="bg-blue-500 text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
            >
              {scanning ? 'Inspecting…' : 'Run Inspection'}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {files.map((f, i) => (
              <img key={i} src={f.preview} alt="" className="aspect-square object-cover rounded-md border border-gray-600" />
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3 max-w-2xl">
          <p className="text-sm text-gray-300 mb-2">Results</p>
          {results.map((r) => (
            <div key={r.id} className="flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-lg p-4">
              <img src={r.preview} alt="" className="w-16 h-16 rounded-md object-cover border border-gray-600" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${r.result === 'FAIL' ? 'text-red-400 border-red-400/40 bg-red-400/10' : 'text-green-400 border-green-400/40 bg-green-400/10'}`}>
                    {r.result}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${severityColor[r.severity.level]}`}>
                    {r.severity.level} · {r.severity.score}
                  </span>
                </div>
                <p className="text-sm font-medium">{r.defectType}</p>
              </div>
              <p className="text-xs text-gray-500">Confidence {r.confidence}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}