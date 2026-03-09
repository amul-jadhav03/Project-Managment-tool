import React, { ReactNode, useState } from 'react';
import { LayoutDashboard, FolderKanban, Users, Settings, Bell, Search, Sparkles, CheckSquare, PieChart, Coffee, Clock, Tag } from 'lucide-react';
import { Notification, UserProfile, UserRole } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { LogOut, ShieldCheck, User as UserIcon, Briefcase, Settings as SettingsIcon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onAIRequest: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onAIRequest, 
  currentView, 
  onNavigate,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  searchValue,
  onSearchChange,
  user,
  onLogout
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const canSeeDashboard = true;
  const canSeeTeam = true;
  const canSeeProjects = true;
  const canSeeTasks = true;
  const canSeeSettings = user?.role !== UserRole.RESOURCE;

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Super Admin</span>;
      case UserRole.ADMIN: return <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Admin</span>;
      case UserRole.MANAGER: return <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Manager</span>;
      case UserRole.RESOURCE: return <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Resource</span>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Fixed with Hover Expansion */}
      <aside className="fixed inset-y-0 left-0 z-50 w-20 hover:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 hidden md:flex flex-col transition-all duration-300 ease-in-out group shadow-2xl">
        <div className="h-16 flex items-center px-6 shrink-0 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-lg font-bold shrink-0">I</div>
          <h1 className="ml-3 text-xl font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ifocus PM
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-x-hidden overflow-y-auto custom-scrollbar">
          {/* Section Header: Overview */}
          <div className="px-2 pt-2">
             <div className="h-px w-6 bg-slate-700 mx-auto group-hover:hidden transition-all"></div>
             <p className="hidden group-hover:block text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap animate-in fade-in duration-300">Overview</p>
          </div>
          
          {canSeeDashboard && (
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={currentView === 'dashboard'} 
              onClick={() => onNavigate('dashboard')}
            />
          )}
          <NavItem 
            icon={<PieChart size={20} />} 
            label="Reports" 
            active={currentView === 'reports'}
            onClick={() => onNavigate('reports')}
          />

          {/* Section Header: Management */}
          <div className="px-2 pt-4">
             <div className="h-px w-6 bg-slate-700 mx-auto group-hover:hidden transition-all"></div>
             <p className="hidden group-hover:block text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap animate-in fade-in duration-300">Management</p>
          </div>
          
          {canSeeProjects && (
            <NavItem 
              icon={<FolderKanban size={20} />} 
              label="Projects" 
              active={currentView === 'projects'}
              onClick={() => onNavigate('projects')}
            />
          )}
          {canSeeTasks && (
            <NavItem 
              icon={<CheckSquare size={20} />} 
              label="All Tasks" 
              active={currentView === 'tasks'}
              onClick={() => onNavigate('tasks')}
            />
          )}
          {canSeeTeam && (
            <NavItem 
              icon={<Users size={20} />} 
              label="Team" 
              active={currentView === 'team'} 
              onClick={() => onNavigate('team')}
            />
          )}
          <NavItem 
            icon={<Tag size={20} />} 
            label="Skills Matrix" 
            active={currentView === 'skills-matrix'} 
            onClick={() => onNavigate('skills-matrix')}
          />
          <NavItem 
            icon={<Clock size={20} />} 
            label="Capacity" 
            active={currentView === 'capacity'}
            onClick={() => onNavigate('capacity')}
          />
           <NavItem 
            icon={<Coffee size={20} />} 
            label="Leave Status" 
            active={currentView === 'leaves'}
            onClick={() => onNavigate('leaves')}
          />
          
          <div className="mt-auto pt-6 pb-4">
             {canSeeSettings && (
               <NavItem 
                  icon={<SettingsIcon size={20} />} 
                  label="Settings" 
                  active={currentView === 'settings'}
                  onClick={() => onNavigate('settings')}
              />
             )}
          </div>
        </nav>

        {/* AI Insight Button */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 p-2 rounded-xl border border-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer group/ai" onClick={onAIRequest}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 flex items-center justify-center text-indigo-400 shrink-0">
                   <Sparkles size={20} />
                </div>
                <div className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-medium text-white">AI Assistant</p>
                    <p className="text-[10px] text-slate-400">Ask for insights</p>
                </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Pushed by collapsed sidebar width */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 md:ml-20 transition-all duration-300">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-semibold text-slate-800 capitalize hidden sm:block">
                {currentView.replace('-', ' ')}
            </h2>
            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-2"></div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects, tasks, or people..." 
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all focus:bg-white focus:shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-lg transition-colors ${
                  isNotificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <NotificationCenter 
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onClearAll={onClearAll}
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>
            <div className="flex items-center gap-2">
                <div className="text-right hidden md:block">
                    <div className="text-sm font-medium text-slate-900 leading-none">{user?.displayName || user?.email}</div>
                    <div className="mt-1">{getRoleBadge(user?.role)}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden">
                   <img 
                     src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=6366f1&color=fff`} 
                     alt="User" 
                   />
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 whitespace-nowrap group/item overflow-hidden ${
        active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="shrink-0 flex items-center justify-center w-5 h-5">{icon}</div>
    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-10px] group-hover:translate-x-0">
        {label}
    </span>
  </button>
);