import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      // Mock validation logic
      if (!email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }

      // Hardcoded demo users
      const demoUsers: Record<string, { role: UserRole, name: string }> = {
        'superadmin@ifocus.com': { role: UserRole.SUPER_ADMIN, name: 'Super Admin' },
        'admin@ifocus.com': { role: UserRole.ADMIN, name: 'Admin User' },
        'manager@ifocus.com': { role: UserRole.MANAGER, name: 'Project Manager' },
        'resource@ifocus.com': { role: UserRole.RESOURCE, name: 'Team Resource' },
      };

      // For any other email, default to Resource
      const userDetails = demoUsers[email.toLowerCase()] || { role: UserRole.RESOURCE, name: email.split('@')[0] };

      const user: UserProfile = {
        uid: Math.random().toString(36).substring(7),
        email: email,
        displayName: userDetails.name,
        role: userDetails.role,
        createdAt: new Date().toISOString(),
        assignedProjects: []
      };

      onLoginSuccess(user);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">iFocus Management</h1>
            <p className="text-slate-500 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-700"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => { setEmail('superadmin@ifocus.com'); setPassword('password'); }}
                className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <p className="font-bold text-slate-700">Super Admin</p>
                <p className="text-slate-500">superadmin@ifocus.com</p>
              </div>
              <div 
                onClick={() => { setEmail('admin@ifocus.com'); setPassword('password'); }}
                className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <p className="font-bold text-slate-700">Admin</p>
                <p className="text-slate-500">admin@ifocus.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
