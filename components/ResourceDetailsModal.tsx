import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Circle, Briefcase, Pencil, Save } from 'lucide-react';
import { Resource, Task, TaskStatus, PriorityConfig } from '../types';

interface ResourceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  tasks: Task[];
  date: Date;
  onUpdateTask: (task: Task) => void;
  priorityConfigs: PriorityConfig[];
}

export const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({ 
  isOpen, onClose, resource, tasks, date, onUpdateTask, priorityConfigs
}) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Task>>({});

  useEffect(() => {
    // Reset editing state when modal opens/closes or resource changes
    setEditingTaskId(null);
    setEditValues({});
  }, [isOpen, resource]);

  if (!isOpen || !resource) return null;

  const totalHours = tasks.reduce((sum, t) => sum + t.duration, 0);
  const remainingHours = resource.capacity - totalHours;

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditValues({
      title: task.title,
      description: task.description,
      duration: task.duration,
      status: task.status,
      priority: task.priority
    });
  };

  const handleSave = () => {
    if (!editingTaskId) return;
    const originalTask = tasks.find(t => t.id === editingTaskId);
    if (originalTask) {
      onUpdateTask({ ...originalTask, ...editValues } as Task);
    }
    setEditingTaskId(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingTaskId(null);
    setEditValues({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <img 
              src={resource.avatarUrl || `https://ui-avatars.com/api/?name=${resource.name}`} 
              alt={resource.name} 
              className="w-16 h-16 rounded-full border-4 border-slate-50 bg-slate-100"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{resource.name}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <Briefcase size={14} />
                <span>{resource.role} • {resource.department}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Capacity Summary */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 grid grid-cols-3 divide-x divide-slate-200 shrink-0">
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Load</div>
            <div className="text-lg font-bold text-slate-800">{totalHours}h</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Capacity</div>
            <div className="text-lg font-bold text-slate-800">{resource.capacity}h</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Available</div>
            <div className={`text-lg font-bold ${remainingHours < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {remainingHours > 0 ? `+${remainingHours}h` : `${remainingHours}h`}
            </div>
          </div>
        </div>

        {/* Date Context */}
        <div className="bg-white px-6 py-3 border-b border-slate-100 flex items-center justify-between text-sm shrink-0">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Calendar size={16} className="text-indigo-500" />
            <span>Tasks for {format(date, 'MMMM do, yyyy')}</span>
          </div>
          <div className="text-xs text-slate-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Task List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="text-slate-400" size={24} />
              </div>
              <p className="text-slate-500 font-medium">No tasks allocated for this date.</p>
            </div>
          ) : (
            tasks.map(task => (
              editingTaskId === task.id ? (
                // EDIT MODE
                <div key={task.id} className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-md space-y-3 animate-in fade-in duration-200">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Title</label>
                        <input 
                            type="text" 
                            value={editValues.title || ''} 
                            onChange={e => setEditValues({...editValues, title: e.target.value})}
                            className="w-full font-medium text-slate-800 border-b border-slate-200 focus:border-blue-500 focus:outline-none pb-1 text-sm mt-1"
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                        <textarea
                            value={editValues.description || ''}
                            onChange={e => setEditValues({...editValues, description: e.target.value})}
                            className="w-full text-sm text-slate-600 border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none mt-1 resize-none"
                            rows={2}
                            placeholder="Add description..."
                        />
                    </div>

                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Duration (hrs)</label>
                            <input 
                                type="number" 
                                value={editValues.duration || 0} 
                                onChange={e => setEditValues({...editValues, duration: parseFloat(e.target.value)})}
                                className="w-full text-sm border border-slate-200 rounded p-2 mt-1"
                                step="0.5" min="0.1"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Priority</label>
                            <select
                                value={editValues.priority}
                                onChange={e => setEditValues({...editValues, priority: e.target.value})}
                                className="w-full text-sm border border-slate-200 rounded p-2 mt-1 bg-white"
                            >
                                {priorityConfigs.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                            <select
                                value={editValues.status}
                                onChange={e => setEditValues({...editValues, status: e.target.value as TaskStatus})}
                                className="w-full text-sm border border-slate-200 rounded p-2 mt-1 bg-white"
                            >
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
                        <button 
                            onClick={handleCancel} 
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                        >
                            <X size={14}/> Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 shadow-sm"
                        >
                            <Save size={14}/> Save Changes
                        </button>
                    </div>
                </div>
              ) : (
                // VIEW MODE
                <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors group shadow-sm relative pr-10">
                    <button 
                        onClick={() => handleEditClick(task)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-blue-500 transition-colors p-1"
                        title="Edit Task"
                    >
                        <Pencil size={16} />
                    </button>

                    <div className="flex justify-between items-start mb-2 gap-2 pr-4">
                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{task.title}</h3>
                        <Badge status={task.status} />
                    </div>
                    
                    {task.description && (
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                            <Clock size={12} className="text-slate-400" /> {task.duration} hrs
                        </span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
                            {task.projectName}
                        </span>
                    </div>
                    {(() => {
                        const config = priorityConfigs.find(p => p.label === task.priority) || priorityConfigs[0];
                        return (
                            <span 
                                className="font-bold px-2 py-1 rounded shadow-sm border border-black/5"
                                style={{ backgroundColor: config?.color || '#f1f5f9', color: config?.textColor || '#475569' }}
                            >
                                {task.priority}
                            </span>
                        );
                    })()}
                    </div>
                </div>
              )
            ))
          )}
        </div>
      </div>
      
      {/* Backdrop click handler */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

const Badge = ({ status }: { status: TaskStatus }) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return <span className="shrink-0 bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>;
    case TaskStatus.IN_PROGRESS:
      return <span className="shrink-0 bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold flex items-center gap-1"><Clock size={10}/> In Progress</span>;
    case TaskStatus.BLOCKED:
      return <span className="shrink-0 bg-red-100 text-red-700 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold flex items-center gap-1"><AlertCircle size={10}/> Blocked</span>;
    default:
      return <span className="shrink-0 bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold flex items-center gap-1"><Circle size={10}/> To Do</span>;
  }
}