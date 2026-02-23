import React, { useState } from 'react';
import { PriorityConfig } from '../types';
import { Save, Plus, Trash2, RotateCcw } from 'lucide-react';
import { getDefaultPriorityConfigs } from '../services/sheetService';

interface SettingsViewProps {
  priorityConfigs: PriorityConfig[];
  onUpdatePriorities: (configs: PriorityConfig[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ priorityConfigs, onUpdatePriorities }) => {
  const [localConfigs, setLocalConfigs] = useState<PriorityConfig[]>([...priorityConfigs]);
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdateConfig = (index: number, field: keyof PriorityConfig, value: string) => {
    const newConfigs = [...localConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setLocalConfigs(newConfigs);
    setHasChanges(true);
  };

  const handleAddPriority = () => {
    setLocalConfigs([...localConfigs, { label: 'New Priority', color: '#94a3b8', textColor: '#ffffff' }]);
    setHasChanges(true);
  };

  const handleRemovePriority = (index: number) => {
    const newConfigs = localConfigs.filter((_, i) => i !== index);
    setLocalConfigs(newConfigs);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdatePriorities(localConfigs);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfigs(getDefaultPriorityConfigs());
    setHasChanges(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure application-wide preferences and task metadata.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Task Priorities</h2>
            <p className="text-sm text-slate-500">Define priority levels and their visual representation across the app.</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              >
                <RotateCcw size={16} /> Reset to Default
              </button>
            )}
            <button 
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                hasChanges 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            <div className="col-span-5">Label</div>
            <div className="col-span-3">Background Color</div>
            <div className="col-span-3">Text Color</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          <div className="space-y-3">
            {localConfigs.map((config, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="col-span-5">
                  <input 
                    type="text" 
                    value={config.label}
                    onChange={(e) => handleUpdateConfig(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <input 
                    type="color" 
                    value={config.color}
                    onChange={(e) => handleUpdateConfig(index, 'color', e.target.value)}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer overflow-hidden p-0"
                  />
                  <span className="text-xs font-mono text-slate-500 uppercase">{config.color}</span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <input 
                    type="color" 
                    value={config.textColor}
                    onChange={(e) => handleUpdateConfig(index, 'textColor', e.target.value)}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer overflow-hidden p-0"
                  />
                  <span className="text-xs font-mono text-slate-500 uppercase">{config.textColor}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button 
                    onClick={() => handleRemovePriority(index)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Priority"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAddPriority}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all text-sm font-medium"
          >
            <Plus size={18} /> Add Priority Level
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Preview</h3>
          <div className="flex flex-wrap gap-3">
            {localConfigs.map((config, index) => (
              <div 
                key={index}
                className="px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-black/5"
                style={{ backgroundColor: config.color, color: config.textColor }}
              >
                {config.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Save className="text-amber-600" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-amber-900">Note on Persistence</h3>
          <p className="text-sm text-amber-800 mt-1">
            These settings are currently stored in the application state. In a production environment, these would be saved to your Google Sheet or a database to persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
};
