import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Task, Resource, TaskStatus } from '../types';
import { Printer, Calendar as CalendarIcon, PieChart as PieIcon, BarChart3, FileText, CheckCircle2, Clock, CalendarDays, ChevronDown, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';

interface ReportsViewProps {
  tasks: Task[];
  resources: Resource[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ tasks, resources }) => {
  const [reportType, setReportType] = useState<'monthly' | 'weekly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // --- Data Aggregation ---
  const reportData = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    // Determine Date Range based on Type
    if (reportType === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      startDate = startOfMonth(new Date(year, month - 1));
      endDate = endOfMonth(new Date(year, month - 1));
    } else {
      const refDate = parseISO(selectedDate);
      startDate = startOfWeek(refDate, { weekStartsOn: 1 }); // Monday start
      endDate = endOfWeek(refDate, { weekStartsOn: 1 });
    }

    // 1. Filter Tasks for the Period
    const periodTasks = tasks.filter(t => {
      const taskDate = parseISO(t.date);
      return isWithinInterval(taskDate, { start: startDate, end: endDate });
    });

    // 2. High Level Metrics
    const totalTasks = periodTasks.length;
    const completedTasks = periodTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const totalHours = periodTasks.reduce((sum, t) => sum + t.duration, 0);

    // 3. Project Breakdown
    const projects = Array.from(new Set(periodTasks.map(t => t.projectName))).map(name => {
      const pTasks = periodTasks.filter(t => t.projectName === name);
      const pHours = pTasks.reduce((sum, t) => sum + t.duration, 0);
      const pCompleted = pTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      return {
        name,
        tasks: pTasks.length,
        hours: pHours,
        completed: pCompleted,
        rate: pTasks.length ? Math.round((pCompleted / pTasks.length) * 100) : 0
      };
    }).sort((a, b) => b.hours - a.hours);

    // 4. Resource Utilization
    const resourceStats = resources.map(r => {
      const rTasks = periodTasks.filter(t => t.assignedResourceId === r.id);
      const rHours = rTasks.reduce((sum, t) => sum + t.duration, 0);
      
      // Calculate capacity based on period (approx 5 days for weekly, 20 for monthly)
      const daysInPeriod = reportType === 'weekly' ? 5 : 20;
      const capacity = r.capacity * daysInPeriod; 

      return {
        name: r.name,
        role: r.role,
        tasks: rTasks.length,
        hours: rHours,
        utilization: Math.round((rHours / capacity) * 100)
      };
    }).filter(r => r.hours > 0).sort((a, b) => b.hours - a.hours);

    // 5. Daily Activity Chart Data
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const activityData = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = periodTasks.filter(t => t.date === dateStr);
      return {
        date: reportType === 'weekly' ? format(day, 'EEE') : format(day, 'd'),
        fullDate: format(day, 'MMM d'),
        completed: dayTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
        pending: dayTasks.filter(t => t.status !== TaskStatus.COMPLETED).length,
      };
    });

    // 6. Status Pie Data
    const statusCounts = {
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.TODO]: 0,
      [TaskStatus.BLOCKED]: 0,
    };
    periodTasks.forEach(t => { if (statusCounts[t.status] !== undefined) statusCounts[t.status]++; });
    const pieData = [
      { name: 'Completed', value: statusCounts[TaskStatus.COMPLETED], color: '#10b981' },
      { name: 'In Progress', value: statusCounts[TaskStatus.IN_PROGRESS], color: '#3b82f6' },
      { name: 'Blocked', value: statusCounts[TaskStatus.BLOCKED], color: '#ef4444' },
      { name: 'Todo', value: statusCounts[TaskStatus.TODO], color: '#cbd5e1' },
    ].filter(d => d.value > 0);

    return { startDate, endDate, totalTasks, completedTasks, completionRate, totalHours, projects, resourceStats, activityData, pieData };
  }, [reportType, selectedMonth, selectedDate, tasks, resources]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Configuration Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-20">
        
        <div className="flex items-center gap-4">
           {/* Report Type Toggle */}
           <div className="bg-slate-100 p-1 rounded-lg flex shrink-0">
              <button
                onClick={() => setReportType('weekly')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${
                  reportType === 'weekly' 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CalendarDays size={16} /> Weekly
              </button>
              <button
                onClick={() => setReportType('monthly')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${
                  reportType === 'monthly' 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CalendarIcon size={16} /> Monthly
              </button>
           </div>

           <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

           {/* Date Picker */}
           <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500">
                 {reportType === 'monthly' ? <CalendarIcon size={16}/> : <CalendarDays size={16}/>}
              </div>
              {reportType === 'monthly' ? (
                 <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                 />
              ) : (
                 <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                 />
              )}
           </div>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-200 active:scale-95"
        >
          <Printer size={18} /> Print / Save PDF
        </button>
      </div>

      {/* Report Document */}
      <div id="printable-report" className="bg-white min-h-[11in] p-8 md:p-12 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
        
        {/* Document Header */}
        <header className="border-b-2 border-slate-900 pb-6 mb-10 flex justify-between items-end">
          <div>
             <div className="flex items-center gap-2 mb-4 text-indigo-600">
               <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">I</div>
               <span className="font-bold text-xl tracking-tight text-slate-900">Ifocus PM</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight capitalize">{reportType} Overview</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              {format(reportData.startDate, 'MMMM d, yyyy')} — {format(reportData.endDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="text-right hidden sm:block">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Generated On</div>
             <div className="text-slate-800 font-mono">{format(new Date(), 'PPP')}</div>
          </div>
        </header>

        {/* Executive Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <SummaryCard 
             label="Total Tasks" 
             value={reportData.totalTasks} 
             color="indigo"
             icon={<FileText size={24} className="text-indigo-600"/>} 
          />
          <SummaryCard 
             label="Completion Rate" 
             value={`${reportData.completionRate}%`} 
             color="emerald"
             icon={<CheckCircle2 size={24} className="text-emerald-600"/>} 
          />
          <SummaryCard 
             label="Total Hours" 
             value={`${reportData.totalHours}h`} 
             color="blue"
             icon={<Clock size={24} className="text-blue-600"/>} 
          />
          <SummaryCard 
             label="Team Active" 
             value={reportData.resourceStats.length} 
             color="amber"
             icon={<PieIcon size={24} className="text-amber-600"/>} 
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 break-inside-avoid">
           <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <BarChart3 size={18} className="text-slate-400"/> Daily Throughput
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: '#64748b'}} stroke="transparent" dy={10} />
                    <YAxis tick={{fontSize: 11, fill: '#64748b'}} stroke="transparent" />
                    <Tooltip 
                        cursor={{fill: '#f1f5f9'}} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[0, 0, 4, 4]} barSize={32} />
                    <Bar dataKey="pending" stackId="a" fill="#cbd5e1" name="Pending" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <PieIcon size={18} className="text-slate-400"/> Task Status Distribution
              </h3>
              <div className="h-64 flex items-center">
                 <div className="flex-1 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {reportData.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '12px', color: '#475569'}} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </section>

        {/* Project Breakdown */}
        <section className="mb-12 break-inside-avoid">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Project Performance</h3>
              <div className="h-px bg-slate-200 flex-1 ml-4"></div>
           </div>
           
           <div className="overflow-hidden rounded-lg border border-slate-200">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                 <tr>
                   <th className="px-6 py-3">Project Name</th>
                   <th className="px-6 py-3 text-right">Tasks</th>
                   <th className="px-6 py-3 text-right">Hours</th>
                   <th className="px-6 py-3 w-1/4">Progress</th>
                   <th className="px-6 py-3 text-right">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                 {reportData.projects.map((p) => (
                   <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                     <td className="px-6 py-4 text-right text-slate-600">{p.tasks}</td>
                     <td className="px-6 py-4 text-right text-slate-600">{p.hours}</td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-indigo-500 h-2 rounded-full" style={{width: `${p.rate}%`}}></div>
                           </div>
                           <span className="text-xs font-medium text-slate-600 w-8 text-right">{p.rate}%</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        {p.rate === 100 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                <CheckCircle2 size={12}/> Completed
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                <Clock size={12}/> Active
                            </span>
                        )}
                     </td>
                   </tr>
                 ))}
                 {reportData.projects.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No project data available for this period.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </section>

        {/* Resource Breakdown */}
        <section className="break-inside-avoid">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Resource Utilization</h3>
              <div className="h-px bg-slate-200 flex-1 ml-4"></div>
           </div>
           
           <div className="overflow-hidden rounded-lg border border-slate-200">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                 <tr>
                   <th className="px-6 py-3">Team Member</th>
                   <th className="px-6 py-3">Role</th>
                   <th className="px-6 py-3 text-right">Assigned Tasks</th>
                   <th className="px-6 py-3 text-right">Logged Hours</th>
                   <th className="px-6 py-3 text-right">Utilization</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                 {reportData.resourceStats.map((r) => (
                   <tr key={r.name} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 font-medium text-slate-900">{r.name}</td>
                     <td className="px-6 py-4 text-slate-500">{r.role}</td>
                     <td className="px-6 py-4 text-right text-slate-600">{r.tasks}</td>
                     <td className="px-6 py-4 text-right text-slate-600">{r.hours}</td>
                     <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${r.utilization > 100 ? 'text-red-600' : r.utilization > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {r.utilization}%
                        </span>
                     </td>
                   </tr>
                 ))}
                 {reportData.resourceStats.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No resource data available for this period.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </section>
        
        {/* Print Footer */}
        <footer className="hidden print:block mt-16 pt-8 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400 mb-1">Confidential - Internal Use Only</p>
            <p className="text-[10px] text-slate-300">Generated by Ifocus Project Management System</p>
        </footer>

      </div>
      
      {/* Print Styles Injection */}
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { background: white; }
          #printable-report { box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: 'indigo' | 'emerald' | 'blue' | 'amber' }) => {
    const borderColors = {
        indigo: 'border-indigo-500',
        emerald: 'border-emerald-500',
        blue: 'border-blue-500',
        amber: 'border-amber-500',
    };
    const bgColors = {
        indigo: 'bg-indigo-50',
        emerald: 'bg-emerald-50',
        blue: 'bg-blue-50',
        amber: 'bg-amber-50',
    };

    return (
        <div className={`bg-white rounded-lg p-5 border-l-4 ${borderColors[color]} shadow-sm border-t border-r border-b border-slate-100`}>
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <div className={`p-1.5 rounded-md ${bgColors[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
    );
};
