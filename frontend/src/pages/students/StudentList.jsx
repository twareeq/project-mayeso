import React, { useState, useEffect } from 'react';
import { Plus, User, Edit, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/students');
        // Based on the interceptor, response is { success: true, data: [...] }
        setStudents(response.data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { key: 'student_number', label: 'ID' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'gender', label: 'Gender', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'class_name', label: 'Class', render: (_, row) => row.classes?.name || 'N/A' },
    { 
      key: 'attRate', 
      label: 'Attendance', 
      render: (v) => <StatusBadge status={v < 75 ? 'at-risk' : 'good'} /> 
    },
    { 
      key: 'avgScore', 
      label: 'Avg Score', 
      render: (v) => <span className={v < 40 ? 'text-red-500 font-bold' : ''}>{v || '0'}%</span> 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Link to={`/students/${row.id}`} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
          <button className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Students</h1>
          <p className="text-slate-400 mt-1">Manage and track student enrollment and basic info.</p>
        </div>
        <Link to="/students/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5" />
          Register Student
        </Link>
      </div>

      <DataTable 
        columns={columns}
        data={students}
        loading={loading}
        searchPlaceholder="Search by name or student number..."
      />
    </div>
  );
};

export default StudentList;
