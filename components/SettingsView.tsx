import React, { useState } from 'react';
import { PriorityConfig, UserProfile, UserRole } from '../types';
import { Save, Plus, Trash2, RotateCcw, Users, CreditCard, Briefcase, Settings as SettingsIcon } from 'lucide-react';
import { getDefaultPriorityConfigs } from '../services/sheetService';
import { UserManagementView } from './UserManagementView';

interface SettingsViewProps {
  priorityConfigs: PriorityConfig[];
  onUpdatePriorities: (configs: PriorityConfig[]) => void;
  emailRemindersEnabled: boolean;
  onToggleEmailReminders: (enabled: boolean) => void;
  user: UserProfile | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  priorityConfigs, 
  onUpdatePriorities,
  emailRemindersEnabled,
  onToggleEmailReminders,
  user
}) => {
  const [localConfigs, setLocalConfigs] = useState<PriorityConfig[]>([...priorityConfigs]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'billing' | 'projects'>('general');

  const canManageUsers = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;
  const canManageBilling = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;
  const canManageProjects = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  const handleUpdateConfig = (index: number, field: keyof PriorityConfig, value: string) => {
    const newConfigs = [...localConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setLocalConfigs(newConfigs);
    setHasChanges(true);
  };

  const handleAddPriority = () => {
    const maxOrder = localConfigs.length > 0 ? Math.max(...localConfigs.map(c => c.order)) : -1;
    setLocalConfigs([...localConfigs, { 
      label: 'New Priority', 
      color: '#94a3b8', 
      textColor: '#ffffff',
      order: maxOrder + 1
    }]);
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Configure application preferences and administrative tasks.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <SettingsIcon size={16} /> General
        </button>
        {canManageUsers && (
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users size={16} /> Users
          </button>
        )}
        {canManageProjects && (
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'projects' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Briefcase size={16} /> Projects
          </button>
        )}
        {canManageBilling && (
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'billing' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CreditCard size={16} /> Billing
          </button>
        )}
      </div>

      {activeTab === 'users' && user ? (
        <UserManagementView currentUser={user} />
      ) : activeTab === 'projects' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Project Administration</h2>
          <p className="text-slate-500 mt-2">
            {user?.role === UserRole.SUPER_ADMIN 
              ? 'As Super Admin, you can manage all projects and budgets.' 
              : 'As Admin/Manager, you can manage assigned projects and budgets.'}
          </p>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 inline-block">
            <p className="text-xs text-slate-400 font-mono italic">Project Budgeting Module Loading...</p>
          </div>
        </div>
      ) : activeTab === 'billing' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Billing & Subscription</h2>
          <p className="text-slate-500 mt-2">Manage your subscription, payment methods, and invoices.</p>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 inline-block">
            <p className="text-xs text-slate-400 font-mono italic">Billing Gateway Integration Pending...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Notification Settings</h2>
          <p className="text-sm text-slate-500">Configure how and when you receive task reminders.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-700">Email Reminders</h3>
              <p className="text-xs text-slate-500">Send automated email notifications for upcoming task deadlines.</p>
            </div>
            <button 
              onClick={() => onToggleEmailReminders(!emailRemindersEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                emailRemindersEnabled ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailRemindersEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
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
      )}
    </div>
  );
};
