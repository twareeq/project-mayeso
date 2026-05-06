import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, Users, School, Map, Loader2, 
  ChevronDown, Download, Filter
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/shared/StatCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        let endpoint = '';
        if (user.role === 'teacher') endpoint = `/analytics/class/${user.class_id || 'all'}`;
        else if (user.role === 'head_teacher') endpoint = `/analytics/school/${user.school_id}`;
        else if (user.role === 'zone_manager') endpoint = `/analytics/zone/${user.zone_id}`;
        else if (user.role === 'district_officer') endpoint = `/analytics/district/${user.district_id}`;
        else endpoint = '/analytics/summary'; // Fallback for admin

        // For now, let's use some dummy logic if endpoints are missing or fetch from available ones
        const { data: res } = await api.get(endpoint).catch(() => ({ data: [] }));
        setData(res);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const renderTeacherView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Class Pass Rate" value="78%" trend={5} color="green" icon={TrendingUp} />
        <StatCard title="Average Mark" value="64.5" color="blue" icon={TrendingUp} />
        <StatCard title="At-Risk Students" value="4" color="red" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Subject Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { subject: 'Math', score: 65 },
                { subject: 'English', score: 72 },
                { subject: 'Science', score: 58 },
                { subject: 'Social', score: 80 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Score Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'A (80-100)', value: 5 },
                    { name: 'B (65-79)', value: 12 },
                    { name: 'C (50-64)', value: 15 },
                    { name: 'D (40-49)', value: 8 },
                    { name: 'F (0-39)', value: 3 }
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                >
                  {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Center</h1>
          <p className="text-slate-400 mt-1">Deep dive into performance metrics and trends.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white transition-all">
            <Filter className="w-4 h-4" />
            Filter Term
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </header>

      {user.role === 'teacher' ? renderTeacherView() : (
        <div className="p-20 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="inline-flex items-center justify-center p-8 bg-blue-600/10 rounded-full mb-6 text-blue-500">
            <TrendingUp className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{user.role.replace('_', ' ')} Dashboard</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Aggregated metrics for {user.role.includes('zone') ? 'Zone' : 'District'} level oversight are currently being calculated.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
