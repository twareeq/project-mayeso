import React, { useState, useEffect } from 'react';
import { 
  Settings, Calendar, TrendingUp, Shield, 
  Save, Plus, Trash2, History, Download, Loader2 
} from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';

const SystemConfig = () => {
  const [activeTab, setActiveTab] = useState('academic');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    academic_terms: { year: '2025/2026', terms: [] },
    grading_scale: []
  });
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [configRes, auditRes] = await Promise.all([
          api.get('/system-config'),
          api.get('/audit/logs').catch(() => ({ data: [] }))
        ]);
        
        // Transform array to object
        const configObj = {};
        configRes.data.forEach(item => {
          configObj[item.key] = item.value;
        });
        setConfig(prev => ({ ...prev, ...configObj }));
        setAuditLogs(auditRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveConfig = async (key, value) => {
    setLoading(true);
    try {
      await api.patch('/admin/config', { key, value });
      alert('Configuration updated successfully!');
    } catch (err) {
      alert('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">System Configuration</h1>
        <p className="text-slate-400 mt-1">Manage global platform settings and monitor system health.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex border-b border-slate-800 bg-slate-800/20">
          {[
            { id: 'academic', label: 'Academic Terms', icon: Calendar },
            { id: 'grading', label: 'Grading Scale', icon: TrendingUp },
            { id: 'audit', label: 'Audit Logs', icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'academic' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Current Academic Year</label>
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    value={config.academic_terms.year}
                    onChange={(e) => setConfig({...config, academic_terms: {...config.academic_terms, year: e.target.value}})}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Term Dates</h3>
                {[1, 2, 3].map((term) => (
                  <div key={term} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="flex items-center font-bold text-slate-500">Term {term}</div>
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-1">Start Date</label>
                      <input type="date" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-1">End Date</label>
                      <input type="date" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white" />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSaveConfig('academic_terms', config.academic_terms)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'grading' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-blue-600/10 p-6 rounded-[1.5rem] border border-blue-500/20">
                <div>
                  <h3 className="text-xl font-bold text-white">Grading Scale Band Management</h3>
                  <p className="text-slate-400 text-sm mt-1">Define percentage thresholds for academic grades.</p>
                </div>
                <button 
                  onClick={() => {
                    const newBands = [...config.grading_scale, { grade: '', min: 0, max: 0, label: '' }];
                    setConfig({...config, grading_scale: newBands});
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Band
                </button>
              </div>

              <div className="bg-slate-950/50 rounded-[2rem] border border-slate-800 p-2">
                <table className="w-full text-left">
                  <thead className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-4">Grade</th>
                      <th className="px-6 py-4">Min %</th>
                      <th className="px-6 py-4">Max %</th>
                      <th className="px-6 py-4">Label</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {config.grading_scale.map((band, i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition-all group">
                        <td className="px-6 py-4">
                          <input 
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white w-20 font-bold focus:border-blue-500 outline-none"
                            value={band.grade}
                            placeholder="A"
                            onChange={(e) => {
                              const newBands = [...config.grading_scale];
                              newBands[i].grade = e.target.value.toUpperCase();
                              setConfig({...config, grading_scale: newBands});
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number"
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white w-24 font-mono focus:border-blue-500 outline-none"
                            value={band.min}
                            onChange={(e) => {
                              const newBands = [...config.grading_scale];
                              newBands[i].min = parseInt(e.target.value);
                              setConfig({...config, grading_scale: newBands});
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number"
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white w-24 font-mono focus:border-blue-500 outline-none"
                            value={band.max}
                            onChange={(e) => {
                              const newBands = [...config.grading_scale];
                              newBands[i].max = parseInt(e.target.value);
                              setConfig({...config, grading_scale: newBands});
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white w-full focus:border-blue-500 outline-none"
                            value={band.label}
                            placeholder="Distinction"
                            onChange={(e) => {
                              const newBands = [...config.grading_scale];
                              newBands[i].label = e.target.value;
                              setConfig({...config, grading_scale: newBands});
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              const newBands = config.grading_scale.filter((_, idx) => idx !== i);
                              setConfig({...config, grading_scale: newBands});
                            }}
                            className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-6 rounded-[1.5rem] border border-slate-800">
                <div className="flex items-center gap-3 text-amber-500">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs font-medium">Changes affect future calculations only. Ranges must be contiguous.</span>
                </div>
                <button 
                  onClick={() => handleSaveConfig('grading_scale', config.grading_scale)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20"
                >
                  <Save className="w-5 h-5" />
                  Save Grading Scale
                </button>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <DataTable 
              columns={[
                { key: 'created_at', label: 'Timestamp', render: (v) => new Date(v).toLocaleString() },
                { key: 'user_id', label: 'User' },
                { key: 'action', label: 'Action' },
                { key: 'entity_type', label: 'Entity' },
                { 
                  key: 'new_value', 
                  label: 'Changes', 
                  render: (v) => <span className="text-xs font-mono text-slate-500 truncate block max-w-xs">{JSON.stringify(v)}</span> 
                }
              ]}
              data={auditLogs}
              loading={loading}
              searchPlaceholder="Filter logs..."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
