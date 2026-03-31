import { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import api from './api/client'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import AnalyticsPanel from './components/AnalyticsPanel'

const toastStyle = () => ({
  background: 'var(--th-surface-2)',
  color: 'var(--th-text-body)',
  border: '1px solid var(--th-border)',
  fontSize: '13px',
})

export default function App() {
  /* ── Theme ── */
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('insightai-theme') || 'dark',
  )

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
    localStorage.setItem('insightai-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  /* ── State ── */
  const [messages, setMessages] = useState([])
  const [files, setFiles] = useState([])
  const [health, setHealth] = useState(null)
  const [sessionId] = useState('default')

  const [isAsking, setIsAsking] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [lastAnalysis, setLastAnalysis] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  /* ── Health polling ── */
  useEffect(() => {
    const check = () =>
      api
        .getHealth()
        .then((r) => setHealth(r.data))
        .catch(() => setHealth(null))
    check()
    const id = setInterval(check, 15000)
    return () => clearInterval(id)
  }, [])

  /* ── Load files on mount ── */
  useEffect(() => {
    api
      .getFiles()
      .then((r) => setFiles(r.data.files || []))
      .catch(() => {})
  }, [])

  /* ── Load chat history on mount ── */
  useEffect(() => {
    api
      .getHistory(sessionId)
      .then((r) => {
        const hist = r.data.history || []
        if (hist.length === 0) return
        setMessages(hist)
        const last = [...hist].reverse().find((m) => m.role === 'assistant' && m.data)
        if (last?.data) {
          setLastAnalysis(last.data)
          setShowAnalytics(true)
        }
      })
      .catch(() => {})
  }, [sessionId])

  /* ── Upload handler ── */
  const handleUpload = useCallback(async (acceptedFiles) => {
    setIsUploading(true)
    setUploadProgress(0)
    try {
      const res = await api.uploadFiles(acceptedFiles, (p) =>
        setUploadProgress(Math.round(p * 100)),
      )
      const fileRes = await api.getFiles()
      setFiles(fileRes.data.files || [])
      toast.success(`${res.data.total_files} file(s) uploaded`, { style: toastStyle() })
    } catch (err) {
      toast.error(
        'Upload failed: ' + (err.response?.data?.detail || err.message),
        { style: toastStyle() },
      )
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [])

  /* ── Ask handler ── */
  const handleAsk = useCallback(
    async (question) => {
      if (!question.trim() || isAsking) return

      setMessages((prev) => [...prev, { role: 'user', content: question }])
      setIsAsking(true)

      try {
        const { data } = await api.askQuestion(question, sessionId)

        const analysis = {
          insights: data.insights || [],
          trends: data.trends || [],
          risks: data.risks || [],
          opportunities: data.opportunities || [],
          kpis: data.kpis || [],
          sources: data.sources || [],
          performance: data.performance || {},
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.answer || '', data: analysis },
        ])

        const hasData =
          analysis.kpis.length > 0 ||
          analysis.insights.length > 0 ||
          analysis.trends.length > 0 ||
          analysis.risks.length > 0 ||
          analysis.opportunities.length > 0

        if (hasData) {
          setLastAnalysis(analysis)
          setShowAnalytics(true)
        }
      } catch (err) {
        toast.error(
          'Request failed: ' + (err.response?.data?.detail || err.message),
          { style: toastStyle() },
        )
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Sorry, I encountered an error processing your request. Please try again.',
            data: null,
          },
        ])
      } finally {
        setIsAsking(false)
      }
    },
    [isAsking, sessionId],
  )

  /* ── Export handler ── */
  const handleExport = useCallback(
    async (format) => {
      try {
        if (format === 'pdf') {
          if (!lastAnalysis) {
            toast.error('No analysis data to export', { style: toastStyle() })
            return
          }
          const lastAnswer =
            [...messages].reverse().find((m) => m.role === 'assistant')?.content || ''

          const res = await api.generateReport({
            title: 'InsightAI Business Analysis Report',
            summary: lastAnswer,
            insights: lastAnalysis.insights,
            trends: lastAnalysis.trends,
            risks: lastAnalysis.risks,
            opportunities: lastAnalysis.opportunities,
            recommendations: [],
            kpis: lastAnalysis.kpis,
            sources: lastAnalysis.sources,
          })

          const url = URL.createObjectURL(
            new Blob([res.data], { type: 'application/pdf' }),
          )
          const a = document.createElement('a')
          a.href = url
          a.download = 'insightai-report.pdf'
          a.click()
          URL.revokeObjectURL(url)
          toast.success('PDF report downloaded', { style: toastStyle() })
        } else {
          const res = await api.exportData(format)
          const blob = new Blob([
            typeof res.data === 'string'
              ? res.data
              : JSON.stringify(res.data, null, 2),
          ])
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `insightai-export.${format}`
          a.click()
          URL.revokeObjectURL(url)
          toast.success(`${format.toUpperCase()} exported`, { style: toastStyle() })
        }
      } catch (err) {
        toast.error(
          'Export failed: ' + (err.response?.data?.detail || err.message),
          { style: toastStyle() },
        )
      }
    },
    [lastAnalysis, messages],
  )

  /* ── Clear handler ── */
  const handleClear = useCallback(async () => {
    try {
      await api.clearAll()
      setMessages([])
      setFiles([])
      setLastAnalysis(null)
      setShowAnalytics(false)
      toast.success('All data cleared', { style: toastStyle() })
    } catch {
      toast.error('Failed to clear data', { style: toastStyle() })
    }
  }, [])

  /* ── Render ── */
  return (
    <div className="flex h-screen bg-surface-0 text-body overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{ style: toastStyle(), duration: 3000 }}
      />

      <Sidebar
        files={files}
        health={health}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((p) => !p)}
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onClear={handleClear}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <ChatArea
        messages={messages}
        isAsking={isAsking}
        onAsk={handleAsk}
        hasFiles={files.length > 0}
        showAnalytics={showAnalytics}
        onToggleAnalytics={() => setShowAnalytics((p) => !p)}
        hasAnalyticsData={!!lastAnalysis}
      />

      <AnimatePresence>
        {showAnalytics && lastAnalysis && (
          <AnalyticsPanel
            key="analytics"
            data={lastAnalysis}
            onExport={handleExport}
            onClose={() => setShowAnalytics(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
