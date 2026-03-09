import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { UserPlus, Trash2, Shield, User, Settings, ShieldAlert, Briefcase, UserCheck, Search } from 'lucide-react';

interface UserManagementViewProps {
  currentUser: UserProfile;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Load users from localStorage or use a default set
    const loadUsers = () => {
      const savedUsers = localStorage.getItem('ifocus_all_users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        // Initial default users for demo
        const initialUsers: UserProfile[] = [
          { uid: '1', email: 'superadmin@ifocus.com', displayName: 'Super Admin', role: UserRole.SUPER_ADMIN, createdAt: new Date().toISOString() },
          { uid: '2', email: 'admin@ifocus.com', displayName: 'Admin User', role: UserRole.ADMIN, createdAt: new Date().toISOString() },
          { uid: '3', email: 'manager@ifocus.com', displayName: 'Project Manager', role: UserRole.MANAGER, createdAt: new Date().toISOString() },
          { uid: '4', email: 'resource@ifocus.com', displayName: 'Team Resource', role: UserRole.RESOURCE, createdAt: new Date().toISOString() },
        ];
        setUsers(initialUsers);
        localStorage.setItem('ifocus_all_users', JSON.stringify(initialUsers));
      }
      setLoading(false);
    };

    loadUsers();
  }, []);

  const saveUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('ifocus_all_users', JSON.stringify(updatedUsers));
  };

  const handleUpdateRole = (uid: string, newRole: UserRole) => {
    const updatedUsers = users.map(u => u.uid === uid ? { ...u, role: newRole } : u);
    saveUsers(updatedUsers);
  };

  const handleDeleteUser = (uid: string) => {
    if (uid === currentUser.uid) {
      alert("You cannot delete yourself.");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.uid !== uid);
      saveUsers(updatedUsers);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return <ShieldAlert className="text-red-600" size={18} />;
      case UserRole.ADMIN: return <Shield className="text-indigo-600" size={18} />;
      case UserRole.MANAGER: return <Briefcase className="text-amber-600" size={18} />;
      case UserRole.RESOURCE: return <UserCheck className="text-emerald-600" size={18} />;
      default: return <User className="text-slate-400" size={18} />;
    }
  };

  const canManageRole = (targetRole: UserRole) => {
    if (currentUser.role === UserRole.SUPER_ADMIN) return true;
    if (currentUser.role === UserRole.ADMIN) {
      return targetRole === UserRole.MANAGER || targetRole === UserRole.RESOURCE;
    }
    if (currentUser.role === UserRole.MANAGER) {
      return targetRole === UserRole.RESOURCE;
    }
    return false;
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">Manage roles and permissions for the team.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4 border-b border-slate-100">User</th>
              <th className="px-6 py-4 border-b border-slate-100">Role</th>
              <th className="px-6 py-4 border-b border-slate-100">Joined</th>
              <th className="px-6 py-4 border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                      {user.displayName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{user.displayName || 'No Name'}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {canManageRole(user.role) && user.uid !== currentUser.uid && (
                      <>
                        <select 
                          className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.uid, e.target.value as UserRole)}
                        >
                          <option value={UserRole.RESOURCE}>Resource</option>
                          <option value={UserRole.MANAGER}>Manager</option>
                          <option value={UserRole.ADMIN}>Admin</option>
                          {currentUser.role === UserRole.SUPER_ADMIN && (
                            <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                          )}
                        </select>
                        <button 
                          onClick={() => handleDeleteUser(user.uid)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    {user.uid === currentUser.uid && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-widest">You</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
