import React, { useState, useEffect } from 'react';
import { Map, MapPin, School, TrendingUp, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatCard from '../../components/shared/StatCard';

const ZoneList = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const { data } = await api.get('/zones');
        setZones(data);
      } catch (err) {
        console.error('Failed to fetch zones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  const columns = [
    { key: 'name', label: 'Zone Name' },
    { key: 'district', label: 'District', render: (_, row) => row.districts?.name || 'N/A' },
    { key: 'schools_count', label: 'Schools', render: () => '12' },
    { 
      key: 'pass_rate', 
      label: 'Zone Pass Rate', 
      render: () => <span className="text-emerald-500 font-bold">79.5%</span> 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link to={`/zones/${row.id}`} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors inline-block">
          <Eye className="w-4 h-4" />
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Educational Zones</h1>
        <p className="text-slate-400 mt-1">Monitor performance at the zonal aggregate level.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Zones" value={zones.length} icon={Map} color="blue" />
        <StatCard title="Zone Avg Pass Rate" value="74.2%" icon={TrendingUp} color="green" />
        <StatCard title="Total Students" value="45,000+" icon={School} color="purple" />
      </div>

      <DataTable 
        columns={columns}
        data={zones}
        loading={loading}
        searchPlaceholder="Filter by zone or district..."
      />
    </div>
  );
};

export default ZoneList;
