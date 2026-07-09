import { useRef, useState } from 'react';
import { runInspection } from '../lib/api';

export default function UploadPanel({ onResult }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleFiles(files) {
    const selected = files?.[0];
    if (!selected) return;
    setFile(selected);
    setFileName(selected.name);
    setPreview(URL.createObjectURL(selected));
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  async function handleRunInspection() {
    if (!file) return;
    setIsLoading(true);
    try {
      const result = await runInspection(file);
      onResult(fileName, result);
    } catch (err) {
      console.error('Inspection failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-panel border border-gridline p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink">Product Image Inspection</h2>
        <span className="text-xs font-mono text-muted uppercase">
          Batch / Manual Upload
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border border-dashed h-64 flex items-center justify-center transition-colors ${
          isDragging ? 'border-signal bg-signal/5' : 'border-gridline'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {preview ? (
          <div className="relative w-full h-full p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded product for inspection"
              className="w-full h-full object-contain"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-graphite/80 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-gridline border-t-signal rounded-full animate-spin" />
                <span className="text-xs font-mono text-muted uppercase">
                  Running inspection…
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center px-6">
            <p className="text-sm text-ink font-body">
              Drag a product image here, or click to browse
            </p>
            <p className="text-xs text-muted font-mono mt-2">
              JPG · PNG · BMP · TIFF · WebP
            </p>
          </div>
        )}
      </div>

      {fileName && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-mono text-muted truncate">{fileName}</span>
          <button
            onClick={handleRunInspection}
            disabled={isLoading}
            className="bg-signal text-graphite text-sm font-display font-semibold px-4 py-2 hover:bg-signal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-graphite/40 border-t-graphite rounded-full animate-spin" />
            )}
            {isLoading ? 'Inspecting…' : 'Run Inspection'}
          </button>
        </div>
      )}
    </div>
  );
}
