import React, { useState } from 'react';
import { Leave, Resource } from '../types';
import { format, parseISO } from 'date-fns';
import { Coffee, Plus, CheckCircle2, Clock, Calendar, User } from 'lucide-react';

interface LeavesViewProps {
  leaves: Leave[];
  resources: Resource[];
  onAddLeave: (leave: Leave) => void;
}

export const LeavesView: React.FC<LeavesViewProps> = ({ leaves, resources, onAddLeave }) => {
  const [showForm, setShowForm] = useState(false);
  const [newLeave, setNewLeave] = useState<Partial<Leave>>({
    resourceId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'Personal',
    reason: '',
    status: 'Approved'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.resourceId || !newLeave.date || !newLeave.reason) return;

    onAddLeave({
      id: `leave-${Date.now()}`,
      resourceId: newLeave.resourceId,
      date: newLeave.date,
      type: newLeave.type as any,
      reason: newLeave.reason,
      status: 'Approved' // Auto approve for demo
    } as Leave);

    setShowForm(false);
    setNewLeave({
        resourceId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'Personal',
        reason: '',
        status: 'Approved'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-slate-500">Track employee absence and plan resource availability.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Apply New Leave
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        {showForm && (
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-left duration-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Coffee size={20} className="text-indigo-600"/> New Leave Request
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Team Member</label>
                            <select 
                                value={newLeave.resourceId}
                                onChange={(e) => setNewLeave({...newLeave, resourceId: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            >
                                <option value="">Select Resource...</option>
                                {resources.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                            <input 
                                type="date"
                                value={newLeave.date}
                                onChange={(e) => setNewLeave({...newLeave, date: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
                            <select 
                                value={newLeave.type}
                                onChange={(e) => setNewLeave({...newLeave, type: e.target.value as any})}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Personal">Personal</option>
                                <option value="Sick">Sick Leave</option>
                                <option value="Vacation">Vacation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Reason</label>
                            <textarea 
                                value={newLeave.reason}
                                onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                rows={3}
                                required
                                placeholder="Brief description..."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                             <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* List Section */}
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Recent Leave Requests</h3>
                <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Total: {leaves.length}
                </span>
             </div>
             
             {leaves.length === 0 ? (
                 <div className="p-12 text-center text-slate-400">
                     <Coffee size={48} className="mx-auto mb-3 opacity-20"/>
                     <p>No leave records found.</p>
                 </div>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-semibold">
                            <tr>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Reason</th>
                                <th className="px-6 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaves.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(leave => {
                                const resource = resources.find(r => r.id === leave.resourceId);
                                return (
                                    <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {resource ? (
                                                        <img src={resource.avatarUrl} alt={resource.name} className="w-full h-full object-cover"/>
                                                    ) : <User size={16} className="text-slate-400"/>}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{resource?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">{resource?.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar size={14} className="text-slate-400"/>
                                                {format(parseISO(leave.date), 'MMM d, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                leave.type === 'Sick' ? 'bg-red-50 text-red-700 border-red-100' :
                                                leave.type === 'Vacation' ? 'bg-green-50 text-green-700 border-green-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {leave.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={leave.reason}>
                                            {leave.reason}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {leave.status === 'Approved' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                    <CheckCircle2 size={14} /> Approved
                                                </span>
                                            ) : (
                                                 <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                                    <Clock size={14} /> Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};