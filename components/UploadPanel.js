import { useRef, useState } from 'react';

export default function UploadPanel({ onFileChange, onRun, isLoading, hasFile }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  function handleFiles(files) {
    const selected = files?.[0];
    if (!selected) return;
    setFileName(selected.name);
    onFileChange(selected, URL.createObjectURL(selected));
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="bg-panel border border-gridline p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink">Product Image Upload</h2>
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
        className={`cursor-pointer border border-dashed h-32 flex items-center justify-center transition-colors ${
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
        <div className="text-center px-6">
          <p className="text-sm text-ink font-body">
            {fileName || 'Drag a product image here, or click to browse'}
          </p>
          <p className="text-xs text-muted font-mono mt-2">
            JPG · PNG · BMP · TIFF · WebP
          </p>
        </div>
      </div>

      {hasFile && (
        <div className="flex justify-end mt-4">
          <button
            onClick={onRun}
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
