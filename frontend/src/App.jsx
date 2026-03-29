import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import ChartPanel from './components/ChartPanel';
import InsightPanel from './components/InsightPanel';
import SourceCard from './components/SourceCard';
import ExportButton from './components/ExportButton';
import { uploadFiles, askQuestion, getHealth, clearAll, getFiles, getHistory } from './services/api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [health, setHealth] = useState(null);
  const [latestResponse, setLatestResponse] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Fetch initial data (files and history) on load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [filesRes, historyRes] = await Promise.all([
          getFiles(),
          getHistory()
        ]);
        if (filesRes?.files) {
          setFiles(filesRes.files);
        }
        if (historyRes?.history && historyRes.history.length > 0) {
          setMessages(historyRes.history);
          const lastAssistant = [...historyRes.history].reverse().find(m => m.role === 'assistant');
          if (lastAssistant && lastAssistant.data) {
            setLatestResponse(lastAssistant.data);
            if (
              lastAssistant.data.kpis?.length > 0 ||
              lastAssistant.data.insights?.length > 0 ||
              lastAssistant.data.trends?.length > 0
            ) {
              setShowRightPanel(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchInitialData();
  }, []);

  // Health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await getHealth();
        setHealth(data);
      } catch {
        setHealth(null);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle file upload
  const handleUpload = useCallback(async (selectedFiles) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFiles(selectedFiles, (progress) => {
        setUploadProgress(progress);
      });

      if (result.results) {
        const successful = result.results.filter((r) => r.status === 'success');
        const failed = result.results.filter((r) => r.status === 'error');

        if (successful.length > 0) {
          toast.success(`${successful.length} file(s) uploaded successfully!`, {
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            },
          });
        }

        if (failed.length > 0) {
          failed.forEach((f) => {
            toast.error(`Failed: ${f.filename} - ${f.message}`, {
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--danger)',
              },
            });
          });
        }

        // Update files list
        setFiles((prev) => [
          ...prev,
          ...successful.map((r) => ({
            file_id: r.file_id,
            filename: r.filename,
            type: '.' + r.filename.split('.').pop().toLowerCase(),
            chunks: r.chunks,
            has_structured_data: r.has_structured_data,
          })),
        ]);

        // Refresh health
        try {
          const h = await getHealth();
          setHealth(h);
        } catch { }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed. Is the backend running?', {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--danger)',
        },
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Handle ask question
  const handleAsk = useCallback(async (question) => {
    // Add user message
    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askQuestion(question);

      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        data: response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLatestResponse(response);

      // Show right panel if we have data
      if (
        response.kpis?.length > 0 ||
        response.insights?.length > 0 ||
        response.trends?.length > 0
      ) {
        setShowRightPanel(true);
      }
    } catch (error) {
      const errorMsg = {
        role: 'assistant',
        content: error.response?.data?.detail || 'Something went wrong. Please try again.',
        data: null,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle clear
  const handleClear = useCallback(async () => {
    try {
      await clearAll();
      setFiles([]);
      setMessages([]);
      setLatestResponse(null);
      setHealth((prev) => prev ? { ...prev, files_loaded: 0, chunks_indexed: 0 } : null);
      toast.success('All data cleared', {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        },
      });
    } catch (error) {
      toast.error('Failed to clear');
    }
  }, []);

  const hasRightPanelData = latestResponse && (
    latestResponse.kpis?.length > 0 ||
    latestResponse.insights?.length > 0 ||
    latestResponse.sources?.length > 0
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar
        files={files}
        messages={messages}
        onUpload={handleUpload}
        onClear={handleClear}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        health={health}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
        >
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              AI Business Analyst
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Ask questions about your uploaded data
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasRightPanelData && (
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: showRightPanel ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                  border: `1px solid ${showRightPanel ? 'var(--border-active)' : 'var(--border-color)'}`,
                  color: showRightPanel ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
              >
                {showRightPanel ? '◀ Hide Panel' : '▶ Show Panel'}
              </button>
            )}
            <ExportButton />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-1 min-h-0">
          {/* Chat */}
          <div className={`flex-1 flex flex-col min-w-0 ${hasRightPanelData && showRightPanel ? '' : ''}`}>
            <Chat messages={messages} onSend={handleAsk} isLoading={isLoading} />
          </div>

          {/* Right Panel - Charts & Insights */}
          <AnimatePresence>
            {hasRightPanelData && showRightPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="border-l overflow-y-auto"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
              >
                <div className="p-4 space-y-4">
                  {/* Charts */}
                  {latestResponse?.kpis?.length > 0 && (
                    <ChartPanel kpis={latestResponse.kpis} />
                  )}

                  {/* Insights */}
                  <InsightPanel data={latestResponse} />

                  {/* Sources */}
                  {latestResponse?.sources?.length > 0 && (
                    <SourceCard sources={latestResponse.sources} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
