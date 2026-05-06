import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import StatCard from '../../components/shared/StatCard';

const AttendanceSummary = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data } = await api.get('/teacher-assignments');
      setAssignments(data);
      if (data.length > 0) setSelectedClass(data[0].class_id);
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchSummary = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/attendance?class_id=${selectedClass}`);
          
          // Group by student for summary
          const studentMap = {};
          data.forEach(a => {
            const sid = a.student_id;
            if (!studentMap[sid]) {
              studentMap[sid] = { 
                name: a.students.full_name, 
                present: 0, 
                absent: 0, 
                excused: 0,
                total: 0 
              };
            }
            studentMap[sid].total++;
            studentMap[sid][a.status]++;
          });

          const summaryData = Object.values(studentMap).map(s => ({
            ...s,
            rate: (s.present / s.total) * 100
          }));
          setSummary(summaryData);
        } finally {
          setLoading(false);
        }
      };
      fetchSummary();
    }
  }, [selectedClass]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Attendance Summary</h1>
        <p className="text-slate-400 mt-1">Detailed analysis of student participation rates.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-6">
        <div className="w-64">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selected Class</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            {assignments.map(a => <option key={a.id} value={a.class_id}>{a.classes.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Avg Attendance" value="94.2%" color="green" icon={Users} />
        <StatCard title="Students at Risk" value={summary.filter(s => s.rate < 75).length} color="red" icon={AlertTriangle} />
        <StatCard title="Days Logged" value="12" color="blue" icon={Calendar} />
      </div>

      <DataTable 
        columns={[
          { key: 'name', label: 'Student Name' },
          { key: 'present', label: 'Present' },
          { key: 'absent', label: 'Absent' },
          { key: 'excused', label: 'Excused' },
          { 
            key: 'rate', 
            label: 'Rate %', 
            render: (v) => <span className={`font-bold ${v < 75 ? 'text-red-500' : 'text-emerald-500'}`}>{v.toFixed(1)}%</span> 
          },
          { 
            key: 'status', 
            label: 'Status', 
            render: (_, row) => <StatusBadge status={row.rate < 75 ? 'at-risk' : 'good'} /> 
          }
        ]}
        data={summary}
        loading={loading}
      />
    </div>
  );
};

export default AttendanceSummary;
