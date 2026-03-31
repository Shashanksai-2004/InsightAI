import ReactMarkdown from 'react-markdown'
import { Sparkles, FileText, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MessageBubble({ message, onViewAnalytics }) {
  const isUser = message.role === 'user'
  const data = message.data

  const counts = []
  if (data?.kpis?.length) counts.push(`${data.kpis.length} KPIs`)
  if (data?.insights?.length) counts.push(`${data.insights.length} Insights`)
  if (data?.trends?.length) counts.push(`${data.trends.length} Trends`)
  if (data?.risks?.length) counts.push(`${data.risks.length} Risks`)
  if (data?.opportunities?.length) counts.push(`${data.opportunities.length} Opportunities`)

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end mb-5"
      >
        <div className="max-w-[72%] bg-accent-bg border border-accent-border rounded-2xl rounded-br-sm px-4 py-2.5">
          <p className="text-sm text-body leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-5"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-light" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="md-body text-sm">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Source citations */}
          {data?.sources?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {data.sources.map((source, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] text-muted bg-surface-2 px-2 py-0.5 rounded-md border border-line-subtle"
                >
                  <FileText className="w-2.5 h-2.5" />
                  {source}
                </span>
              ))}
            </div>
          )}

          {/* Analytics link */}
          {counts.length > 0 && (
            <button
              onClick={onViewAnalytics}
              className="flex items-center gap-1.5 mt-3 text-xs text-accent/70 hover:text-accent-light transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{counts.join(' \u00b7 ')}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
