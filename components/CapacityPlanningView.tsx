import React, { useMemo, useState } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  parseISO, 
  addWeeks, 
  subWeeks 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  Edit2, 
  Save, 
  X,
  Check,
  Filter,
  Search
} from 'lucide-react';
import { Resource, Task, TaskStatus, PriorityConfig } from '../types';

interface CapacityPlanningViewProps {
  resources: Resource[];
  tasks: Task[];
  projects: string[];
  onUpdateResource: (resource: Resource) => void;
  priorityConfigs: PriorityConfig[];
  globalSearch?: string;
}

export const CapacityPlanningView: React.FC<CapacityPlanningViewProps> = ({ 
  resources, 
  tasks, 
  projects,
  onUpdateResource,
  priorityConfigs,
  globalSearch = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ daily: number; weekly: number }>({ daily: 8, weekly: 40 });
  const [selectedResourceIds, setSelectedResourceIds] = useState<Set<string>>(new Set());
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEditValues, setBulkEditValues] = useState<{ daily: number; weekly: number }>({ daily: 8, weekly: 40 });

  const [filters, setFilters] = useState({
    project: 'All',
    status: 'All',
    priority: 'All',
    localSearch: '',
    skill: 'All'
  });

  const searchTerm = filters.localSearch || globalSearch;

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    resources.forEach(r => r.skills?.forEach(s => skills.add(s)));
    tasks.forEach(t => t.requiredSkills?.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  }, [resources, tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const projectMatch = filters.project === 'All' || task.projectName === filters.project;
      const statusMatch = filters.status === 'All' || task.status === filters.status;
      const priorityMatch = filters.priority === 'All' || task.priority === filters.priority;
      const skillMatch = filters.skill === 'All' || task.requiredSkills?.includes(filters.skill);
      return projectMatch && statusMatch && priorityMatch && skillMatch;
    });
  }, [tasks, filters.project, filters.status, filters.priority, filters.skill]);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const searchMatch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.role.toLowerCase().includes(searchTerm.toLowerCase());
      const skillMatch = filters.skill === 'All' || resource.skills?.includes(filters.skill);
      return searchMatch && skillMatch;
    });
  }, [resources, searchTerm, filters.skill]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const resourceAllocation = useMemo(() => {
    return filteredResources.map(resource => {
      const dailyAllocation = weekDays.map(day => {
        const dayTasks = filteredTasks.filter(t => 
          t.assignedResourceId === resource.id && 
          isSameDay(parseISO(t.date), day)
        );
        const totalHours = dayTasks.reduce((sum, t) => sum + t.duration, 0);
        return {
          date: day,
          hours: totalHours,
          capacity: resource.capacity,
          isOver: totalHours > resource.capacity
        };
      });

      const totalWeeklyHours = dailyAllocation.reduce((sum, d) => sum + d.hours, 0);
      const weeklyCapacity = resource.weeklyCapacity || (resource.capacity * 5);

      return {
        resource,
        dailyAllocation,
        totalWeeklyHours,
        weeklyCapacity,
        isWeeklyOver: totalWeeklyHours > weeklyCapacity
      };
    });
  }, [filteredResources, filteredTasks, weekDays]);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const startEditing = (resource: Resource) => {
    setEditingResourceId(resource.id);
    setEditValues({ 
      daily: resource.capacity, 
      weekly: resource.weeklyCapacity || (resource.capacity * 5) 
    });
  };

  const saveEditing = () => {
    if (editingResourceId) {
      const resource = resources.find(r => r.id === editingResourceId);
      if (resource) {
        onUpdateResource({
          ...resource,
          capacity: editValues.daily,
          weeklyCapacity: editValues.weekly
        });
      }
      setEditingResourceId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedResourceIds.size === filteredResources.length) {
      setSelectedResourceIds(new Set());
    } else {
      setSelectedResourceIds(new Set(filteredResources.map(r => r.id)));
    }
  };

  const toggleSelectResource = (id: string) => {
    const newSelected = new Set(selectedResourceIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResourceIds(newSelected);
  };

  const handleBulkUpdate = () => {
    resources.forEach(resource => {
      if (selectedResourceIds.has(resource.id)) {
        onUpdateResource({
          ...resource,
          capacity: bulkEditValues.daily,
          weeklyCapacity: bulkEditValues.weekly
        });
      }
    });
    setIsBulkEditing(false);
    setSelectedResourceIds(new Set());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Capacity Planning</h1>
          <p className="text-slate-500">Monitor and manage team workload across the week.</p>
        </div>

        <div className="flex items-center gap-4">
          {selectedResourceIds.size > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="text-sm font-bold text-indigo-700">{selectedResourceIds.size} selected</span>
              <button 
                onClick={() => {
                  setIsBulkEditing(true);
                  setBulkEditValues({ daily: 8, weekly: 40 });
                }}
                className="ml-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Bulk Edit
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={handlePrevWeek}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-sm font-semibold text-slate-700 min-w-[200px] text-center">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </div>
            <button 
              onClick={handleNextWeek}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 mr-2">
          <Filter size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, localSearch: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={filters.project}
            onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {projects.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Projects' : p}</option>
            ))}
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {Object.values(TaskStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select 
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="All">All Priorities</option>
            {priorityConfigs.map(p => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>

          <select 
            value={filters.skill}
            onChange={(e) => setFilters(prev => ({ ...prev, skill: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="All">All Skills</option>
            {allSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>

          {(filters.project !== 'All' || filters.status !== 'All' || filters.priority !== 'All' || filters.localSearch !== '' || filters.skill !== 'All') && (
            <button 
              onClick={() => setFilters({ project: 'All', status: 'All', priority: 'All', localSearch: '', skill: 'All' })}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isBulkEditing && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-indigo-900">Bulk Edit Capacity</h3>
            <button onClick={() => setIsBulkEditing(false)} className="text-indigo-400 hover:text-indigo-600">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-700 uppercase">Daily Capacity (h)</label>
              <input 
                type="number" 
                value={bulkEditValues.daily}
                onChange={(e) => setBulkEditValues(prev => ({ ...prev, daily: Number(e.target.value) }))}
                className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-700 uppercase">Weekly Capacity (h)</label>
              <input 
                type="number" 
                value={bulkEditValues.weekly}
                onChange={(e) => setBulkEditValues(prev => ({ ...prev, weekly: Number(e.target.value) }))}
                className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button 
              onClick={handleBulkUpdate}
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Check size={18} /> Apply to {selectedResourceIds.size} Members
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-12 sticky left-0 bg-slate-50 z-20">
                  <button 
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedResourceIds.size === filteredResources.length && filteredResources.length > 0
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                  >
                    <Check size={12} strokeWidth={4} />
                  </button>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-12 bg-slate-50 z-10 w-64">Team Member</th>
                {weekDays.map(day => (
                  <th key={day.toString()} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center min-w-[100px]">
                    <div className="text-slate-400 font-medium">{format(day, 'EEE')}</div>
                    <div className="text-slate-900">{format(day, 'MMM d')}</div>
                  </th>
                ))}
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center bg-slate-50/50 min-w-[120px]">Weekly Total</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resourceAllocation.map(({ resource, dailyAllocation, totalWeeklyHours, weeklyCapacity, isWeeklyOver }) => (
                <tr key={resource.id} className={`border-b border-slate-100 transition-colors ${selectedResourceIds.has(resource.id) ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="p-4 sticky left-0 bg-inherit z-20 border-r border-slate-100">
                    <button 
                      onClick={() => toggleSelectResource(resource.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedResourceIds.has(resource.id)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}
                    >
                      <Check size={12} strokeWidth={4} />
                    </button>
                  </td>
                  <td className="p-4 sticky left-12 bg-inherit z-10 border-r border-slate-100">
                    <div className="flex items-center gap-3">
                      <img 
                        src={resource.avatarUrl || `https://ui-avatars.com/api/?name=${resource.name}`} 
                        alt={resource.name}
                        className="w-10 h-10 rounded-full border border-slate-200"
                      />
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 truncate">{resource.name}</div>
                        <div className="text-xs text-slate-500 truncate">{resource.role}</div>
                      </div>
                    </div>
                  </td>
                  {dailyAllocation.map((day, idx) => (
                    <td key={idx} className="p-4 text-center">
                      <div className={`inline-flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 transition-all ${
                        day.hours === 0 ? 'border-slate-100 bg-slate-50 text-slate-400' :
                        day.hours > day.capacity ? 'border-red-200 bg-red-50 text-red-700' :
                        day.hours === day.capacity ? 'border-amber-200 bg-amber-50 text-amber-700' :
                        'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}>
                        <span className="text-sm font-bold">{day.hours}h</span>
                        <span className="text-[10px] opacity-70">/ {day.capacity}h</span>
                      </div>
                    </td>
                  ))}
                  <td className="p-4 text-center bg-slate-50/30">
                    {editingResourceId === resource.id ? (
                      <div className="space-y-2">
                        <div className="flex flex-col items-center gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Daily</label>
                          <input 
                            type="number" 
                            value={editValues.daily}
                            onChange={(e) => setEditValues(prev => ({ ...prev, daily: Number(e.target.value) }))}
                            className="w-16 text-center text-sm font-bold border border-slate-200 rounded p-1"
                          />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Weekly</label>
                          <input 
                            type="number" 
                            value={editValues.weekly}
                            onChange={(e) => setEditValues(prev => ({ ...prev, weekly: Number(e.target.value) }))}
                            className="w-16 text-center text-sm font-bold border border-slate-200 rounded p-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className={`text-lg font-bold ${isWeeklyOver ? 'text-red-600' : 'text-slate-900'}`}>
                          {totalWeeklyHours}h
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          of {weeklyCapacity}h
                        </div>
                        <div className="mt-2 w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isWeeklyOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (totalWeeklyHours / weeklyCapacity) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingResourceId === resource.id ? (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={saveEditing}
                          className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <Save size={16} />
                        </button>
                        <button 
                          onClick={() => setEditingResourceId(null)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startEditing(resource)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" /> Status Legend
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200"></div>
              <span className="text-sm text-slate-600">Under Capacity (Healthy)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200"></div>
              <span className="text-sm text-slate-600">At Capacity (Optimal)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-red-50 border border-red-200"></div>
              <span className="text-sm text-slate-600">Over Capacity (Risk)</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-indigo-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-400" /> Allocation Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-indigo-200 text-xs font-bold uppercase mb-1">Over-allocated Members</div>
                <div className="text-2xl font-bold">
                  {resourceAllocation.filter(r => r.isWeeklyOver).length}
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-indigo-200 text-xs font-bold uppercase mb-1">Total Team Utilization</div>
                <div className="text-2xl font-bold">
                  {Math.round((resourceAllocation.reduce((sum, r) => sum + r.totalWeeklyHours, 0) / 
                   resourceAllocation.reduce((sum, r) => sum + r.weeklyCapacity, 0)) * 100)}%
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-indigo-100">
              {resourceAllocation.filter(r => r.isWeeklyOver).length > 0 
                ? "Warning: Some team members are over-allocated this week. Consider redistributing tasks to avoid burnout."
                : "Great! The team workload is well-balanced for the current week."}
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};
