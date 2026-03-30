import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileDown, Loader2, FileText } from 'lucide-react';
import { exportData, generateReport } from '../services/api';

export default function ExportButton({ latestResponse }) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      if (format === 'pdf') {
        const reportData = {
          title: "InSightAI Executive Report",
          summary: latestResponse?.answer || "No summary available.",
          insights: latestResponse?.insights || [],
          trends: latestResponse?.trends || [],
          risks: latestResponse?.risks || [],
          opportunities: latestResponse?.opportunities || [],
          kpis: latestResponse?.kpis || [],
        };
        const response = await generateReport(reportData);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `InsightAI_Report_${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const response = await exportData(format);

        if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `insightai_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `insightai_export_${Date.now()}.json`;
        a.click();
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      // Could show toast here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        id="export-button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        {isExporting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} style={{ color: 'var(--accent-primary)' }} />
        )}
        Export Data
      </motion.button>

      {/* Dropdown */}
      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute top-full right-0 mt-2 rounded-xl overflow-hidden z-50 min-w-[160px]"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <button
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <FileText size={14} style={{ color: '#ef4444' }} />
            Export as PDF Report
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <FileDown size={14} style={{ color: '#22c55e' }} />
            Export as CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <FileDown size={14} style={{ color: '#3b82f6' }} />
            Export as JSON
          </button>
        </motion.div>
      )}
    </div>
  );
}
