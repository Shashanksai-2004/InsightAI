import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { useState } from 'react';

const CHART_COLORS = [
  '#7c6aef', '#6366f1', '#3b82f6', '#22c55e',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function ChartPanel({ kpis }) {
  const [chartType, setChartType] = useState('line');

  if (!kpis || kpis.length === 0) return null;

  // Transform KPI data for Recharts
  const chartData = {};
  kpis.forEach((kpi) => {
    kpi.labels?.forEach((label, i) => {
      if (!chartData[label]) chartData[label] = { name: label };
      chartData[label][kpi.metric] = kpi.values?.[i] ?? 0;
    });
  });
  const data = Object.values(chartData);
  const metrics = kpis.map((k) => k.metric);

  if (data.length === 0) return null;

  const chartTypes = [
    { key: 'line', icon: TrendingUp, label: 'Line' },
    { key: 'bar', icon: BarChart3, label: 'Bar' },
    { key: 'area', icon: Activity, label: 'Area' },
  ];

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 20, left: 10, bottom: 5 },
    };

    const axisStyle = {
      fontSize: 11,
      fill: 'var(--text-muted)',
    };

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
          />
          {metrics.map((metric, i) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
              animationDuration={800}
              animationBegin={i * 100}
            />
          ))}
        </BarChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            {metrics.map((metric, i) => (
              <linearGradient key={metric} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" tick={axisStyle} />
          <YAxis tick={axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
          />
          {metrics.map((metric, i) => (
            <Area
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={`url(#gradient-${i})`}
              strokeWidth={2}
              animationDuration={800}
              animationBegin={i * 100}
            />
          ))}
        </AreaChart>
      );
    }

    // Default: Line chart
    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="name" tick={axisStyle} />
        <YAxis tick={axisStyle} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
        />
        {metrics.map((metric, i) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={800}
            animationBegin={i * 100}
          />
        ))}
      </LineChart>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 size={14} className="inline mr-1.5" style={{ color: 'var(--accent-primary)' }} />
          KPI Dashboard
        </h3>

        {/* Chart Type Toggle */}
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
          {chartTypes.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setChartType(key)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all"
              style={{
                background: chartType === key ? 'var(--accent-primary)' : 'transparent',
                color: chartType === key ? 'white' : 'var(--text-muted)',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {kpis.slice(0, 6).map((kpi, i) => {
          const latest = kpi.values?.[kpi.values.length - 1] ?? 0;
          const prev = kpi.values?.[kpi.values.length - 2];
          const change = prev ? (((latest - prev) / prev) * 100).toFixed(1) : null;

          return (
            <motion.div
              key={kpi.metric}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
            >
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{kpi.metric}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                {typeof latest === 'number' ? latest.toLocaleString() : latest}
              </p>
              {change !== null && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: parseFloat(change) >= 0 ? 'var(--success)' : 'var(--danger)' }}
                >
                  {parseFloat(change) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(change))}%
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
