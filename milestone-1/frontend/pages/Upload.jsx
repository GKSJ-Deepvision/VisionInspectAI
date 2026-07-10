import React, { useState, useRef } from 'react';
import { UploadCloud, Image, CheckCircle, AlertTriangle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dbRecord, setDbRecord] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Only JPEG and PNG images are allowed.');
      return false;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size exceeds the 5MB limit.');
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');
    setDbRecord(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleFileChange = (e) => {
    setError('');
    setDbRecord(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

const handleUpload = async () => {
  if (!selectedFile) return;

  setUploading(true);
  setError("");
  setDbRecord(null);

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    // Upload image
    const uploadResponse = await api.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setDbRecord(uploadResponse.data);

    // Automatically start inspection
    try {
      await api.post("/inspections/start", {
        image_id: uploadResponse.data.image.id,
      });
    } catch (inspectionError) {
      console.log("Inspection will be available later.");
    }

    alert("Image uploaded successfully.");

    clearSelection();

  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.detail ||
      "Image upload failed."
    );
  } finally {
    setUploading(false);
  }
};

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDbRecord(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Upload Product Image</h1>
        <p className="text-sm text-slate-400">Trigger inspection pipeline by submitting line item photos</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Upload Panel */}
        <div className="rounded-xl border border-white/5 bg-[#131A26]/40 p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4">Input Image File</h3>
          
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-950/20 py-10 px-4 text-center transition-all ${
              dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10'
            }`}
          >
            {previewUrl ? (
              <div className="relative max-h-60 overflow-hidden rounded-lg">
                <img src={previewUrl} alt="Preview" className="object-contain max-h-60" />
              </div>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                <p className="text-sm text-slate-300">Drag &amp; drop product photo, or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, JPEG (Max 5MB)</p>
              </>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!previewUrl && (
              <button
                onClick={triggerFileInput}
                className="mt-6 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all"
              >
                Browse Files
              </button>
            )}
          </div>

          {previewUrl && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 py-3 font-semibold text-white shadow-lg transition-all disabled:opacity-50"
              >
                {uploading ? 'Uploading & Logging...' : 'Upload & Start Inspection'}
              </button>
              <button
                onClick={clearSelection}
                disabled={uploading}
                className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 font-semibold text-slate-300 hover:bg-white/10 transition-all"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Inference & DB Metadata Output Column */}
        <div className="rounded-xl border border-white/5 bg-[#131A26]/40 p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4">Pipeline Execution Results</h3>
          
          {uploading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <span className="text-sm text-slate-400">Uploading and saving metadata...</span>
            </div>
          ) : dbRecord ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-400">
                <CheckCircle className="h-8 w-8" />
                <div>
                  <h4 className="font-semibold text-sm">Upload &amp; Persistence Successful</h4>
                  <p className="text-xs text-emerald-500/80 mt-0.5">Metadata recorded in PostgreSQL.</p>
                </div>
              </div>

              {/* Database Logs Details */}
              <div className="rounded-lg bg-slate-900/40 p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 border-b border-white/5 pb-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">PostgreSQL Records Saved</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Image DB ID</p>
                    <p className="text-white font-mono mt-0.5">{dbRecord.image.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Inspection DB ID</p>
                    <p className="text-white font-mono mt-0.5">{dbRecord.inspection.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Uploaded By</p>
                    <p className="text-white mt-0.5">{dbRecord.image.uploaded_by}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Timestamp</p>
                    <p className="text-white mt-0.5">{new Date(dbRecord.image.uploaded_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* AI Inference Placeholder */}
              <div className="rounded-lg border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 p-5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <AlertTriangle className="h-5 w-5" />
                  <h4 className="font-semibold text-sm">AI Defect Detection Model Placeholder</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The image metadata is saved and a quality inspection record is logged in database as:
                  <span className="block mt-1 font-semibold text-indigo-300">Status: {dbRecord.inspection.status.toUpperCase()}</span>
                  This acts as the hook for future computer vision models (OpenCV + PyTorch inference) to run classification and segment defects.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/5 bg-slate-950/10">
              <div className="text-center text-slate-500">
                <Image className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">Metadata and AI analysis details will show here after upload.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
