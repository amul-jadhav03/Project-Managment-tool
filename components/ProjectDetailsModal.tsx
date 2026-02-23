import React from 'react';
import { X, Users, Calendar, Clock, CheckCircle2, AlertCircle, Share2, FileText, Download } from 'lucide-react';
import { Task, Resource, TaskStatus } from '../types';
import { format, parseISO } from 'date-fns';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    name: string;
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    progress: number;
    totalHours: number;
    startDate: Date;
    endDate: Date;
    team: Resource[];
    status: string;
  } | null;
  tasks: Task[];
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ isOpen, onClose, project, tasks }) => {
  if (!isOpen || !project) return null;

  const projectTasks = tasks.filter(t => t.projectName === project.name);

  const handleShareReport = () => {
    const reportData = {
      project: project.name,
      status: project.status,
      progress: `${project.progress}%`,
      teamSize: project.team.length,
      totalHours: project.totalHours,
      tasks: projectTasks.map(t => ({ title: t.title, status: t.status }))
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Project report generated and downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center font-bold text-2xl border border-white/20">
              {project.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <div className="flex items-center gap-3 text-slate-400 mt-1 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                  project.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  project.status === 'At Risk' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {project.status}
                </span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {format(project.startDate, 'MMM d')} - {format(project.endDate, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShareReport}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              <Share2 size={16} /> Share Report
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={<Clock className="text-indigo-500" />} label="Total Hours" value={`${project.totalHours}h`} />
            <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Completed" value={project.completedTasks} />
            <StatCard icon={<AlertCircle className="text-red-500" />} label="Blocked" value={project.blockedTasks} />
            <StatCard icon={<Users className="text-blue-500" />} label="Team Size" value={project.team.length} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Team Section */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-indigo-600" /> Team Members
              </h3>
              <div className="space-y-3">
                {project.team.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full border border-white shadow-sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{member.name}</p>
                      <p className="text-xs text-slate-500 truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Section */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" /> Project Tasks
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">Task</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Status</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.duration}h</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            task.status === TaskStatus.BLOCKED ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {format(parseISO(task.date), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  </div>
);
