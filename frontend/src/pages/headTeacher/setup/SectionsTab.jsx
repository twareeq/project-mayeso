import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const SectionsTab = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSectionName, setNewSectionName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSections = async () => {
    try {
      const { data } = await api.get('/sections');
      setSections(data);
    } catch (err) {
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/sections', { name: newSectionName });
      setNewSectionName('');
      fetchSections();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await api.delete(`/sections/${id}`);
      fetchSections();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete section');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-100">Manage Sections</h2>
          <p className="text-sm text-slate-400">Create broad academic levels (e.g., Lower Primary, Senior Section).</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleCreate} className="flex gap-3">
        <input 
          type="text" 
          placeholder="Section Name (e.g., Senior Section)" 
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          disabled={submitting}
        />
        <button 
          type="submit" 
          disabled={submitting || !newSectionName.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Section
        </button>
      </form>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-sm font-medium text-slate-400">
              <th className="p-4">Section Name</th>
              <th className="p-4 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-8 text-center text-slate-500 text-sm">No sections created yet.</td>
              </tr>
            ) : (
              sections.map(section => (
                <tr key={section.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-200">{section.name}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(section.id)} className="text-slate-400 hover:text-red-400 transition-colors">
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

export default SectionsTab;
