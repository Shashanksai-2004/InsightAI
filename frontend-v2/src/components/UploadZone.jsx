import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
}

export default function UploadZone({ onUpload, isUploading, uploadProgress }) {
  const onDrop = useCallback(
    (files) => {
      if (files.length > 0) onUpload(files)
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    disabled: isUploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200
        ${isDragActive
          ? 'border-accent bg-accent-bg'
          : 'border-line hover:border-line-hover hover:bg-overlay'
        }
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="space-y-2.5">
          <p className="text-xs text-soft">Uploading... {uploadProgress}%</p>
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <Upload className="w-5 h-5 text-dim mx-auto mb-2" />
          <p className="text-sm text-soft">
            {isDragActive ? 'Drop files here' : 'Drop files or browse'}
          </p>
          <p className="text-[11px] text-dim mt-1">PDF, CSV, XLSX, TXT, MD</p>
        </>
      )}
    </div>
  )
}
