import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function Message({ message, index }) {
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const isUser = message.role === 'user';
  const data = message.data; // InsightResponse data for assistant messages

  const handleCopy = () => {
    const text = isUser ? message.content : (data?.answer || message.content);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className={`message-item flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
          style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-active)' }}
        >
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
        </div>
      )}

      {/* Message Content */}
      <div
        className={`group relative rounded-2xl px-5 py-4 max-w-[85%] shadow-sm ${isUser ? 'ml-auto' : ''}`}
        style={{
          background: isUser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
          border: isUser ? 'none' : '1px solid var(--border-color)',
          color: isUser ? 'white' : 'var(--text-primary)',
        }}
      >
        {isUser ? (
          <p className="text-base leading-relaxed">{message.content}</p>
        ) : (
          <div className="space-y-4">
            {/* Main Answer */}
            <div className="markdown-content text-base">
              <ReactMarkdown>{data?.answer || message.content}</ReactMarkdown>
            </div>

            {/* Insights */}
            {data?.insights?.length > 0 && (
              <InsightSection
                title="💡 Key Insights"
                items={data.insights}
                color="var(--accent-primary)"
                isOpen={expandedSections.insights !== false}
                onToggle={() => toggleSection('insights')}
              />
            )}

            {/* Trends */}
            {data?.trends?.length > 0 && (
              <InsightSection
                title="📈 Trends"
                items={data.trends}
                color="var(--info)"
                isOpen={expandedSections.trends}
                onToggle={() => toggleSection('trends')}
              />
            )}

            {/* Risks */}
            {data?.risks?.length > 0 && (
              <InsightSection
                title="⚠️ Risks"
                items={data.risks}
                color="var(--warning)"
                isOpen={expandedSections.risks}
                onToggle={() => toggleSection('risks')}
              />
            )}

            {/* Opportunities */}
            {data?.opportunities?.length > 0 && (
              <InsightSection
                title="🚀 Opportunities"
                items={data.opportunities}
                color="var(--success)"
                isOpen={expandedSections.opportunities}
                onToggle={() => toggleSection('opportunities')}
              />
            )}

            {/* Sources */}
            {data?.sources?.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Sources
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.sources.map((source, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-md"
                      style={{
                        background: 'var(--bg-hover)',
                        color: 'var(--accent-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute -bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 px-2 py-0.5 rounded"
          style={{ color: 'var(--text-muted)' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
        >
          <User size={18} style={{ color: 'var(--text-secondary)' }} />
        </div>
      )}
    </motion.div>
  );
}

function InsightSection({ title, items, color, isOpen, onToggle }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-[var(--bg-hover)] transition-colors"
        style={{ color }}
      >
        <span>{title} ({items.length})</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-3 space-y-1.5"
        >
          {items.map((item, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              • {item}
            </p>
          ))}
        </motion.div>
      )}
    </div>
  );
}
