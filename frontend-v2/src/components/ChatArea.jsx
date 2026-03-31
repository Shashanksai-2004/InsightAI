import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  Brain,
  Upload,
  MessageSquare,
  FileOutput,
  BarChart3,
  Loader2,
} from 'lucide-react'
import MessageBubble from './MessageBubble'

const SUGGESTIONS = [
  'What are the key revenue trends?',
  'Identify the top risks in the data',
  'Summarize the main KPIs',
  'What growth opportunities exist?',
  'Compare performance across periods',
  'What are the profit margins?',
]

export default function ChatArea({
  messages,
  isAsking,
  onAsk,
  hasFiles,
  showAnalytics,
  onToggleAnalytics,
  hasAnalyticsData,
}) {
  const [input, setInput] = useState('')
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAsking])

  const submit = (e) => {
    e?.preventDefault()
    if (!input.trim() || isAsking) return
    onAsk(input.trim())
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const onInputChange = (e) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* ── Messages / Welcome ── */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center px-6 welcome-grid">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-lg"
            >
              {/* Logo */}
              <div className="w-14 h-14 rounded-2xl bg-accent-bg border border-accent-border flex items-center justify-center mx-auto mb-6">
                <Brain className="w-7 h-7 text-accent-light" />
              </div>

              <h1 className="text-[1.65rem] font-semibold text-heading tracking-tight mb-2">
                InsightAI
              </h1>
              <p className="text-muted text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                Upload your business documents and ask questions to uncover
                insights, trends, risks, and opportunities hidden in your data.
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-3 gap-3 mb-10">
                {[
                  { icon: Upload, title: 'Upload', desc: 'PDF, CSV, XLSX, TXT' },
                  { icon: MessageSquare, title: 'Analyze', desc: 'Ask any question' },
                  { icon: FileOutput, title: 'Export', desc: 'PDF, CSV, JSON' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="px-4 py-3.5 rounded-xl bg-surface-1/60 border border-line-subtle text-left"
                  >
                    <Icon className="w-4 h-4 text-dim mb-2.5" />
                    <p className="text-[13px] font-medium text-body">{title}</p>
                    <p className="text-[11px] text-dim mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Suggested questions */}
              {hasFiles && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-[11px] text-dim uppercase tracking-wider mb-3">
                    Try asking
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.slice(0, 4).map((q) => (
                      <button
                        key={q}
                        onClick={() => onAsk(q)}
                        className="px-3 py-1.5 text-xs text-soft bg-surface-2/80 hover:bg-surface-3 border border-line-subtle hover:border-line-hover rounded-full transition-all duration-150"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6">
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                message={msg}
                onViewAnalytics={onToggleAnalytics}
              />
            ))}

            {/* Typing indicator */}
            {isAsking && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-5"
              >
                <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-3.5 h-3.5 text-accent-light animate-spin" />
                </div>
                <div className="flex items-center gap-1.5 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot-1" style={{ background: 'var(--th-dot)' }} />
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot-2" style={{ background: 'var(--th-dot)' }} />
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot-3" style={{ background: 'var(--th-dot)' }} />
                </div>
              </motion.div>
            )}

            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 border-t border-line-subtle bg-surface-0/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={submit} className="flex items-end gap-2.5">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={onInputChange}
                onKeyDown={onKeyDown}
                placeholder={
                  hasFiles
                    ? 'Ask about your data...'
                    : 'Upload files first to start analyzing...'
                }
                disabled={!hasFiles || isAsking}
                rows={1}
                className="w-full px-4 py-3 bg-surface-2 border border-line rounded-xl text-sm text-body placeholder:text-dim resize-none focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/20 transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isAsking || !hasFiles}
              className="p-3 bg-accent hover:bg-accent-light text-white rounded-xl transition-colors duration-150 disabled:opacity-25 disabled:pointer-events-none flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Analytics toggle */}
          {hasAnalyticsData && (
            <div className="flex justify-end mt-2">
              <button
                onClick={onToggleAnalytics}
                className="flex items-center gap-1.5 text-[11px] text-dim hover:text-accent-light transition-colors"
              >
                <BarChart3 className="w-3 h-3" />
                {showAnalytics ? 'Hide' : 'Show'} analytics panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
