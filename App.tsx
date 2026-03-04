import React, { useEffect, useState, useMemo } from 'react';
import { format, isSameDay, parseISO, addDays, isWithinInterval, differenceInDays } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, RefreshCw, Construction, Layers, CheckSquare, ArrowRight, LayoutList, Users, LayoutGrid, List } from 'lucide-react';

import { Layout } from './components/Layout';
import { ResourceCard } from './components/ResourceCard';
import { TeamView } from './components/TeamView';
import { ProjectsView } from './components/ProjectsView';
import { ReportsView } from './components/ReportsView';
import { LeavesView } from './components/LeavesView';
import { CapacityPlanningView } from './components/CapacityPlanningView';
import { SettingsView } from './components/SettingsView';
import { TasksView } from './components/TasksView';
import { SkillsMatrixView } from './components/SkillsMatrixView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ResourceDetailsModal } from './components/ResourceDetailsModal';
import { NotificationCenter } from './components/NotificationCenter';
import { fetchSheetData } from './services/sheetService';
import { AppState, FilterState, Resource, Task, TaskStatus, Leave, PriorityConfig, Notification, TaskHistoryItem } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    resources: [],
    tasks: [],
    leaves: [],
    projects: [],
    priorityConfigs: [],
    notifications: [],
    isLoading: true,
    error: null,
  });

  const [filters, setFilters] = useState<FilterState>({
    date: new Date(),
    project: 'All',
    role: 'All',
    department: 'All',
    search: '',
    skill: 'All',
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [isAIModalOpen, setAIModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [projectsViewMode, setProjectsViewMode] = useState<'tile' | 'list'>('tile');
  const [resourceViewMode, setResourceViewMode] = useState<'tile' | 'list'>('tile');

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const { resources, tasks, leaves, priorityConfigs } = await fetchSheetData();
        
        // Extract unique projects
        const uniqueProjects = Array.from(new Set(tasks.map(t => t.projectName))).sort();
        
        setState({
          resources,
          tasks,
          leaves,
          projects: ['All', ...uniqueProjects],
          priorityConfigs,
          notifications: [],
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to load data. Please check your connection.' 
        }));
      }
    };
    loadData();
  }, []);

  // Filter Options
  const uniqueDepartments = useMemo(() => ['All', ...Array.from(new Set(state.resources.map(r => r.department))).sort()], [state.resources]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    state.resources.forEach(r => r.skills?.forEach(s => skills.add(s)));
    state.tasks.forEach(t => t.requiredSkills?.forEach(s => skills.add(s)));
    return ['All', ...Array.from(skills).sort()];
  }, [state.resources, state.tasks]);

  // Project Aggregation Logic
  const projectMetrics = useMemo(() => {
    return state.projects.filter(p => p !== 'All').map(projectName => {
      const projTasks = state.tasks.filter(t => t.projectName === projectName);
      const completed = projTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const total = projTasks.length;
      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
      const hours = projTasks.reduce((sum, t) => sum + t.duration, 0);
      
      return {
        name: projectName,
        total,
        completed,
        progress,
        hours,
        status: progress === 100 ? 'Completed' : progress > 50 ? 'On Track' : 'In Progress'
      };
    })
    .filter(p => !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()))
    .sort((a, b) => b.progress - a.progress);
  }, [state.tasks, state.projects, filters.search]);

  // Filter Logic for Resource View
  const filteredResources = useMemo(() => {
    return state.resources.filter(resource => {
      const roleMatch = filters.role === 'All' || resource.role === filters.role;
      const deptMatch = filters.department === 'All' || resource.department === filters.department;
      const skillMatch = filters.skill === 'All' || resource.skills?.includes(filters.skill);
      const searchMatch = !filters.search || 
        resource.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.role.toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.department.toLowerCase().includes(filters.search.toLowerCase());
      return roleMatch && deptMatch && skillMatch && searchMatch;
    });
  }, [state.resources, filters.role, filters.department, filters.skill, filters.search]);

  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => {
      const taskDate = parseISO(task.date);
      const isDateMatch = isSameDay(taskDate, filters.date);
      const isProjectMatch = filters.project === 'All' || task.projectName === filters.project;
      const isSkillMatch = filters.skill === 'All' || task.requiredSkills?.includes(filters.skill);
      
      const resource = state.resources.find(r => r.id === task.assignedResourceId);
      if (!resource) return false;
      const isRoleMatch = filters.role === 'All' || resource.role === filters.role;
      const isDeptMatch = filters.department === 'All' || resource.department === filters.department;
      const isResourceSkillMatch = filters.skill === 'All' || resource.skills?.includes(filters.skill);

      const searchMatch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.projectName.toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.name.toLowerCase().includes(filters.search.toLowerCase());

      return isDateMatch && isProjectMatch && isRoleMatch && isDeptMatch && isSkillMatch && isResourceSkillMatch && searchMatch;
    });
  }, [state.tasks, state.resources, filters]);

  // Derived Stats
  const stats = useMemo(() => {
    const totalProjects = state.projects.length - 1; // Exclude 'All'
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    return { totalProjects, totalTasks, completedTasks };
  }, [state.tasks, state.projects]);

  // Chart Data: Status Breakdown
  const statusData = useMemo(() => {
    const counts = {
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.TODO]: 0,
      [TaskStatus.BLOCKED]: 0,
    };
    state.tasks.forEach(t => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return [
      { name: 'Completed', value: counts[TaskStatus.COMPLETED], color: '#10b981' },
      { name: 'In Progress', value: counts[TaskStatus.IN_PROGRESS], color: '#3b82f6' },
      { name: 'To Do', value: counts[TaskStatus.TODO], color: '#cbd5e1' },
      { name: 'Blocked', value: counts[TaskStatus.BLOCKED], color: '#ef4444' },
    ];
  }, [state.tasks]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setFilters(prev => ({ ...prev, date: new Date(e.target.value) }));
  };

  const getTasksForResource = (resourceId: string) => {
    return filteredTasks.filter(t => t.assignedResourceId === resourceId);
  };

  // Notification Logic
  useEffect(() => {
    if (state.isLoading || state.tasks.length === 0) return;

    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);
    
    const deadlineNotifications: Notification[] = state.tasks
      .filter(t => t.status !== TaskStatus.COMPLETED)
      .filter(t => {
        const dueDate = parseISO(t.date);
        return isWithinInterval(dueDate, { start: today, end: threeDaysFromNow });
      })
      .map(t => ({
        id: `deadline-${t.id}`,
        title: 'Upcoming Deadline',
        message: `Task "${t.title}" is due on ${format(parseISO(t.date), 'MMM do')}.`,
        type: 'deadline',
        timestamp: new Date(),
        read: false,
        taskId: t.id
      }));

    if (deadlineNotifications.length > 0) {
      setState(prev => {
        // Only add if not already present
        const existingIds = new Set(prev.notifications.map(n => n.id));
        const newNotifications = deadlineNotifications.filter(n => !existingIds.has(n.id));
        if (newNotifications.length === 0) return prev;
        return {
          ...prev,
          notifications: [...newNotifications, ...prev.notifications]
        };
      });
    }
  }, [state.isLoading, state.tasks.length]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications]
    }));
  };

  const handleMarkAsRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  };

  const handleMarkAllAsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  const handleClearAll = () => {
    setState(prev => ({
      ...prev,
      notifications: []
    }));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const originalTask = state.tasks.find(t => t.id === updatedTask.id);
    const history: TaskHistoryItem[] = [...(originalTask?.history || [])];
    
    if (originalTask) {
      // Check for status change
      if (originalTask.status !== updatedTask.status) {
        addNotification({
          title: 'Status Updated',
          message: `Task "${updatedTask.title}" changed from ${originalTask.status} to ${updatedTask.status}.`,
          type: 'status',
          taskId: updatedTask.id
        });
        history.push({
          id: `hist-${Date.now()}-status`,
          field: 'status',
          oldValue: originalTask.status,
          newValue: updatedTask.status,
          timestamp: new Date(),
          changedBy: 'Alex Manager'
        });
      }
      
      // Check for assignment change
      if (originalTask.assignedResourceId !== updatedTask.assignedResourceId) {
        const resource = state.resources.find(r => r.id === updatedTask.assignedResourceId);
        const oldResource = state.resources.find(r => r.id === originalTask.assignedResourceId);
        addNotification({
          title: 'Task Reassigned',
          message: `Task "${updatedTask.title}" has been reassigned to ${resource?.name || 'someone else'}.`,
          type: 'assignment',
          taskId: updatedTask.id
        });
        history.push({
          id: `hist-${Date.now()}-assignee`,
          field: 'assignee',
          oldValue: oldResource?.name || 'Unassigned',
          newValue: resource?.name || 'Unassigned',
          timestamp: new Date(),
          changedBy: 'Alex Manager'
        });
      }

      // Check for priority change
      if (originalTask.priority !== updatedTask.priority) {
        history.push({
          id: `hist-${Date.now()}-priority`,
          field: 'priority',
          oldValue: originalTask.priority,
          newValue: updatedTask.priority,
          timestamp: new Date(),
          changedBy: 'Alex Manager'
        });
      }
    }

    const taskWithHistory = { ...updatedTask, history };

    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? taskWithHistory : t)
    }));
  };

  const handleAddLeave = (newLeave: Leave) => {
      setState(prev => ({
          ...prev,
          leaves: [...prev.leaves, newLeave]
      }));
  };

  const handleUpdateResource = (updatedResource: Resource) => {
    setState(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === updatedResource.id ? updatedResource : r)
    }));
  };

  const handleUpdatePriorities = (configs: PriorityConfig[]) => {
    setState(prev => ({
      ...prev,
      priorityConfigs: configs
    }));
  };

  const isResourceOnLeave = (resourceId: string, date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return state.leaves.some(l => l.resourceId === resourceId && l.date === dateStr);
  };

  if (state.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading Project Data...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      onAIRequest={() => setAIModalOpen(true)}
      currentView={currentView}
      onNavigate={setCurrentView}
      notifications={state.notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onClearAll={handleClearAll}
      searchValue={filters.search}
      onSearchChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
    >
      {currentView === 'team' ? (
        <TeamView 
          resources={state.resources} 
          onNavigate={setCurrentView} 
          onUpdateResource={handleUpdateResource}
          globalSearch={filters.search} 
        />
      ) : currentView === 'skills-matrix' ? (
        <SkillsMatrixView resources={state.resources} globalSearch={filters.search} />
      ) : currentView === 'capacity' ? (
        <CapacityPlanningView 
          resources={state.resources} 
          tasks={state.tasks} 
          projects={state.projects}
          onUpdateResource={handleUpdateResource} 
          priorityConfigs={state.priorityConfigs}
          globalSearch={filters.search}
        />
      ) : currentView === 'projects' ? (
        <ProjectsView tasks={state.tasks} resources={state.resources} globalSearch={filters.search} />
      ) : currentView === 'tasks' ? (
        <TasksView 
          tasks={state.tasks} 
          resources={state.resources} 
          priorityConfigs={state.priorityConfigs} 
          globalSearch={filters.search}
          onUpdateTask={handleUpdateTask}
        />
      ) : currentView === 'reports' ? (
        <ReportsView tasks={state.tasks} resources={state.resources} />
      ) : currentView === 'leaves' ? (
        <LeavesView leaves={state.leaves} resources={state.resources} onAddLeave={handleAddLeave} />
      ) : currentView === 'settings' ? (
        <SettingsView priorityConfigs={state.priorityConfigs} onUpdatePriorities={handleUpdatePriorities} />
      ) : currentView === 'dashboard' ? (
        <div className="max-w-7xl mx-auto pb-10 space-y-8">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Project Dashboard</h1>
              <p className="text-slate-500 mt-1">
                Welcome back, Manager. You have <span className="font-semibold text-slate-800">{state.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length} active tasks</span> across {stats.totalProjects} projects.
              </p>
            </div>
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAIModalOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <RefreshCw size={16} /> Update Status
                </button>
             </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Active Projects" value={stats.totalProjects} icon={<Layers className="text-indigo-600" size={24} />} trend="+2 this month" />
            <KPICard title="Total Tasks" value={stats.totalTasks} icon={<CheckSquare className="text-blue-600" size={24} />} trend={`${stats.completedTasks} completed`} />
            <KPICard title="Team Size" value={state.resources.length} icon={<Users className="text-emerald-600" size={24} />} trend="Full capacity" />
            <KPICard title="Pending Hours" value={`${state.tasks.reduce((acc, t) => acc + (t.status !== 'Completed' ? t.duration : 0), 0)}h`} icon={<CalendarIcon className="text-amber-600" size={24} />} trend="Estimated work" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Column: Projects */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <LayoutList size={20} className="text-slate-400" /> Active Projects
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setProjectsViewMode('tile')}
                        className={`p-1.5 rounded-md transition-all ${projectsViewMode === 'tile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Grid View"
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button 
                        onClick={() => setProjectsViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${projectsViewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="List View"
                      >
                        <List size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => setCurrentView('projects')}
                      className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                    >
                      View All <ArrowRight size={14} />
                    </button>
                  </div>
               </div>

               {projectsViewMode === 'tile' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectMetrics.slice(0, 4).map(proj => (
                      <div 
                          key={proj.name} 
                          onClick={() => setCurrentView('projects')}
                          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                      >
                         <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                              {proj.name.charAt(0)}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              proj.progress === 100 ? 'bg-emerald-100 text-emerald-700' : 
                              proj.progress > 50 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {proj.status}
                            </span>
                         </div>
                         <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{proj.name}</h3>
                         <p className="text-xs text-slate-500 mb-4">{proj.total} tasks • {proj.hours} hours estimated</p>
                         
                         <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${proj.progress}%` }}></div>
                         </div>
                         <div className="flex justify-between text-xs text-slate-400 font-medium">
                            <span>{proj.progress}% Complete</span>
                            <span>{proj.completed}/{proj.total} Done</span>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                         <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Project</th>
                         <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                         <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Progress</th>
                         <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tasks</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {projectMetrics.slice(0, 6).map(proj => (
                         <tr 
                           key={proj.name} 
                           onClick={() => setCurrentView('projects')}
                           className="hover:bg-slate-50 cursor-pointer transition-colors"
                         >
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                 {proj.name.charAt(0)}
                               </div>
                               <span className="font-bold text-slate-900">{proj.name}</span>
                             </div>
                           </td>
                           <td className="px-6 py-4">
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                               proj.progress === 100 ? 'bg-emerald-100 text-emerald-700' : 
                               proj.progress > 50 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                             }`}>
                               {proj.status}
                             </span>
                           </td>
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                               <div className="w-24 bg-slate-100 rounded-full h-1.5">
                                 <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                               </div>
                               <span className="text-xs font-medium text-slate-600">{proj.progress}%</span>
                             </div>
                           </td>
                           <td className="px-6 py-4 text-xs text-slate-500">
                             {proj.completed}/{proj.total} Done
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>

            {/* Side Column: Charts & Quick Stats */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-6">Task Distribution</h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div 
                  onClick={() => setCurrentView('reports')}
                  className="bg-indigo-900 rounded-xl shadow-sm p-6 text-white relative overflow-hidden cursor-pointer hover:bg-indigo-800 transition-colors group"
                >
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2">Project Reports</h3>
                        <p className="text-indigo-200 text-sm mb-4">Generate weekly or monthly summaries of project velocity and resource utilization.</p>
                        <button className="text-xs bg-white text-indigo-900 font-bold px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-indigo-50">
                            Generate PDF <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-700 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="absolute top-4 right-4 text-indigo-500 opacity-20">
                        <Layers size={64} />
                    </div>
                </div>
            </div>
          </div>

          {/* Resource Daily View Section */}
          <div className="pt-8 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
               <div>
                  <h2 className="text-xl font-bold text-slate-900">Daily Resource Allocation</h2>
                  <p className="text-slate-500 text-sm">Monitor team availability for {format(filters.date, 'MMM do, yyyy')}</p>
               </div>
               
               {/* Filters Bar */}
               <div className="flex flex-wrap items-center gap-3 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                   <div className="flex items-center bg-slate-100 p-1 rounded-lg mr-2">
                      <button 
                        onClick={() => setResourceViewMode('tile')}
                        className={`p-1.5 rounded-md transition-all ${resourceViewMode === 'tile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Grid View"
                      >
                        <LayoutGrid size={14} />
                      </button>
                      <button 
                        onClick={() => setResourceViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${resourceViewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="List View"
                      >
                        <List size={14} />
                      </button>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded border border-slate-200">
                       <CalendarIcon size={14} className="text-slate-500" />
                       <input 
                       type="date" 
                       value={format(filters.date, 'yyyy-MM-dd')}
                       onChange={handleDateChange}
                       className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none"
                       />
                   </div>
                   <div className="h-4 w-px bg-slate-200"></div>
                   <select 
                       value={filters.project}
                       onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                       className="text-xs font-medium text-slate-600 bg-transparent border-none focus:outline-none cursor-pointer hover:text-indigo-600"
                   >
                       {state.projects.map(p => <option key={p} value={p}>{p === 'All' ? 'All Projects' : p}</option>)}
                   </select>
                   <select 
                       value={filters.department}
                       onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                       className="text-xs font-medium text-slate-600 bg-transparent border-none focus:outline-none cursor-pointer hover:text-indigo-600"
                   >
                       {uniqueDepartments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
                   </select>
                   <select 
                       value={filters.skill}
                       onChange={(e) => setFilters(prev => ({ ...prev, skill: e.target.value }))}
                       className="text-xs font-medium text-slate-600 bg-transparent border-none focus:outline-none cursor-pointer hover:text-indigo-600"
                   >
                       {uniqueSkills.map(s => <option key={s} value={s}>{s === 'All' ? 'All Skills' : s}</option>)}
                   </select>
               </div>
            </div>

            {filteredTasks.length === 0 && filters.project === 'All' && !filteredResources.some(r => isResourceOnLeave(r.id, filters.date)) ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-500">No tasks scheduled for {format(filters.date, 'MMM do')}.</p>
                </div>
              ) : resourceViewMode === 'tile' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResources.map(resource => {
                    const tasksForResource = getTasksForResource(resource.id);
                    const onLeave = isResourceOnLeave(resource.id, filters.date);

                    if (filters.project !== 'All' && tasksForResource.length === 0 && !onLeave) return null;
                    return (
                      <ResourceCard 
                        key={resource.id} 
                        resource={resource} 
                        tasks={tasksForResource} 
                        onClick={() => setSelectedResource(resource)}
                        isOnLeave={onLeave}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Resource</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tasks</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Load</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredResources.map(resource => {
                        const tasksForResource = getTasksForResource(resource.id);
                        const onLeave = isResourceOnLeave(resource.id, filters.date);
                        if (filters.project !== 'All' && tasksForResource.length === 0 && !onLeave) return null;
                        
                        const totalHours = tasksForResource.reduce((acc, t) => acc + t.duration, 0);
                        const loadPercentage = Math.min(Math.round((totalHours / resource.capacity) * 100), 100);
                        
                        return (
                          <tr 
                            key={resource.id} 
                            onClick={() => setSelectedResource(resource)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={resource.avatarUrl} 
                                  alt={resource.name} 
                                  className="w-8 h-8 rounded-full border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{resource.name}</div>
                                  <div className="text-[10px] text-slate-500">{resource.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {onLeave ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">On Leave</span>
                              ) : tasksForResource.length > 0 ? (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">Assigned</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">Available</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {tasksForResource.length > 0 ? (
                                  tasksForResource.map(t => (
                                    <span key={t.id} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] border border-slate-200">
                                      {t.projectName}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-[10px] italic">No tasks</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${loadPercentage > 100 ? 'bg-rose-500' : loadPercentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${loadPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600">{totalHours}h</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <Construction size={48} className="mb-4 opacity-50" />
          <h2 className="text-xl font-medium text-slate-600">Module Under Construction</h2>
          <p className="text-sm">The {currentView} module is coming in the next sprint.</p>
        </div>
      )}

      <AIAssistantModal 
        isOpen={isAIModalOpen} 
        onClose={() => setAIModalOpen(false)}
        tasks={filteredTasks}
        resources={state.resources}
      />

      <ResourceDetailsModal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
        tasks={selectedResource ? getTasksForResource(selectedResource.id) : []}
        date={filters.date}
        onUpdateTask={handleUpdateTask}
        priorityConfigs={state.priorityConfigs}
      />
    </Layout>
  );
};

// Helper Component for Stats
const KPICard = ({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
         <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
         <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
         <p className="text-slate-400 text-xs mt-1">{trend}</p>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg">
         {icon}
      </div>
    </div>
  );
}

export default App;