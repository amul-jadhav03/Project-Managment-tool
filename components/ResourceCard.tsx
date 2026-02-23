import React from 'react';
import { Resource, Task, TaskStatus } from '../types';
import { Briefcase, AlertCircle, CheckCircle2, Clock, Coffee } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  tasks: Task[];
  onClick: () => void;
  isOnLeave?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, tasks, onClick, isOnLeave = false }) => {
  const totalHours = tasks.reduce((sum, t) => sum + t.duration, 0);
  const remainingHours = resource.capacity - totalHours;
  const utilization = (totalHours / resource.capacity) * 100;
  
  // Status Visuals
  let statusBg = 'bg-emerald-50';
  let statusBorder = 'border-emerald-100';
  let statusText = 'text-emerald-700';
  let barColor = 'bg-emerald-500';
  let label = `${Math.round(remainingHours * 10) / 10}h Available`;
  
  if (isOnLeave) {
    statusBg = 'bg-slate-100';
    statusBorder = 'border-slate-200';
    statusText = 'text-slate-500';
    barColor = 'bg-slate-300';
    label = 'ON LEAVE';
  } else if (remainingHours < 0) {
    statusBg = 'bg-red-50';
    statusBorder = 'border-red-100';
    statusText = 'text-red-700';
    barColor = 'bg-red-500';
    label = `${Math.abs(Math.round(remainingHours * 10) / 10)}h Over Limit`;
  } else if (remainingHours === 0) {
    statusBg = 'bg-slate-50';
    statusBorder = 'border-slate-100';
    statusText = 'text-slate-700';
    barColor = 'bg-slate-500';
    label = 'At Capacity';
  } else if (utilization > 80) {
    statusBg = 'bg-amber-50';
    statusBorder = 'border-amber-100';
    statusText = 'text-amber-700';
    barColor = 'bg-amber-500';
    label = `${Math.round(remainingHours * 10) / 10}h Left (Low)`;
  }

  const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const blocked = tasks.filter(t => t.status === TaskStatus.BLOCKED).length;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full relative ${isOnLeave ? 'opacity-80 grayscale-[0.5]' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
           <div className="relative shrink-0">
             <img 
               src={resource.avatarUrl || `https://ui-avatars.com/api/?name=${resource.name}`} 
               alt={resource.name} 
               className="w-12 h-12 rounded-full bg-slate-100 object-cover border border-slate-100"
             />
             {!isOnLeave && remainingHours < 0 && (
               <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-red-100">
                 <AlertCircle size={14} className="text-red-500 fill-red-50" />
               </div>
             )}
             {isOnLeave && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-200">
                    <Coffee size={14} className="text-slate-500 fill-slate-100" />
                </div>
             )}
           </div>
           <div className="min-w-0">
             <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{resource.name}</h3>
             <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
               <Briefcase size={12} className="shrink-0" /> {resource.role}
             </p>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end space-y-4">
        {resource.skills && resource.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {resource.skills.slice(0, 3).map(skill => (
              <span key={skill} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded border border-slate-100 uppercase tracking-tight">
                {skill}
              </span>
            ))}
            {resource.skills.length > 3 && (
              <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded border border-slate-100 uppercase tracking-tight">
                +{resource.skills.length - 3}
              </span>
            )}
          </div>
        )}
        {/* Prominent Capacity Indicator */}
        <div className={`rounded-lg border px-3 py-2.5 ${statusBg} ${statusBorder} ${statusText}`}>
           <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">{label}</span>
              {!isOnLeave && (
                <div className="text-right leading-none">
                    <span className="text-sm font-bold">{totalHours}</span>
                    <span className="text-xs opacity-70">/{resource.capacity}h</span>
                </div>
              )}
           </div>
           
           {/* Progress Bar */}
           <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden backdrop-blur-sm">
             <div 
               className={`h-full rounded-full ${barColor} transition-all duration-500`} 
               style={{ width: isOnLeave ? '100%' : `${Math.min(utilization, 100)}%` }} 
             />
           </div>
        </div>

        {/* Task Summary */}
        <div className="flex justify-between items-center text-xs text-slate-500 px-1 pt-1">
             <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400" />
                <span>{tasks.length} Assigned</span>
             </div>
             
             <div className="flex items-center gap-3">
               {blocked > 0 && (
                 <div className="flex items-center gap-1.5 text-red-600 font-medium">
                    <AlertCircle size={12} />
                    <span>{blocked} Blocked</span>
                 </div>
               )}
               {completed > 0 && (
                 <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 size={12} />
                    <span>{completed} Done</span>
                 </div>
               )}
             </div>
        </div>
      </div>
    </div>
  );
};