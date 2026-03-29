import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, FileText, FileSpreadsheet, Trash2, ChevronLeft,
  ChevronRight, Activity, Database, Zap, MessageSquare
} from 'lucide-react';
import UploadPanel from './Upload';

const fileTypeIcons = {
  '.pdf': FileText,
  '.txt': FileText,
  '.md': FileText,
  '.csv': FileSpreadsheet,
  '.xlsx': FileSpreadsheet,
};

export default function Sidebar({
  files,
  messages = [],
  onUpload,
  onClear,
  isUploading,
  uploadProgress,
  health,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const userMessages = messages.filter(m => m.role === 'user');

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 320 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col h-full relative overflow-hidden border-r"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Toggle button */}
      <button
        id="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 -right-0 z-10 p-1 rounded-l-lg transition-colors"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRight: 'none',
          color: 'var(--text-muted)',
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.6 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--shadow-glow)' }}
        >
          <Brain size={18} color="white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <h1 className="text-base font-bold gradient-text">InsightAI</h1>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>AI Business Analyst</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-5"
          >
            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-2">
              <StatusCard icon={Database} label="Files" value={health?.files_loaded ?? files.length} color="#7c6aef" />
              <StatusCard icon={Zap} label="Chunks" value={health?.chunks_indexed ?? 0} color="#22c55e" />
            </div>

            {/* Upload */}
            <div>
              <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Upload Files
              </h2>
              <UploadPanel
                onUpload={onUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Loaded Files
                  </h2>
                  <button
                    id="clear-files-button"
                    onClick={onClear}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--danger)' }}
                    title="Clear all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {files.map((file, index) => {
                    const Icon = fileTypeIcons[file.type] || FileText;
                    return (
                      <motion.div
                        key={file.file_id || index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                      >
                        <Icon size={14} style={{ color: 'var(--accent-primary)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {file.filename}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {file.chunks} chunks {file.has_structured_data ? '• 📊 Data' : ''}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat History Section */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)', marginTop: '1rem' }}>
              <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Recent Queries
              </h2>
              {userMessages.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                  {userMessages.slice().reverse().map((msg, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                      onClick={() => {
                        const messageEls = document.querySelectorAll('.message-item');
                        const target = messageEls[messageEls.length - (index * 2) - 2];
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <MessageSquare size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {msg.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center rounded-lg border border-dashed" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No previous chats yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <AnimatePresence>
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-2 h-2 rounded-full pulse-dot"
                style={{ background: health?.status === 'healthy' ? 'var(--success)' : 'var(--danger)' }}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {health?.status === 'healthy' ? 'System Online' : 'Connecting...'}
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <div
                className="w-2 h-2 rounded-full pulse-dot"
                style={{ background: health?.status === 'healthy' ? 'var(--success)' : 'var(--danger)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

function StatusCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{ background: `${color}10`, border: `1px solid ${color}20` }}
    >
      <Icon size={14} style={{ color }} />
      <p className="text-lg font-bold mt-1" style={{ color }}>{value}</p>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}
