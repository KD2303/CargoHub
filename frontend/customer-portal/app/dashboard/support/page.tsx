"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HeadphonesIcon, MessageSquare, Phone, Mail, FileText, ChevronRight, X, Send, Loader2, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";import { toast } from '@/store/toastStore';


const faqs = [
  { q: "How do I track my shipment?", a: "You can track your shipment by entering the Order ID in the Track Shipment page or from your Orders list." },
  { q: "What are the cancellation charges?", a: "Cancellations made within 1 hour of booking are free. After that, a 10% fee is applied." },
  { q: "How do I add money to my Wallet?", a: "Go to the Payments page and click 'Add Funds'. You can pay via UPI, Credit Card, or Net Banking." },
];

export default function SupportPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: 'Hello! I am the CargoHub AI Support Bot. How can I help you with your logistics today?' }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ticket Form State
  const [ticketData, setTicketData] = useState({ orderId: "", issueType: "Delay in Delivery", description: "" });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { role: 'user' as const, content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + "/api/support/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setMessages(prev => [...prev, { role: 'model', content: data.data }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "Sorry, I am having trouble connecting right now." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, a network error occurred." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.description.trim()) {
      toast.error("Please provide a description of the issue.");
      return;
    }
    setIsSubmittingTicket(true);
    setTicketSuccess(false);

    // Simulate API call to POST /support/ticket
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setTicketSuccess(true);
      setTicketData({ orderId: "", issueType: "Delay in Delivery", description: "" });
      setTimeout(() => setTicketSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-display font-bold">Support</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>We're here to help. Get in touch with our team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Options */}
        <div className="col-span-1 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="feature-card group cursor-pointer"
            onClick={() => setIsChatOpen(true)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Ask AI Bot</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Instant AI replies</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="feature-card group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-600">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Call Us</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>+91 1800 123 4567</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="feature-card group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>support@cargohub.in</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Create Ticket & FAQs */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: "var(--brand-primary)" }} /> Raise a Ticket
            </h3>
            <form className="space-y-4" onSubmit={handleTicketSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Order ID (Optional)</label>
                  <input 
                    type="text" 
                    className="input-field py-2" 
                    placeholder="e.g. CH-0821" 
                    value={ticketData.orderId}
                    onChange={(e) => setTicketData({ ...ticketData, orderId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Issue Type</label>
                  <select 
                    className="input-field py-2 appearance-none"
                    value={ticketData.issueType}
                    onChange={(e) => setTicketData({ ...ticketData, issueType: e.target.value })}
                  >
                    <option>Delay in Delivery</option>
                    <option>Payment Issue</option>
                    <option>Vehicle Condition</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
                <textarea 
                  className="input-field py-2 h-24 resize-none" 
                  placeholder="Describe your issue..."
                  value={ticketData.description}
                  onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full flex justify-center items-center gap-2"
                disabled={isSubmittingTicket}
              >
                {isSubmittingTicket ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isSubmittingTicket ? "Submitting..." : ticketSuccess ? "Ticket Submitted!" : "Submit Ticket"}
              </button>
              {ticketSuccess && (
                <p className="text-sm text-green-600 text-center mt-2 font-medium">We have received your ticket and will contact you shortly.</p>
              )}
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="font-semibold text-lg mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">{faq.q}</h4>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-0 right-0 w-full h-[80vh] lg:h-[600px] lg:w-[450px] lg:bottom-6 lg:right-6 bg-white dark:bg-gray-900 shadow-2xl lg:rounded-2xl flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-gray-800"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-blue-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">CargoHub AI Support</h3>
                    <p className="text-xs text-blue-100 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%] flex-row">
                      <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm flex items-center gap-1 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 input-field py-3 rounded-full"
                    disabled={isTyping}
                  />
                  <button 
                    type="submit" 
                    disabled={isTyping || !inputText.trim()}
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
