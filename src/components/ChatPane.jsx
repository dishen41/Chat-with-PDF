import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, User, Network } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function ChatPane({ messages, onSendMessage, isTyping }) {
  const [inputVal, setInputVal] = useState('');
  const [showDocs, setShowDocs] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "What was NVIDIA's first accelerator?",
    "Tesla Roadster production year?",
    "Summarize the context's main points"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    onSendMessage(text);
    setInputVal('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-bg relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-dark-pane/50 backdrop-blur-sm z-10 shrink-0">
        <h2 className="text-lg font-semibold tracking-wider text-slate-200 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-neon-violet" />
          NEURAL CHAT
        </h2>
        <button 
            onClick={() => setShowDocs(!showDocs)}
            className={twMerge(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", 
              showDocs ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10" : "border-slate-700 text-slate-400 hover:text-slate-200"
            )}
          >
            <Network className="w-3.5 h-3.5" />
            Context View
          </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 z-10 custom-scrollbar">
        <AnimatePresence>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={clsx(
                "flex gap-4 max-w-3xl",
                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                m.role === 'user' ? "bg-slate-800 text-slate-300" : "bg-neon-violet/20 text-neon-violet shadow-[0_0_15px_rgba(138,43,226,0.3)]"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
              </div>
              <div className={clsx(
                "px-4 md:px-5 py-3 md:py-3.5 rounded-2xl text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-slate-800/80 text-slate-200 border border-slate-700/50 backdrop-blur-sm"
                  : "bg-slate-900/60 text-slate-300 border border-neon-violet/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
              )}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                {showDocs && m.docs && m.docs.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-2 overflow-hidden"
                  >
                    <p className="text-xs text-neon-cyan font-medium uppercase tracking-wider mb-2">Retrieved Chunks (k={m.docs.length})</p>
                    {m.docs.map((doc, dIdx) => (
                      <div key={dIdx} className="bg-black/40 p-2.5 rounded text-xs text-slate-400 border border-white/5">
                        {doc}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex gap-4 max-w-3xl"
          >
             <div className="w-8 h-8 rounded-full bg-neon-violet/20 text-neon-violet shadow-[0_0_15px_rgba(138,43,226,0.3)] flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-slate-900/60 flex items-center gap-1.5 border border-neon-violet/10">
                <motion.div className="w-1.5 h-1.5 bg-neon-violet rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 bg-neon-violet rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 bg-neon-violet rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-dark-pane/30 backdrop-blur-md border-t border-white/5 z-10 shrink-0">
        {/* Suggestions */}
        <div className="flex gap-3 mb-4 overflow-x-auto custom-scrollbar pb-2">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(0, 240, 255, 0.15)' }}
              onClick={() => handleSend(s)}
              className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 text-xs text-slate-300 hover:border-neon-cyan hover:text-neon-cyan transition-colors"
            >
              {s}
            </motion.button>
          ))}
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
          className="relative"
        >
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Transmit inquiry to neural network..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 md:pl-5 pr-12 md:pr-14 py-3 md:py-4 text-sm text-slate-200 focus:outline-none focus:border-neon-violet focus:ring-1 focus:ring-neon-violet transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-neon-violet/10 text-neon-violet rounded-lg hover:bg-neon-violet hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-neon-violet/10 disabled:hover:text-neon-violet"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
