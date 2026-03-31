import { motion } from 'framer-motion'
import {
  PanelLeftClose,
  PanelLeft,
  FileText,
  FileSpreadsheet,
  File,
  Trash2,
  Circle,
  Brain,
  Sun,
  Moon,
} from 'lucide-react'
import UploadZone from './UploadZone'

function FileIcon({ type }) {
  if (type === '.pdf')
    return <FileText className="w-4 h-4" style={{ color: 'var(--th-icon-pdf)' }} />
  if (type === '.csv' || type === '.xlsx')
    return <FileSpreadsheet className="w-4 h-4" style={{ color: 'var(--th-icon-data)' }} />
  return <File className="w-4 h-4" style={{ color: 'var(--th-icon-default)' }} />
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1_048_576).toFixed(1) + ' MB'
}

export default function Sidebar({
  files,
  health,
  isOpen,
  onToggle,
  onUpload,
  isUploading,
  uploadProgress,
  onClear,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === 'dark'

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-full bg-surface-1 border-r border-line flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 h-14 flex-shrink-0">
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center">
              <Brain className="w-4 h-4 text-accent-light" />
            </div>
            <span className="font-semibold text-sm text-heading tracking-tight">
              InsightAI
            </span>
          </motion.div>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center mx-auto">
            <Brain className="w-4 h-4 text-accent-light" />
          </div>
        )}

        {isOpen && (
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 text-dim hover:text-body rounded-md hover:bg-overlay-light transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Collapse */}
            <button
              onClick={onToggle}
              className="p-1.5 text-dim hover:text-body rounded-md hover:bg-overlay-light transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Collapsed toggle */}
      {!isOpen && (
        <div className="flex flex-col items-center gap-2 mt-2">
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-dim hover:text-body rounded-md hover:bg-overlay-light transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 text-dim hover:text-body rounded-md hover:bg-overlay-light transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Expanded content ── */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Upload section */}
          <div className="px-3 pt-1 pb-2">
            <p className="text-[11px] font-medium text-dim uppercase tracking-wider mb-2 px-1">
              Upload
            </p>
            <UploadZone
              onUpload={onUpload}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-line-subtle mx-3" />

          {/* Files section */}
          <div className="flex-1 overflow-y-auto px-3 pt-3">
            <p className="text-[11px] font-medium text-dim uppercase tracking-wider mb-2 px-1">
              Files{' '}
              {files.length > 0 && (
                <span className="text-faint">({files.length})</span>
              )}
            </p>

            {files.length === 0 ? (
              <p className="text-xs text-faint px-1 leading-relaxed">
                No files uploaded yet. Drop your business documents above to get started.
              </p>
            ) : (
              <div className="space-y-0.5">
                {files.map((file) => (
                  <div
                    key={file.file_id}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-overlay transition-colors group"
                  >
                    <FileIcon type={file.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-body truncate leading-snug">
                        {file.filename}
                      </p>
                      <p className="text-[11px] text-dim leading-snug">
                        {file.chunks} chunks
                        {file.size ? ` \u00b7 ${formatBytes(file.size)}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-3 py-3 border-t border-line-subtle flex-shrink-0 space-y-2">
            {/* Status row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Circle
                  className="w-[7px] h-[7px] fill-current"
                  style={{ color: health ? 'var(--th-status-on)' : 'var(--th-status-off)' }}
                />
                <span className="text-[11px] text-dim">
                  {health ? 'Connected' : 'Offline'}
                </span>
              </div>
              {health && (
                <span className="text-[11px] text-faint">v{health.version}</span>
              )}
            </div>

            {/* Stats row */}
            {health && (
              <div className="flex gap-3 px-1">
                <span className="text-[11px] text-dim">
                  {health.files_loaded} files
                </span>
                <span className="text-[11px] text-dim">
                  {health.chunks_indexed} chunks
                </span>
              </div>
            )}

            {/* Clear button */}
            <button
              onClick={onClear}
              disabled={files.length === 0}
              className="flex items-center gap-2 w-full px-2.5 py-2 text-[13px] text-dim hover:text-danger hover:bg-danger/[0.06] rounded-lg transition-colors disabled:opacity-25 disabled:pointer-events-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all data
            </button>
          </div>
        </motion.div>
      )}
    </motion.aside>
  )
}
