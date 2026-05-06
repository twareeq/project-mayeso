import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Building2, 
  Users, 
  Server, 
  Activity,
  Database,
  ShieldCheck,
  Settings
} from 'lucide-react';

const mockSystemUsage = [
  { name: 'Mon', queries: 4000 },
  { name: 'Tue', queries: 3000 },
  { name: 'Wed', queries: 2000 },
  { name: 'Thu', queries: 2780 },
  { name: 'Fri', queries: 1890 },
  { name: 'Sat', queries: 2390 },
  { name: 'Sun', queries: 3490 },
];

const mockRoleDistribution = [
  { name: 'Students', value: 8500, color: '#3b82f6' },
  { name: 'Parents', value: 4200, color: '#8b5cf6' },
  { name: 'Teachers', value: 350, color: '#10b981' },
  { name: 'Admins', value: 15, color: '#ef4444' },
];

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-white">{value}</h3>
        {subtext && (
          <p className="text-sm mt-2 font-medium text-slate-500">
            {subtext}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">System Administration</h1>
          <p className="text-slate-400 mt-1">Platform health, user management, and global configurations.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700">
          <Settings className="w-4 h-4" />
          System Settings
        </button>
      </header>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Active Users" 
          value="13,065" 
          icon={Users} 
          color="blue" 
          subtext="Across 15 schools"
        />
        <StatCard 
          title="System Uptime" 
          value="99.99%" 
          icon={Activity} 
          color="green" 
          subtext="Last 30 days"
        />
        <StatCard 
          title="Database Load" 
          value="24%" 
          icon={Database} 
          color="purple" 
          subtext="Healthy status"
        />
        <StatCard 
          title="Security Alerts" 
          value="0" 
          icon={ShieldCheck} 
          color="emerald" 
          subtext="All systems secure"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Usage Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">API Traffic (Last 7 Days)</h3>
            <span className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              <Server className="w-4 h-4" /> Server: US-East
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSystemUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="queries" name="Requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">User Distribution</h3>
          <p className="text-sm text-slate-400 mb-6">Breakdown of registered accounts</p>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockRoleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockRoleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">13k+</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {mockRoleDistribution.map(role => (
              <div key={role.name} className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                  {role.name}
                </span>
                <span className="font-bold text-white">{role.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Recent Audit Logs</h3>
          <button className="text-sm font-medium text-slate-300 hover:text-white bg-slate-800 px-4 py-2 rounded-lg transition-colors">
            View Full Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/30 text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { time: '10 mins ago', user: 'admin@mayeso.gov', action: 'Updated Global Settings', ip: '192.168.1.1', status: 'Success' },
                { time: '1 hour ago', user: 'system', action: 'Daily Backup Completed', ip: 'localhost', status: 'Success' },
                { time: '2 hours ago', user: 'h.teacher@school.edu', action: 'Failed Login Attempt', ip: '10.0.0.42', status: 'Failed' },
                { time: '5 hours ago', user: 'admin@mayeso.gov', action: 'Created New School Profile', ip: '192.168.1.1', status: 'Success' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400">{log.time}</td>
                  <td className="px-6 py-4 font-medium text-slate-200">{log.user}</td>
                  <td className="px-6 py-4 text-slate-300">{log.action}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">{log.ip}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
