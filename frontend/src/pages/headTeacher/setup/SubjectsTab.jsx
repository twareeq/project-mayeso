import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Plus, Trash2, Loader2, BookOpen } from 'lucide-react';

const SubjectsTab = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', class_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes')
      ]);
      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
      if (classesRes.data.length > 0 && !newSubject.class_id) {
        setNewSubject(prev => ({ ...prev, class_id: classesRes.data[0].id }));
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
    if (!newSubject.name.trim() || !newSubject.code.trim() || !newSubject.class_id) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/subjects', newSubject);
      setNewSubject({ ...newSubject, name: '', code: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete subject');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-100">Manage Subjects</h2>
          <p className="text-sm text-slate-400">Define subjects for each class level (e.g. Mathematics, English).</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Subject Name</label>
          <input 
            type="text" 
            placeholder="e.g. Mathematics" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Subject Code</label>
          <input 
            type="text" 
            placeholder="e.g. MATH-S1" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newSubject.code}
            onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Assign to Class</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newSubject.class_id}
            onChange={(e) => setNewSubject({ ...newSubject, class_id: e.target.value })}
            disabled={submitting}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1 flex items-end">
          <button 
            type="submit" 
            disabled={submitting || !newSubject.name.trim() || !newSubject.code.trim()}
            className="w-full h-[42px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Subject
          </button>
        </div>
      </form>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-sm font-medium text-slate-400">
              <th className="p-4">Subject Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">Class</th>
              <th className="p-4 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">No subjects created yet.</td>
              </tr>
            ) : (
              subjects.map(sub => (
                <tr key={sub.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-900/30 text-blue-400 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-slate-200 font-medium">{sub.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 text-sm font-mono">{sub.code}</td>
                  <td className="p-4 text-slate-400 text-sm">{sub.class_name || 'N/A'}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(sub.id)} className="text-slate-400 hover:text-red-400 transition-colors">
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

export default SubjectsTab;
