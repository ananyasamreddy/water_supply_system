import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, BookOpen, AlertCircle } from 'lucide-react';
import { apiService } from '../api/apiClient';

export default function GeminiAssistantModal({ isOpen, onClose, initialContext = null }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your AI Engineering Decision-Support Assistant. I can explain why specific pipelines have high failure risk, summarize hydraulic simulation results, analyze what-if scenarios, or clarify technical terms for your viva presentation. How can I help you today?",
      source: 'Gemini 1.5 Flash Decision Engine'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputQuestion.trim()) return;

    const userQ = inputQuestion;
    setInputQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setLoading(true);

    try {
      const res = await apiService.askAssistant({
        promptType: initialContext?.type || 'GENERAL',
        contextData: initialContext?.data || {},
        userQuestion: userQ
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.explanation,
          source: res.data.source
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'I encountered an error communicating with the decision engine. The system operates using validated predictive models on simulated hydraulics.',
          source: 'System Diagnostic'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q, type = 'GENERAL') => {
    setInputQuestion(q);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Municipal Engineering Decision Assistant
              </h2>
              <p className="text-[11px] text-slate-400">Contextual engineering guidance and operational recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Pill */}
        <div className="bg-sky-950/40 px-4 py-2 border-b border-sky-900/40 text-[11px] text-sky-300 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Decision assistant provides contextual analysis based on physics models and asset integrity metrics.</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-purple-900/60 border border-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-purple-300" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                {m.source && (
                  <div className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-1.5 mt-1 font-mono">
                    Engine: {m.source}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-xs text-purple-400 animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Gemini is generating engineering analysis...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleQuickQuestion("Why is Pipeline P-102 marked as High Risk?", "FAILURE_RISK")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
          >
            Why is P-102 High Risk?
          </button>
          <button
            onClick={() => handleQuickQuestion("Explain how the Hazen-Williams head loss equation works.", "GENERAL")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
          >
            Hazen-Williams Equation?
          </button>
          <button
            onClick={() => handleQuickQuestion("Summarize the impact of What-If scenario: Pipe failure on P-102.", "WHAT_IF")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
          >
            What-If P-102 Failure Impact?
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={e => setInputQuestion(e.target.value)}
            placeholder="Ask AI about failure risk, what-if, or viva questions..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
