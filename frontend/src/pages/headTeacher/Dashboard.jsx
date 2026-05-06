import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  BookOpen,
  UserCheck,
  Building
} from 'lucide-react';

const mockPerformanceData = [
  { name: 'Std 1', avg: 65, target: 70 },
  { name: 'Std 2', avg: 72, target: 70 },
  { name: 'Std 3', avg: 68, target: 75 },
  { name: 'Std 4', avg: 76, target: 75 },
  { name: 'Std 5', avg: 82, target: 80 },
  { name: 'Std 6', avg: 74, target: 80 },
  { name: 'Std 7', avg: 85, target: 85 },
  { name: 'Std 8', avg: 88, target: 85 },
];

const mockAttendanceData = [
  { week: 'Week 1', rate: 95 },
  { week: 'Week 2', rate: 92 },
  { week: 'Week 3', rate: 88 },
  { week: 'Week 4', rate: 96 },
  { week: 'Week 5', rate: 94 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
        {trend && (
          <p className={`text-sm mt-2 font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}% vs last month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const HeadTeacherDashboard = () => {
  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-bold text-white">Principal's Overview</h1>
        <p className="text-slate-400 mt-1">School performance metrics and operations at a glance.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Enrollment" 
          value="842" 
          icon={Users} 
          color="blue" 
          trend={{ value: 2.4, isPositive: true }} 
        />
        <StatCard 
          title="School Average" 
          value="76.2%" 
          icon={GraduationCap} 
          color="green" 
          trend={{ value: 4.1, isPositive: true }} 
        />
        <StatCard 
          title="Attendance Rate" 
          value="93%" 
          icon={UserCheck} 
          color="yellow" 
          trend={{ value: 1.2, isPositive: false }} 
        />
        <StatCard 
          title="Critical Alerts" 
          value="12" 
          icon={AlertTriangle} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Class Performance Comparison */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Standard Performance vs Targets</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="avg" name="Actual Average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target Score" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* School Attendance Trend */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">School-wide Attendance</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} domain={[80, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff & Teacher Overview */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold">Teacher Performance Overview</h3>
          <button className="text-sm font-medium text-blue-500 hover:text-blue-400 bg-blue-500/10 px-4 py-2 rounded-lg transition-colors">
            View All Staff
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/30 text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Teacher Name</th>
                <th className="px-6 py-4 font-medium">Assigned Class</th>
                <th className="px-6 py-4 font-medium">Class Avg</th>
                <th className="px-6 py-4 font-medium">Lesson Plans Submitted</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { name: 'Mr. Kamau', class: 'Std 4A', avg: '76.4%', plans: '100%', status: 'Excellent' },
                { name: 'Mrs. Banda', class: 'Std 2B', avg: '71.2%', plans: '80%', status: 'Good' },
                { name: 'Mr. Phiri', class: 'Std 6C', avg: '64.8%', plans: '40%', status: 'Needs Review' },
                { name: 'Ms. Mwale', class: 'Std 8A', avg: '88.1%', plans: '100%', status: 'Excellent' },
              ].map((teacher, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {teacher.name}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{teacher.class}</td>
                  <td className="px-6 py-4 font-medium text-white">{teacher.avg}</td>
                  <td className="px-6 py-4 text-slate-400">{teacher.plans}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      teacher.status === 'Excellent' ? 'bg-green-500/10 text-green-500' :
                      teacher.status === 'Good' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {teacher.status}
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

export default HeadTeacherDashboard;
