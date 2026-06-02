import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { aiService } from '../services/ai';
import { buildDatabaseContextSummary } from '../services/contextBuilder';
import {
  Sparkles,
  Send,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Brain
} from 'lucide-react';

// Simple markdown formatter to render headings, bolding, blockquotes and bullet points
const formatMarkdownToHTML = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Headers
    if (line.startsWith('### ')) {
      return <h4 key={idx} className="text-xs font-bold uppercase tracking-wider text-aurum mt-4 mb-2">{line.substring(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={idx} className="text-sm font-bold uppercase tracking-wider text-typography mt-5 mb-2.5 border-b border-border pb-1">{line.substring(3)}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={idx} className="text-base font-bold text-typography mt-6 mb-3">{line.substring(2)}</h2>;
    }
    
    // Blockquote
    if (line.startsWith('> ')) {
      return <blockquote key={idx} className="border-l-2 border-aurum bg-background-soft p-3 my-3 text-xs italic text-typography-muted">{line.substring(2)}</blockquote>;
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.substring(2);
      return <li key={idx} className="ml-4 list-disc text-xs text-typography-muted my-1">{parseInlineStyles(content)}</li>;
    }

    // Standard paragraph
    if (line.trim() === '') return <div key={idx} className="h-2"></div>;
    return <p key={idx} className="text-xs text-typography-muted my-2 leading-relaxed">{parseInlineStyles(line)}</p>;
  });
};

// Simple bolding helper
const parseInlineStyles = (text: string) => {
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-typography">{part}</strong>;
    }
    return part;
  });
};

export const AIAdvisorView: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'What should I focus on today?',
    'Which leads are highest priority?',
    'Who needs follow-up?',
    'What is my expected cash this month?',
    'Which deals are at risk?',
    'What should I do about MARCEM?',
    'Which leads are strategic but not near-term cash?'
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setAnswer(null);

    try {
      // 1. Build database context summary
      const contextSummary = await buildDatabaseContextSummary();
      
      // 2. Call Gemini
      const result = await aiService.askAdvisor(queryText, contextSummary);
      setAnswer(result);
    } catch (error: any) {
      setAnswer(`System Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl font-bold tracking-tight uppercase">AI Advisor Console</h1>
        <p className="text-xs text-typography-muted">Strategic assistant executing deep analysis over the current pipeline context</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminals Input / Suggestions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card-premium space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-typography">
              <Brain size={14} className="text-aurum" />
              <span>Prompt Shortcuts</span>
            </div>
            <div className="flex flex-col space-y-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(q);
                    handleAsk(q);
                  }}
                  className="w-full text-left text-[11px] p-2 border border-border rounded hover:border-aurum/40 hover:bg-background-soft transition-all text-typography-muted hover:text-typography"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Screen */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          {/* Answer screen */}
          <div className="card-premium flex-1 min-h-[300px] overflow-y-auto p-6 bg-background-card relative">
            {/* Aurum Glow Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 gold-gradient"></div>

            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-16">
                <Sparkles size={24} className="text-aurum animate-spin" />
                <span className="text-xs uppercase tracking-wider text-typography-light font-bold">Compiling workspace context...</span>
              </div>
            ) : answer ? (
              <div className="font-sans leading-relaxed">
                {formatMarkdownToHTML(answer)}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-typography-light py-24 space-y-2">
                <HelpCircle size={32} className="text-border" />
                <p className="text-xs uppercase tracking-wider font-bold">Workspace Advisor Offline</p>
                <p className="text-[10px] text-typography-light">Type a query below or select a shortcut prompt to begin diagnostics.</p>
              </div>
            )}
          </div>

          {/* User query input */}
          <div className="flex bg-background-card border border-border rounded-lg p-2 items-center shadow-premium">
            <input
              type="text"
              placeholder="Ask Advisor about cash flow, lead bottlenecks, or MARCEM..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAsk(question);
              }}
              className="bg-transparent border-none p-2 text-xs w-full focus:ring-0 focus:border-none focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={() => handleAsk(question)}
              disabled={loading || !question.trim()}
              className="bg-typography text-white p-2 rounded-lg hover:bg-typography/90 transition-all shrink-0 ml-2"
            >
              <Send size={14} className="text-aurum" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
