import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { generateTaskInsights } from '../services/geminiService';
import { Resource, Task } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  resources: Resource[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, tasks, resources }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setResponse(null);
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAsk = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse(null);
    const result = await generateTaskInsights(tasks, resources, query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-300" />
            <h2 className="text-xl font-bold">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {!response && !loading && (
            <div className="text-center py-12 text-slate-500">
              <Sparkles size={48} className="mx-auto text-indigo-200 mb-4" />
              <p className="text-lg font-medium text-slate-700">How can I help you manage your team today?</p>
              <p className="text-sm mt-2">Try asking: "Who is overloaded today?" or "Summarize the project status."</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                 <button onClick={() => setQuery("Who has the most tasks today?")} className="text-sm bg-white border border-slate-200 p-3 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors text-left">
                   Who has the most tasks today?
                 </button>
                 <button onClick={() => setQuery("Identify any blocked tasks.")} className="text-sm bg-white border border-slate-200 p-3 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors text-left">
                   Identify any blocked tasks.
                 </button>
                 <button onClick={() => setQuery("Suggest a resource reallocation.")} className="text-sm bg-white border border-slate-200 p-3 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors text-left">
                   Suggest a resource reallocation.
                 </button>
                 <button onClick={() => setQuery("Summarize today's progress.")} className="text-sm bg-white border border-slate-200 p-3 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors text-left">
                   Summarize today's progress.
                 </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500 animate-pulse">Analyzing schedule and resources...</p>
            </div>
          )}

          {response && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="prose prose-sm text-slate-700 max-w-none">
                 {/* Simple formatting for the AI response text */}
                 {response.split('\n').map((line, i) => (
                   <p key={i} className="mb-2 last:mb-0">{line}</p>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask me anything about the schedule..."
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button 
              onClick={handleAsk}
              disabled={loading || !query.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
