import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const ClassesTab = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState({ name: '', section_id: '', academic_year: new Date().getFullYear().toString() });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [classesRes, sectionsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/sections')
      ]);
      setClasses(classesRes.data);
      setSections(sectionsRes.data);
      if (sectionsRes.data.length > 0 && !newClass.section_id) {
        setNewClass(prev => ({ ...prev, section_id: sectionsRes.data[0].id }));
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newClass.name.trim() || !newClass.section_id) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/classes', newClass);
      setNewClass({ ...newClass, name: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete class');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-100">Manage Classes</h2>
          <p className="text-sm text-slate-400">Create classes (e.g. Standard 1A) and link them to sections.</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Class Name</label>
          <input 
            type="text" 
            placeholder="e.g. Standard 1A" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newClass.section_id}
            onChange={(e) => setNewClass({ ...newClass, section_id: e.target.value })}
            disabled={submitting}
          >
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Academic Year</label>
          <input 
            type="text" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newClass.academic_year}
            onChange={(e) => setNewClass({ ...newClass, academic_year: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="md:col-span-1 flex items-end">
          <button 
            type="submit" 
            disabled={submitting || !newClass.name.trim()}
            className="w-full h-[42px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Class
          </button>
        </div>
      </form>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-sm font-medium text-slate-400">
              <th className="p-4">Class Name</th>
              <th className="p-4">Section</th>
              <th className="p-4">Year</th>
              <th className="p-4 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">No classes created yet.</td>
              </tr>
            ) : (
              classes.map(cls => (
                <tr key={cls.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-200 font-medium">{cls.name}</td>
                  <td className="p-4 text-slate-400 text-sm">
                    {sections.find(s => s.id === cls.section_id)?.name || 'N/A'}
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{cls.academic_year}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(cls.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassesTab;
