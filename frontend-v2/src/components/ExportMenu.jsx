import { useState, useRef, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, FileJson, ChevronDown } from 'lucide-react'

const ITEMS = [
  { label: 'PDF Report', format: 'pdf', Icon: FileText },
  { label: 'CSV Data', format: 'csv', Icon: FileSpreadsheet },
  { label: 'JSON Data', format: 'json', Icon: FileJson },
]

export default function ExportMenu({ onExport }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-body bg-surface-3/80 hover:bg-surface-4 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4 text-muted" />
        <span className="flex-1 text-left">Export</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-dim transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full mb-1.5 left-0 right-0 bg-surface-2 border border-line rounded-lg shadow-2xl py-1 z-50">
          {ITEMS.map(({ label, format, Icon }) => (
            <button
              key={format}
              onClick={() => {
                onExport(format)
                setOpen(false)
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-body hover:bg-surface-3 transition-colors"
            >
              <Icon className="w-4 h-4 text-muted" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
