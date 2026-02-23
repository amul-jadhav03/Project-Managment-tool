import React from 'react';
import { X, History, Clock, User, ArrowRight, Tag, RefreshCw } from 'lucide-react';
import { Task, TaskHistoryItem } from '../types';
import { format } from 'date-fns';

interface TaskHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  const history = task.history || [];

  const getFieldIcon = (field: TaskHistoryItem['field']) => {
    switch (field) {
      case 'status':
        return <RefreshCw size={14} className="text-emerald-500" />;
      case 'assignee':
        return <User size={14} className="text-blue-500" />;
      case 'priority':
        return <Tag size={14} className="text-amber-500" />;
      default:
        return <Clock size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <History size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Task History</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[250px]">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto text-slate-200 mb-3" size={48} />
              <p className="text-slate-500 font-medium">No history recorded for this task yet.</p>
              <p className="text-xs text-slate-400 mt-1">Changes to status, assignee, or priority will appear here.</p>
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {history.slice().reverse().map((item) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  <div className="absolute left-0 mt-1 w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center z-10 shadow-sm">
                    {getFieldIcon(item.field)}
                  </div>
                  <div className="ml-12 flex-1 pt-0.5">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {item.field} changed
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full">
                        {format(new Date(item.timestamp), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 line-through decoration-slate-300">{item.oldValue}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className="font-bold text-slate-900">{item.newValue}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Changed by <span className="font-bold text-slate-600">{item.changedBy}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
