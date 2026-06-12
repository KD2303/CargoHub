"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function AIDrawer() {
  const { user } = useAuthStore();
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    { role: "ai", text: `Hi ${firstName}! I'm your CargoHub AI. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    "What vehicle for 800kg?",
    "Track my last booking",
    "Estimate Mumbai → Thane"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      setIsTyping(false);
      let response = "I can help with that. Please contact support for more detailed assistance.";
      if (text.includes("800kg")) {
        response = "For 800kg, I'd recommend a Tempo (up to 1 ton). It's the most cost-effective for that weight class.";
      } else if (text.includes("Mumbai")) {
        response = "A trip from Mumbai to Thane typically takes ~45 mins and costs around ₹480 - ₹550 depending on the vehicle.";
      }
      setMessages(prev => [...prev, { role: "ai", text: response }]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full text-white shadow-lg shadow-blue-900/20"
        style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))" }}
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold text-sm">Ask AI</span>
      </motion.button>

      {/* Slide-up Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-[340px] h-[500px] z-50 glass flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ 
              border: "1px solid var(--border-hover)", 
              background: "var(--bg-glass)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)"
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex justify-between items-center border-b" style={{ borderColor: "var(--border-subtle)", background: "rgba(2, 89, 221, 0.08)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" }}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>CargoHub AI</h3>
                  <p className="text-[10px] flex items-center gap-1 text-green-500 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" style={{ background: "rgba(0, 0, 0, 0.01)" }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 text-sm rounded-2xl ${msg.role === 'user' ? 'rounded-tr-sm text-white' : 'rounded-tl-sm shadow-sm'}`}
                    style={{ 
                      background: msg.role === 'user' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                    <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 border-t" style={{ borderColor: "var(--border-subtle)", background: "rgba(0, 0, 0, 0.02)" }}>
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(s)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors text-left hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ 
                      borderColor: "var(--border-subtle)", 
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)" 
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-glass)", backdropFilter: "blur(12px)" }}>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..." 
                  className="flex-1 py-2 px-3 text-sm rounded-xl outline-none focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
                  style={{ 
                    background: "var(--bg-secondary)", 
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)"
                  }}
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-50 transition-colors cursor-pointer"
                  style={{ background: "var(--brand-secondary)" }}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
