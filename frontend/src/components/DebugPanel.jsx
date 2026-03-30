import React, { useState } from 'react';
import './DebugPanel.css';

const DebugPanel = ({ debugData, performanceData, rawResponse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Response');
  
  if (!debugData && !performanceData && !rawResponse) return null;

  const handleCopy = (content) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    alert('Copied to clipboard!');
  };

  const renderJson = (data) => (
    <pre className="debug-json">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  return (
    <>
      <button 
        className="debug-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Debug Mode"
      >
        🐞 Debug Mode {performanceData?.total_ms && `(${performanceData.total_ms}ms)`}
      </button>

      {isOpen && (
        <div className="debug-panel-container">
          <div className="debug-header">
            <h3>Debug Console</h3>
            <div className="debug-tabs">
              <button 
                className={activeTab === 'Response' ? 'active' : ''} 
                onClick={() => setActiveTab('Response')}
              >Response</button>
              <button 
                className={activeTab === 'Retrieval' ? 'active' : ''} 
                onClick={() => setActiveTab('Retrieval')}
              >Retrieval</button>
              <button 
                className={activeTab === 'Performance' ? 'active' : ''} 
                onClick={() => setActiveTab('Performance')}
              >Performance</button>
              <button 
                className={activeTab === 'Logs' ? 'active' : ''} 
                onClick={() => setActiveTab('Logs')}
              >Logs</button>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="debug-content">
            {activeTab === 'Response' && (
              <div className="debug-section">
                <div className="section-header">
                  <h4>Raw JSON Response</h4>
                  <button className="copy-btn" onClick={() => handleCopy(rawResponse)}>Copy</button>
                </div>
                {renderJson(rawResponse)}
              </div>
            )}

            {activeTab === 'Retrieval' && (
              <div className="debug-section">
                <div className="section-header">
                  <h4>Retrieved Documents & Scores</h4>
                  <button className="copy-btn" onClick={() => handleCopy({ docs: debugData?.retrieved_docs, scores: debugData?.rerank_scores })}>Copy</button>
                </div>
                <p><strong>Model Engine:</strong> {debugData?.model_used}</p>
                {debugData?.retrieved_docs?.map((doc, idx) => (
                  <div key={idx} className="retrieval-item">
                    <span className="doc-score">Score: {debugData?.rerank_scores?.[idx]?.toFixed(4) || 'N/A'}</span>
                    <pre className="doc-text">{doc}</pre>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Performance' && (
              <div className="debug-section">
                <div className="section-header">
                  <h4>Latency Metrics</h4>
                  <button className="copy-btn" onClick={() => handleCopy(performanceData)}>Copy</button>
                </div>
                {performanceData ? (
                  <div className="metrics-grid">
                    <div className="metric-box">
                      <span className="metric-label">Retrieval</span>
                      <span className="metric-value">{performanceData.retrieval_ms} ms</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Reranking</span>
                      <span className="metric-value">{performanceData.rerank_ms} ms</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">LLM Generarion</span>
                      <span className="metric-value">{performanceData.llm_ms} ms</span>
                    </div>
                    <div className="metric-box total">
                      <span className="metric-label">Total Latency</span>
                      <span className="metric-value">{performanceData.total_ms} ms</span>
                    </div>
                  </div>
                ) : (
                  <p>No performance data available.</p>
                )}
              </div>
            )}

            {activeTab === 'Logs' && (
              <div className="debug-section">
                <div className="section-header">
                  <h4>System Logs</h4>
                  <button className="copy-btn" onClick={() => handleCopy(debugData?.logs)}>Copy</button>
                </div>
                <div className="logs-container">
                  {debugData?.logs?.map((log, idx) => (
                    <div key={idx} className="log-line">
                      <span className="log-timestamp">{new Date().toISOString().split('T')[1].slice(0, 8)}</span>
                      <span className="log-message">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
