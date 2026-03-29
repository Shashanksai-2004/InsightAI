import { motion } from 'framer-motion';
import { FileText, ExternalLink } from 'lucide-react';

export default function SourceCard({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <FileText size={14} style={{ color: 'var(--accent-primary)' }} />
        Referenced Sources
      </h3>

      <div className="space-y-2">
        {sources.map((source, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
          >
            <span
              className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
            >
              {index + 1}
            </span>
            <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
              {source}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
