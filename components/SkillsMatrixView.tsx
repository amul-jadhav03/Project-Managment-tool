import React, { useMemo, useState } from 'react';
import { Resource } from '../types';
import { Search, Filter, Users, Tag, ChevronRight, Info } from 'lucide-react';

interface SkillsMatrixViewProps {
  resources: Resource[];
  globalSearch?: string;
}

export const SkillsMatrixView: React.FC<SkillsMatrixViewProps> = ({ resources, globalSearch = '' }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = localSearchTerm || globalSearch;
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Extract all unique skills across all resources
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    resources.forEach(r => r.skills?.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  }, [resources]);

  // Skill frequency for the "tag cloud" or summary
  const skillStats = useMemo(() => {
    const stats: Record<string, number> = {};
    resources.forEach(r => {
      r.skills?.forEach(s => {
        stats[s] = (stats[s] || 0) + 1;
      });
    });
    return stats;
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkill = !selectedSkill || r.skills?.includes(selectedSkill);
      return matchesSearch && matchesSkill;
    });
  }, [resources, searchTerm, selectedSkill]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skills Matrix</h1>
          <p className="text-slate-500">Map expertise across the team and identify skill gaps.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Users size={16} className="text-indigo-600" />
          <span className="text-indigo-600 font-bold">{resources.length}</span> Team Members
          <span className="mx-2 text-slate-300">|</span>
          <Tag size={16} className="text-emerald-600" />
          <span className="text-emerald-600 font-bold">{allSkills.length}</span> Unique Skills
        </div>
      </div>

      {/* Skill Cloud / Heatmap Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Tag size={14} /> Skill Distribution
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSkill(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selectedSkill === null 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            All Skills
          </button>
          {allSkills.map(skill => {
            const count = skillStats[skill];
            const isSelected = selectedSkill === skill;
            // Scale font size or opacity based on frequency?
            const opacity = Math.max(0.4, Math.min(1, count / 5)); 
            
            return (
              <button
                key={skill}
                onClick={() => setSelectedSkill(isSelected ? null : skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
                style={{ opacity: isSelected ? 1 : opacity }}
              >
                {skill}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search team members by name or role..." 
            value={searchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Skills Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-5 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={resource.avatarUrl || `https://ui-avatars.com/api/?name=${resource.name}&background=random`} 
                    alt={resource.name}
                    className="w-12 h-12 rounded-full border-2 border-slate-100 object-cover" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{resource.name}</h4>
                  <p className="text-xs text-slate-500 font-medium truncate">{resource.role}</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-slate-50/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expertise</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {resource.skills?.length || 0} Skills
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {resource.skills && resource.skills.length > 0 ? (
                  resource.skills.map(skill => (
                    <span 
                      key={skill} 
                      className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                        selectedSkill === skill 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills listed</span>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                <Info size={12} />
                <span>{resource.department}</span>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {filteredResources.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900">No team members found</h3>
            <p className="text-slate-500">Try adjusting your search or skill filters.</p>
            <button 
              onClick={() => { setLocalSearchTerm(''); setSelectedSkill(null); }}
              className="mt-4 text-indigo-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
