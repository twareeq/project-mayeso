import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Map, School, Users, Trophy, 
  TrendingUp, FileText, Loader2 
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import PDFDownloadButton from '../../components/shared/PDFDownloadButton';

const ZoneDetail = () => {
  const { id } = useParams();
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZone = async () => {
      try {
        const { data } = await api.get(`/zones/${id}`);
        setZone(data);
      } catch (err) {
        console.error('Failed to fetch zone:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchZone();
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!zone) return <div className="p-20 text-center text-slate-500">Zone not found.</div>;

  return (
    <div className="space-y-8">
      <Link to="/zones" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Zones
      </Link>

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
            <Map className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{zone.name} Zone</h1>
            <p className="text-slate-400">{zone.districts?.name} District</p>
          </div>
        </div>
        <PDFDownloadButton 
          endpoint={`/reports/zone/${id}`}
          filename={`${zone.name}_zone_report.pdf`}
          label="Generate Zone Report"
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Schools" value="12" icon={School} color="blue" />
        <StatCard title="Total Students" value="5,420" icon={Users} color="purple" />
        <StatCard title="Zone Pass Rate" value="79.5%" icon={Trophy} color="green" />
        <StatCard title="Avg Score" value="62.4" icon={TrendingUp} color="yellow" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-800/20">
          <h3 className="text-xl font-bold text-white">School Comparison</h3>
        </div>
        <DataTable 
          columns={[
            { key: 'name', label: 'School Name' },
            { key: 'ht', label: 'Head Teacher', render: () => 'L. Banda' },
            { key: 'students', label: 'Students', render: () => '450' },
            { key: 'pass_rate', label: 'Pass Rate', render: () => <span className="text-emerald-500 font-bold">81%</span> }
          ]}
          data={[{ id: 1, name: 'Mponela Primary' }, { id: 2, name: 'Kasinje School' }]}
          loading={false}
        />
      </div>
    </div>
  );
};

export default ZoneDetail;
