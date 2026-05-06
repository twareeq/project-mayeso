import React, { useState, useEffect } from 'react';
import { School, MapPin, Users, TrendingUp, Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatCard from '../../components/shared/StatCard';

const SchoolList = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data } = await api.get('/schools');
        setSchools(data);
      } catch (err) {
        console.error('Failed to fetch schools:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const columns = [
    { key: 'name', label: 'School Name' },
    { key: 'zone', label: 'Zone', render: (_, row) => row.zones?.name || 'N/A' },
    { key: 'head_teacher', label: 'Head Teacher', render: (_, row) => row.profiles?.full_name || 'Not Assigned' },
    { key: 'student_count', label: 'Students', render: () => '450+' }, // Mocked
    { 
      key: 'pass_rate', 
      label: 'Pass Rate', 
      render: () => <span className="text-emerald-500 font-bold">82%</span> 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link to={`/schools/${row.id}`} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors inline-block">
          <Eye className="w-4 h-4" />
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Schools</h1>
        <p className="text-slate-400 mt-1">Overview of all educational institutions in the region.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Schools" value={schools.length} icon={School} color="blue" />
        <StatCard title="Avg Pass Rate" value="76.4%" icon={TrendingUp} color="green" trend={3.2} />
        <StatCard title="Total Students" value="12,450" icon={Users} color="purple" />
      </div>

      <DataTable 
        columns={columns}
        data={schools}
        loading={loading}
        searchPlaceholder="Filter by name or zone..."
      />
    </div>
  );
};

export default SchoolList;
