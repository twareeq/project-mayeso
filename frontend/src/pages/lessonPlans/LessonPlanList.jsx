import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';

const LessonPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/lesson-plans');
        setPlans(data);
      } catch (err) {
        console.error('Failed to fetch lesson plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubmit = async (id) => {
    if (!window.confirm('Are you sure you want to submit this lesson plan for review?')) return;
    try {
      await api.post(`/lesson-plans/${id}/submit`);
      // Update local state
      setPlans(plans.map(p => p.id === id ? { ...p, status: 'submitted' } : p));
      alert('Lesson plan submitted successfully!');
    } catch (err) {
      alert('Failed to submit lesson plan');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'subject', label: 'Subject', render: (_, row) => row.subjects?.name },
    { key: 'class', label: 'Class', render: (_, row) => row.classes?.name },
    { key: 'week_number', label: 'Week' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { 
      key: 'created_at', 
      label: 'Submitted', 
      render: (v) => v ? new Date(v).toLocaleDateString() : 'N/A' 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Link to={`/lesson-plans/${row.id}`} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
          {row.status === 'draft' && (
            <>
              <Link to={`/lesson-plans/${row.id}/edit`} className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </Link>
              <button onClick={() => handleSubmit(row.id)} className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Lesson Plans</h1>
          <p className="text-slate-400 mt-1">Manage and track your academic planning.</p>
        </div>
        <Link to="/lesson-plans/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5" />
          Create Lesson Plan
        </Link>
      </div>

      <DataTable 
        columns={columns}
        data={plans}
        loading={loading}
        searchPlaceholder="Filter by title..."
      />
    </div>
  );
};

export default LessonPlanList;
