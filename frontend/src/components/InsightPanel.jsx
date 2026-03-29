import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, Rocket } from 'lucide-react';

const sectionConfig = {
  insights: { icon: Lightbulb, label: 'Key Insights', color: '#7c6aef', bg: 'rgba(124, 106, 239, 0.08)' },
  trends: { icon: TrendingUp, label: 'Trends', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
  risks: { icon: AlertTriangle, label: 'Risks', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  opportunities: { icon: Rocket, label: 'Opportunities', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)' },
};

export default function InsightPanel({ data }) {
  if (!data) return null;

  const sections = Object.entries(sectionConfig).filter(
    ([key]) => data[key] && data[key].length > 0
  );

  if (sections.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-semibold px-1" style={{ color: 'var(--text-primary)' }}>
        📊 Analysis Summary
      </h3>

      {sections.map(([key, config], sectionIndex) => {
        const { icon: Icon, label, color, bg } = config;
        const items = data[key];

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: bg,
              border: `1px solid ${color}22`,
            }}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs font-semibold" style={{ color }}>
                {label}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
                style={{ background: `${color}20`, color }}
              >
                {items.length}
              </span>
            </div>
            <div className="px-3 pb-3 space-y-1.5">
              {items.map((item, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: sectionIndex * 0.1 + i * 0.05 }}
                  className="text-xs leading-relaxed pl-5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color }} className="mr-1">•</span>
                  {item}
                </motion.p>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
