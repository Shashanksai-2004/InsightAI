import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import Message from './Message';

export default function Chat({ messages, onSend, isLoading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const suggestedQuestions = [
    "What are the key revenue trends?",
    "Identify the top 5 KPIs from this data",
    "What risks should we be aware of?",
    "Compare performance across time periods",
  ];

  return (
    <div className={`flex flex-col h-full relative ${messages.length === 0 ? 'justify-center items-center' : ''}`}>
      {/* Messages Area */}
      <div
        className={`flex-1 overflow-y-auto px-4 w-full ${messages.length === 0 ? 'flex-none h-auto pb-0 overflow-hidden' : 'py-6 space-y-4'}`}
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Sparkles size={48} style={{ color: 'var(--accent-primary)' }} />
            </motion.div>
            <h2 className="text-3xl font-extrabold mt-6 gradient-text tracking-tight">Ask InsightAI</h2>
            <p className="text-base mt-3 max-w-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Upload your business documents and ask questions. I'll analyze trends,
              extract KPIs, and provide actionable insights.
            </p>

            {/* Suggested Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-2xl w-full">
              {suggestedQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-hover)' }}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-left text-sm p-3.5 rounded-xl transition-all shadow-sm"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Sparkles size={12} className="inline mr-1.5" style={{ color: 'var(--accent-primary)' }} />
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <Message key={index} message={msg} index={index} />
            ))}
          </AnimatePresence>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl max-w-[85%]"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} className="animate-pulse" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analyzing</span>
              <span className="flex gap-0.5 ml-1">
                <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--accent-primary)' }} />
                <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--accent-primary)' }} />
                <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--accent-primary)' }} />
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Capsule Area */}
      <div 
        className={`px-6 w-full flex justify-center transition-all duration-700 ease-in-out z-10 ${messages.length === 0 ? 'mt-8 pb-0 static' : 'pb-8 pt-4 sticky bottom-0'}`} 
        style={{ background: messages.length === 0 ? 'transparent' : 'linear-gradient(to top, var(--bg-primary) 50%, transparent)' }}
      >
        <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
          <motion.div
            animate={{ scale: input ? 1.01 : 1 }}
            className="flex items-center rounded-full overflow-hidden transition-all duration-300 shadow-xl"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${input ? 'var(--border-active)' : 'var(--border-color)'}`,
              boxShadow: input ? 'var(--shadow-glow)' : 'var(--shadow-lg)',
              backdropFilter: 'blur(24px)'
            }}
          >
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Start typing your data query..."
              disabled={isLoading}
              className="flex-1 bg-transparent px-8 py-4 text-base outline-none disabled:opacity-50"
              style={{ color: 'var(--text-primary)' }}
            />
            <motion.button
              id="chat-send-button"
              type="submit"
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 m-2 mr-3 rounded-full disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center shrink-0"
              style={{
                background: input.trim() ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                color: input.trim() ? 'white' : 'var(--text-muted)',
              }}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
