import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Plus, Trash2, Loader2, UserCheck } from 'lucide-react';

const TeachersTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAssignment, setNewAssignment] = useState({ 
    teacher_id: '', 
    class_id: '', 
    subject_id: '', 
    academic_year: new Date().getFullYear().toString() 
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [assignmentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        api.get('/teacher-assignments'),
        api.get('/users'), // Need to filter for teachers eventually
        api.get('/classes'),
        api.get('/subjects')
      ]);
      
      setAssignments(assignmentsRes.data);
      
      // Filter for users with role 'teacher'
      const teacherUsers = teachersRes.data.filter(u => u.role === 'teacher' || u.role === 'section_head');
      setTeachers(teacherUsers);
      
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      
      if (teacherUsers.length > 0 && !newAssignment.teacher_id) {
        setNewAssignment(prev => ({ ...prev, teacher_id: teacherUsers[0].id }));
      }
      if (classesRes.data.length > 0 && !newAssignment.class_id) {
        setNewAssignment(prev => ({ ...prev, class_id: classesRes.data[0].id }));
      }
      if (subjectsRes.data.length > 0 && !newAssignment.subject_id) {
        setNewAssignment(prev => ({ ...prev, subject_id: subjectsRes.data[0].id }));
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
    if (!newAssignment.teacher_id || !newAssignment.class_id || !newAssignment.subject_id) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/teacher-assignments', newAssignment);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await api.delete(`/teacher-assignments/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete assignment');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-100">Teacher Assignments</h2>
          <p className="text-sm text-slate-400">Assign teachers to specific classes and subjects.</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Teacher</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newAssignment.teacher_id}
            onChange={(e) => setNewAssignment({ ...newAssignment, teacher_id: e.target.value })}
            disabled={submitting}
          >
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newAssignment.class_id}
            onChange={(e) => setNewAssignment({ ...newAssignment, class_id: e.target.value })}
            disabled={submitting}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newAssignment.subject_id}
            onChange={(e) => setNewAssignment({ ...newAssignment, subject_id: e.target.value })}
            disabled={submitting}
          >
            {subjects.filter(s => s.class_id === newAssignment.class_id).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
          <input 
            type="text" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={newAssignment.academic_year}
            onChange={(e) => setNewAssignment({ ...newAssignment, academic_year: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="flex items-end">
          <button 
            type="submit" 
            disabled={submitting || !newAssignment.teacher_id || !newAssignment.class_id || !newAssignment.subject_id}
            className="w-full h-[42px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Assign
          </button>
        </div>
      </form>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-sm font-medium text-slate-400">
              <th className="p-4">Teacher</th>
              <th className="p-4">Class</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Year</th>
              <th className="p-4 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">No teacher assignments found.</td>
              </tr>
            ) : (
              assignments.map(a => (
                <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-900/30 text-emerald-400 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span className="text-slate-200 font-medium">{a.profiles?.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{a.classes?.name}</td>
                  <td className="p-4 text-slate-400 text-sm">{a.subjects?.name}</td>
                  <td className="p-4 text-slate-400 text-sm">{a.academic_year}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-400 transition-colors">
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

export default TeachersTab;
