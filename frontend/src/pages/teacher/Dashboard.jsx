import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { 
  Users, Trophy, Calendar, AlertCircle, Plus, FileText, UserCheck, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgScore: 0,
    attRate: 0,
    pendingTasks: 0
  });
  const [chartData, setChartData] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Get assignments to find class ID
        const { data: assignRes } = await api.get('/teacher-assignments');
        setAssignments(assignRes);
        
        if (assignRes.length > 0) {
          const classId = assignRes[0].class_id;
          const schoolId = user.school_id;

          // 2. Fetch parallel data
          const [summaryRes, trendRes, riskRes, studentRes] = await Promise.all([
            api.get(`/analytics/class/${classId}`),
            api.get(`/analytics/attendance/class/${classId}`),
            api.get(`/analytics/school/${schoolId}/at-risk`),
            api.get(`/students?class_id=${classId}`)
          ]);

          setChartData(summaryRes.data);
          setAttendanceTrend(trendRes.data);
          setAtRiskStudents(riskRes.data);
          
          // Calculate Stat Cards
          const totalStudents = studentRes.data.length;
          const classAvg = summaryRes.data.length 
            ? summaryRes.data.reduce((acc, s) => acc + s.average_score, 0) / summaryRes.data.length 
            : 0;
          const currentAtt = trendRes.data.length 
            ? trendRes.data[trendRes.data.length - 1].rate 
            : 0;

          setStats({
            totalStudents,
            avgScore: classAvg.toFixed(1),
            attRate: currentAtt.toFixed(1),
            pendingTasks: 3 // Mocked for now
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back, {user?.full_name}. Here's your class overview.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" />
        <StatCard title="Class Average" value={`${stats.avgScore}%`} icon={Trophy} color="green" />
        <StatCard title="Attendance Rate" value={`${stats.attRate}%`} icon={Calendar} color="yellow" />
        <StatCard title="Pending Review" value={stats.pendingTasks} icon={AlertCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Performance */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6">Subject Averages</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject_name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="average_score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6">Attendance Trend (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(d) => d.split('-')[2]} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/marks" className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 p-6 rounded-2xl transition-all group shadow-lg shadow-blue-500/20">
          <div className="bg-white/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-white">Enter Marks</h4>
            <p className="text-blue-100 text-sm">Update exam results</p>
          </div>
        </Link>

        <Link to="/attendance" className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all group">
          <div className="bg-blue-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <UserCheck className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-white">Mark Attendance</h4>
            <p className="text-slate-400 text-sm">Daily student tracking</p>
          </div>
        </Link>

        <Link to="/lesson-plans" className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all group">
          <div className="bg-green-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-white">Lesson Plans</h4>
            <p className="text-slate-400 text-sm">Plan next week's content</p>
          </div>
        </Link>
      </div>

      {/* At-Risk Students Table */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
          <h3 className="text-xl font-bold">At-Risk Students</h3>
          <span className="bg-red-500/10 text-red-500 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {atRiskStudents.length} Students Flagged
          </span>
        </div>
        <DataTable 
          columns={[
            { key: 'full_name', label: 'Student Name' },
            { key: 'student_number', label: 'Student Number' },
            { 
              key: 'avgScore', 
              label: 'Avg Score',
              render: (v) => <span className={v < 40 ? 'text-red-500 font-bold' : ''}>{v.toFixed(1)}%</span>
            },
            { 
              key: 'attRate', 
              label: 'Attendance',
              render: (v) => <span className={v < 75 ? 'text-amber-500 font-bold' : ''}>{v.toFixed(1)}%</span>
            },
            { 
              key: 'riskReason', 
              label: 'Risk Reason',
              render: (v) => <span className="text-xs text-slate-500">{v}</span>
            }
          ]}
          data={atRiskStudents}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;
