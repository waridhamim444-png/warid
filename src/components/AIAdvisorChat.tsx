import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, RefreshCw, HelpCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { FBACaseContext } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIAdvisorChatProps {
  caseContext: FBACaseContext;
  initialPrompt?: string;
}

export const AIAdvisorChat: React.FC<AIAdvisorChatProps> = ({
  caseContext,
  initialPrompt,
}) => {
  const getInitialWelcome = (asin?: string, marketplace?: string): Message => ({
    role: 'assistant',
    content: asin
      ? `Hello! I am your Amazon FBA Business Analysis Advisor for **ASIN ${asin}** (${marketplace || 'USA'} Marketplace).\n\nI specialize in **root-cause listing diagnostics**, **compliant review acceleration (Vine & Request-a-Review)**, **Search Query Performance**, and **unit economics**.\n\nHow can I help you diagnose and optimize your listing today?`
      : `Hello! I am your Amazon FBA Business Analysis Advisor (${marketplace || 'USA'} Marketplace).\n\nI can help you diagnose listing conversion bottlenecks, design 100% TOS-compliant review strategies, and analyze competitive unit economics.\n\nWhat FBA question or scenario would you like to explore?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<Message[]>([
    getInitialWelcome(caseContext.asin, caseContext.marketplace),
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync welcome message if case changes
  useEffect(() => {
    setMessages([getInitialWelcome(caseContext.asin, caseContext.marketplace)]);
  }, [caseContext.asin, caseContext.marketplace]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const targetAsin = caseContext.asin || 'my product';

  const quickQuestions = [
    `How do I enroll ASIN ${targetAsin} into Amazon Vine step-by-step?`,
    `How can I use competitor 1-star reviews to write higher-converting bullets?`,
    `What is the best PPC campaign setup to steal sales from this competitor?`,
    `How do I pull the Search Query Performance report in Seller Central?`,
  ];

  const handleResetChat = () => {
    setMessages([getInitialWelcome(caseContext.asin, caseContext.marketplace)]);
    setInput('');
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/fba/ask-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context: caseContext,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || 'Failed to get advisor reply');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `**Advisor Operational Note:** ${err.message || 'Unable to connect to Gemini API. Please ensure your GEMINI_API_KEY is configured in Settings.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col h-[650px]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              AI FBA Strategy Advisor (Gemini 3.7 Flash)
            </h3>
            <p className="text-[11px] text-slate-500">
              Context-locked to ASIN <strong className="font-mono text-slate-700">{caseContext.asin || 'Unassigned'}</strong> ({caseContext.marketplace})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            TOS-Strict Mode
          </span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="py-2.5 overflow-x-auto flex gap-1.5 shrink-0 border-b border-slate-50 scrollbar-none">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-slate-200 rounded-lg whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs sm:text-sm ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-xl p-3.5 leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-xs'
              }`}
            >
              {m.content}
              <div
                className={`text-[10px] mt-1.5 font-mono ${
                  m.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </div>
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-500 italic flex items-center gap-2">
              Analyzing marketplace mechanics & Seller Central protocols...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              caseContext.asin
                ? `Ask a specific strategy question about ASIN ${caseContext.asin}...`
                : 'Ask a specific Amazon FBA strategy or listing diagnostic question...'
            }
            className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
