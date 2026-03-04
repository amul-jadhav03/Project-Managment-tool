import React, { useState, useMemo } from 'react';
import { Resource } from '../types';
import { Mail, Briefcase, Users, ArrowUpDown, Tag } from 'lucide-react';

interface TeamViewProps {
  resources: Resource[];
  onNavigate?: (view: string) => void;
  onUpdateResource?: (resource: Resource) => void;
  globalSearch?: string;
}

type SortOption = 'name' | 'role' | 'department';

export const TeamView: React.FC<TeamViewProps> = ({ resources, onNavigate, onUpdateResource, globalSearch = '' }) => {
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const handleToggleBilling = (resource: Resource) => {
    if (onUpdateResource) {
      onUpdateResource({
        ...resource,
        isBillable: !resource.isBillable
      });
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      if (!globalSearch) return true;
      const search = globalSearch.toLowerCase();
      return r.name.toLowerCase().includes(search) || 
             r.role.toLowerCase().includes(search) || 
             r.department.toLowerCase().includes(search) ||
             r.skills?.some(s => s.toLowerCase().includes(search));
    });
  }, [resources, globalSearch]);

  const sortedResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      const valA = (a[sortBy] || '').toString().toLowerCase();
      const valB = (b[sortBy] || '').toString().toLowerCase();
      return valA.localeCompare(valB);
    });
  }, [resources, sortBy]);

  return (
    <div className="max-w-7xl mx-auto">
       <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
          <p className="text-slate-500">Overview of all active resources and their roles.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {onNavigate && (
              <button 
                onClick={() => onNavigate('skills-matrix')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors mr-2"
              >
                <Tag size={16} /> Skills Matrix
              </button>
            )}
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown size={14} /> Sort by:
            </span>
            <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center shadow-sm">
                {(['name', 'role', 'department'] as SortOption[]).map((option) => (
                <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                    sortBy === option 
                        ? 'bg-slate-100 text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {option}
                </button>
                ))}
            </div>
        </div>
      </div>
      
      {sortedResources.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center border border-slate-200">
           <p className="text-slate-500">No team members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResources.map(resource => (
            <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
              <img 
                src={resource.avatarUrl || `https://ui-avatars.com/api/?name=${resource.name}`} 
                alt={resource.name}
                className="w-16 h-16 rounded-full bg-slate-100 object-cover border-2 border-slate-50" 
              />
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-lg text-slate-900 truncate">{resource.name}</h3>
                <p className="text-blue-600 text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Briefcase size={14} />
                  {resource.role}
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={12} className="shrink-0" /> 
                    <span className="truncate">{resource.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={12} className="shrink-0" /> 
                    <span className="truncate">{resource.email || `${resource.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@nova.task`}</span>
                  </div>
                </div>

                {resource.skills && resource.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {resource.skills.map(skill => (
                      <span key={skill} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded border border-indigo-100 uppercase tracking-tight">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Daily Capacity</span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{resource.capacity} hours</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Billing Status</span>
                    <button 
                      onClick={() => handleToggleBilling(resource)}
                      className={`px-2 py-1 rounded-full font-bold transition-all ${
                        resource.isBillable 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {resource.isBillable ? 'Billable' : 'Non-Billable'}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};