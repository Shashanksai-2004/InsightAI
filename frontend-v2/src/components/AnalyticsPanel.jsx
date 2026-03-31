import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  TrendingUp,
  TrendingDown,
  LineChart,
  BarChart3,
  AreaChart as AreaIcon,
  Lightbulb,
  AlertTriangle,
  Rocket,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import ExportMenu from './ExportMenu'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444']

function fmt(val) {
  if (typeof val !== 'number') return val
  if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + 'B'
  if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + 'M'
  if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + 'K'
  return Number.isInteger(val) ? val.toString() : val.toFixed(1)
}

/* ── KPI Card ── */
function KPICard({ kpi, color }) {
  const vals = kpi.values || []
  const latest = vals[vals.length - 1]
  const prev = vals.length >= 2 ? vals[vals.length - 2] : null
  const pct = prev ? ((latest - prev) / Math.abs(prev)) * 100 : null
  const up = pct !== null && pct >= 0

  return (
    <div className="px-3 py-2.5 rounded-lg bg-surface-2/60 border border-line-subtle">
      <p className="text-[11px] text-muted truncate leading-snug">{kpi.metric}</p>
      <p className="text-lg font-semibold mt-0.5 leading-tight" style={{ color }}>
        {fmt(latest)}
      </p>
      {pct !== null && (
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] mt-1 ${
            up ? 'text-success' : 'text-danger'
          }`}
        >
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(pct).toFixed(1)}%
        </span>
      )}
    </div>
  )
}

/* ── Collapsible insight section ── */
function Section({ title, items, icon: Icon, color }) {
  const [open, setOpen] = useState(true)
  if (!items?.length) return null

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full py-1.5 text-left group"
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
        <span className="text-xs font-medium text-body flex-1">{title}</span>
        <span className="text-[11px] text-dim tabular-nums">{items.length}</span>
        {open ? (
          <ChevronDown className="w-3 h-3 text-faint" />
        ) : (
          <ChevronRight className="w-3 h-3 text-faint" />
        )}
      </button>
      {open && (
        <ul className="ml-6 mb-3 space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-xs text-soft leading-relaxed pl-2.5 border-l border-line"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Panel ── */
export default function AnalyticsPanel({ data, onExport, onClose, theme }) {
  const [chartType, setChartType] = useState('line')
  const isDark = theme === 'dark'

  const kpis = data?.kpis || []
  const hasChart = kpis.some((k) => (k.values?.length || 0) > 1)

  // Build chart data from KPIs
  const chartData = hasChart
    ? (() => {
        const ref = kpis.reduce(
          (a, b) => ((b.labels?.length || 0) > (a.labels?.length || 0) ? b : a),
          kpis[0],
        )
        return (ref.labels || []).map((label, i) => {
          const pt = { label }
          kpis.forEach((k) => {
            if (k.values?.[i] !== undefined) pt[k.metric] = k.values[i]
          })
          return pt
        })
      })()
    : []

  const Chart =
    chartType === 'bar' ? BarChart : chartType === 'area' ? AreaChart : ReLineChart
  const DataEl = chartType === 'bar' ? Bar : chartType === 'area' ? Area : Line

  /* Dynamic chart colors that work in SVG attributes */
  const gridStroke = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  const axisStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'
  const tickFill = isDark ? '#71717a' : '#6b7280'
  const tooltipStyle = {
    background: isDark ? '#17171c' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '8px',
    fontSize: '12px',
    color: isDark ? '#e4e4e7' : '#1f2937',
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 400, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-full bg-surface-1 border-l border-line flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 flex-shrink-0 border-b border-line-subtle">
        <h2 className="text-sm font-medium text-heading">Analysis</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-dim hover:text-body rounded-md hover:bg-overlay-light transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* KPI grid */}
        {kpis.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {kpis.slice(0, 6).map((kpi, i) => (
              <KPICard key={i} kpi={kpi} color={COLORS[i % COLORS.length]} />
            ))}
          </div>
        )}

        {/* Chart */}
        {hasChart && (
          <div>
            <div className="flex items-center gap-1 mb-3">
              {[
                { type: 'line', Ic: LineChart },
                { type: 'bar', Ic: BarChart3 },
                { type: 'area', Ic: AreaIcon },
              ].map(({ type, Ic }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`p-1.5 rounded-md transition-colors ${
                    chartType === type
                      ? 'bg-accent-bg text-accent-light'
                      : 'text-dim hover:text-soft hover:bg-overlay'
                  }`}
                >
                  <Ic className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <Chart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: tickFill }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: tickFill }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={false}
                    tickFormatter={fmt}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
                  {kpis.map((kpi, i) => (
                    <DataEl
                      key={kpi.metric}
                      type="monotone"
                      dataKey={kpi.metric}
                      stroke={COLORS[i % COLORS.length]}
                      fill={
                        chartType === 'area'
                          ? COLORS[i % COLORS.length] + '18'
                          : COLORS[i % COLORS.length]
                      }
                      strokeWidth={2}
                      dot={false}
                      radius={chartType === 'bar' ? [3, 3, 0, 0] : undefined}
                    />
                  ))}
                </Chart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Insight sections */}
        <div className="space-y-0.5">
          <Section title="Insights" items={data?.insights} icon={Lightbulb} color="#eab308" />
          <Section title="Trends" items={data?.trends} icon={TrendingUp} color="#3b82f6" />
          <Section title="Risks" items={data?.risks} icon={AlertTriangle} color="#ef4444" />
          <Section title="Opportunities" items={data?.opportunities} icon={Rocket} color="#22c55e" />
        </div>
      </div>

      {/* Export footer */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-line-subtle">
        <ExportMenu onExport={onExport} />
      </div>
    </motion.div>
  )
}
