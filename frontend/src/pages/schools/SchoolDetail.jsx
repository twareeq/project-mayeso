import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, School, Users, Trophy, 
  TrendingUp, Calendar, FileText, Loader2 
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import PDFDownloadButton from '../../components/shared/PDFDownloadButton';

const SchoolDetail = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const { data } = await api.get(`/schools/${id}`);
        setSchool(data);
      } catch (err) {
        console.error('Failed to fetch school:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!school) return <div className="p-20 text-center text-slate-500">School not found.</div>;

  return (
    <div className="space-y-8">
      <Link to="/schools" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Schools
      </Link>

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
            <School className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{school.name}</h1>
            <p className="text-slate-400">{school.zones?.name} Zone • {school.address || 'Malawi'}</p>
          </div>
        </div>
        <PDFDownloadButton 
          endpoint={`/reports/school/${id}`}
          filename={`${school.name}_report.pdf`}
          label="Generate School Report"
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="452" icon={Users} color="blue" />
        <StatCard title="Total Teachers" value="18" icon={Users} color="purple" />
        <StatCard title="Pass Rate" value="82%" icon={Trophy} color="green" />
        <StatCard title="Classes" value="12" icon={Calendar} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Class Performance</h3>
            </div>
            <DataTable 
              columns={[
                { key: 'name', label: 'Class Name' },
                { key: 'teacher', label: 'Lead Teacher', render: () => 'Mr. Phiri' },
                { key: 'count', label: 'Students', render: () => '45' },
                { key: 'avg', label: 'Avg Score', render: () => <span className="font-bold text-blue-500">68%</span> }
              ]}
              data={[{ id: 1, name: 'Standard 4A' }, { id: 2, name: 'Standard 4B' }]}
              loading={false}
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Head Teacher</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-blue-500">
                HT
              </div>
              <div>
                <p className="text-white font-medium">Loveness Banda</p>
                <p className="text-slate-500 text-sm">HT-0092-2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetail;
