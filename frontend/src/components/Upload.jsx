import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, FileText, FileSpreadsheet, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const fileTypeIcons = {
  '.pdf': FileText,
  '.txt': FileText,
  '.md': FileText,
  '.csv': FileSpreadsheet,
  '.xlsx': FileSpreadsheet,
};

const fileTypeColors = {
  '.pdf': '#ef4444',
  '.txt': '#3b82f6',
  '.md': '#8b5cf6',
  '.csv': '#22c55e',
  '.xlsx': '#f59e0b',
};

export default function UploadPanel({ onUpload, isUploading, uploadProgress }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: true,
  });

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getExt = (name) => {
    const parts = name.split('.');
    return '.' + parts[parts.length - 1].toLowerCase();
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        id="upload-dropzone"
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8
          transition-all duration-300 text-center
          ${isDragActive
            ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)]'
            : 'border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)]'
          }
        `}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.05, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <UploadIcon
            className="mx-auto mb-3"
            size={36}
            style={{ color: isDragActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
          />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isDragActive ? 'Drop files here...' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            PDF, TXT, CSV, XLSX supported
          </p>
        </motion.div>
      </div>

      {/* Selected Files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {selectedFiles.map((file, index) => {
              const ext = getExt(file.name);
              const Icon = fileTypeIcons[ext] || File;
              const color = fileTypeColors[ext] || '#6b7280';

              return (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  <Icon size={18} style={{ color }} />
                  <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                    {file.name}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {(file.size / 1024).toFixed(1)}KB
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-xs px-2 py-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--danger)' }}
                  >
                    ✕
                  </button>
                </motion.div>
              );
            })}

            {/* Upload Button */}
            <motion.button
              id="upload-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: isUploading ? 'var(--bg-tertiary)' : 'var(--accent-gradient)',
                boxShadow: isUploading ? 'none' : 'var(--shadow-glow)',
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <UploadIcon size={16} />
                  Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
