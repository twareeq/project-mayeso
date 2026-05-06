import React, { useState, useEffect } from 'react';
import { Eye, Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';

const MarksHistory = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get('/exams');
        setExams(data);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const columns = [
    { key: 'exam_date', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
    { key: 'name', label: 'Assessment' },
    { key: 'class_name', label: 'Class', render: (_, row) => row.classes?.name },
    { key: 'subject_name', label: 'Subject', render: (_, row) => row.subjects?.name },
    { key: 'max_score', label: 'Max Score' },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.is_locked ? 'locked' : 'active'} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link to={`/marks?exam_id=${row.id}`} className="text-blue-500 hover:underline text-sm font-bold">
          View Marks
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Marks History</h1>
        <p className="text-slate-400 mt-1">Review and manage past assessments and student results.</p>
      </header>

      <DataTable 
        columns={columns}
        data={exams}
        loading={loading}
        searchPlaceholder="Filter by exam name..."
      />
    </div>
  );
};

export default MarksHistory;
