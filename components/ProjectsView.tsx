import React, { useMemo } from 'react';
import { Task, Resource, TaskStatus } from '../types';
import { format, parseISO } from 'date-fns';
import { Calendar, Users, Clock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProjectsViewProps {
  tasks: Task[];
  resources: Resource[];
  onProjectSelect?: (projectName: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ tasks, resources, onProjectSelect }) => {
  
  const projects = useMemo(() => {
    const uniqueProjects = Array.from(new Set(tasks.map(t => t.projectName))).sort();
    
    return uniqueProjects.filter(p => p !== 'General' && p !== 'All').map(name => {
      const projectTasks = tasks.filter(t => t.projectName === name);
      
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const blockedTasks = projectTasks.filter(t => t.status === TaskStatus.BLOCKED).length;
      const inProgressTasks = projectTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
      
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      const totalHours = projectTasks.reduce((sum, t) => sum + t.duration, 0);
      
      // Calculate dates
      const dates = projectTasks.map(t => new Date(t.date).getTime()).filter(d => !isNaN(d));
      const startDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
      const endDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
      
      // Get unique resources involved
      const resourceIds = Array.from(new Set(projectTasks.map(t => t.assignedResourceId)));
      const team = resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
      
      let status: 'On Track' | 'At Risk' | 'Completed' | 'Planning' = 'On Track';
      if (progress === 100) status = 'Completed';
      else if (blockedTasks > 0) status = 'At Risk';
      else if (inProgressTasks === 0 && completedTasks === 0) status = 'Planning';

      return {
        name,
        totalTasks,
        completedTasks,
        blockedTasks,
        progress,
        totalHours,
        startDate,
        endDate,
        team,
        status
      };
    });
  }, [tasks, resources]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Projects Portfolio</h1>
        <p className="text-slate-500">Track progress, timelines, and health of all active initiatives.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map(project => (
          <div key={project.name} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Left Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl border border-indigo-100">
                    {project.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{project.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                        project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        project.status === 'At Risk' ? 'bg-red-50 text-red-700 border-red-100' :
                        project.status === 'Planning' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {project.status}
                      </span>
                      <span className="text-slate-300">•</span>
                      <Calendar size={14} />
                      <span>{format(project.startDate, 'MMM d')} - {format(project.endDate, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 pl-[60px]">
                  Project involving {project.totalTasks} tasks across {project.team.length} team members. 
                  {project.blockedTasks > 0 ? ` currently has ${project.blockedTasks} blocked tasks requiring attention.` : ' moving forward smoothly.'}
                </p>

                <div className="pl-[60px] flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 5).map(member => (
                      <img 
                        key={member.id}
                        src={member.avatarUrl} 
                        alt={member.name}
                        title={`${member.name} - ${member.role}`}
                        className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 hover:z-10 relative transition-transform hover:scale-110" 
                      />
                    ))}
                    {project.team.length > 5 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                        +{project.team.length - 5}
                      </div>
                    )}
                  </div>
                  {project.team.length === 0 && <span className="text-sm text-slate-400 italic">No team assigned</span>}
                </div>
              </div>

              {/* Right Stats */}
              <div className="w-full md:w-64 shrink-0 bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-slate-700">Progress</span>
                  <span className="text-xl font-bold text-indigo-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                      project.status === 'At Risk' ? 'bg-red-500' : 
                      project.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`} 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                   <div className="flex items-center gap-2 text-slate-600">
                     <Clock size={16} className="text-slate-400" />
                     <span>{project.totalHours}h Est.</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-600">
                     <CheckCircle2 size={16} className="text-emerald-500" />
                     <span>{project.completedTasks} Done</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-600">
                     <AlertCircle size={16} className={project.blockedTasks > 0 ? "text-red-500" : "text-slate-400"} />
                     <span className={project.blockedTasks > 0 ? "text-red-600 font-medium" : ""}>{project.blockedTasks} Blocked</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-600">
                     <Users size={16} className="text-slate-400" />
                     <span>{project.team.length} Members</span>
                   </div>
                </div>

                <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-medium bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 py-2 rounded-lg transition-colors">
                  View Details <ArrowRight size={12} />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};