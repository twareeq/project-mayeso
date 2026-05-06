import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Save, Plus, Lock, CheckCircle, 
  AlertCircle, Loader2, Filter, User
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';

const MarksEntry = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selection state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { student_id: score }

  // New Assessment Form
  const [showNewExam, setShowNewExam] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', type: 'Continuous Assessment', exam_date: new Date().toISOString().split('T')[0], max_score: 100 });

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data } = await api.get('/teacher-assignments');
        setAssignments(data);
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Filter subjects based on selected class
  const availableSubjects = assignments
    .filter(a => a.class_id === selectedClass)
    .map(a => a.subjects);

  // Fetch exams when class/subject changes
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      const fetchExams = async () => {
        const { data } = await api.get(`/exams?class_id=${selectedClass}&subject_id=${selectedSubject}`);
        setExams(data);
      };
      fetchExams();
    }
  }, [selectedClass, selectedSubject]);

  // Fetch students and existing marks when exam changes
  useEffect(() => {
    if (selectedExam) {
      const fetchMarksData = async () => {
        setLoading(true);
        try {
          const [studentRes, markRes] = await Promise.all([
            api.get(`/students?class_id=${selectedClass}`),
            api.get(`/marks?exam_id=${selectedExam.id}`)
          ]);
          setStudents(studentRes.data);
          
          const markMap = {};
          markRes.data.forEach(m => {
            markMap[m.student_id] = m.score;
          });
          setMarks(markMap);
        } finally {
          setLoading(false);
        }
      };
      fetchMarksData();
    }
  }, [selectedExam]);

  const handleScoreChange = (studentId, score) => {
    const val = parseInt(score);
    if (isNaN(val)) {
      setMarks(prev => ({ ...prev, [studentId]: '' }));
      return;
    }
    if (val < 0 || val > selectedExam.max_score) return;
    setMarks(prev => ({ ...prev, [studentId]: val }));
  };

  const calculateGrade = (score) => {
    if (score === undefined || score === '') return '-';
    const pct = (score / selectedExam.max_score) * 100;
    if (pct >= 80) return 'A';
    if (pct >= 65) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const bulkMarks = Object.entries(marks).map(([student_id, score]) => ({
        student_id,
        score
      })).filter(m => m.score !== '');

      await api.post('/marks/bulk', {
        exam_id: selectedExam.id,
        marks: bulkMarks
      });
      alert(`Successfully saved ${bulkMarks.length} marks!`);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/exams', {
        ...newExam,
        class_id: selectedClass,
        subject_id: selectedSubject
      });
      setExams([data, ...exams]);
      setSelectedExam(data);
      setShowNewExam(false);
    } catch (err) {
      alert('Failed to create assessment');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Marks Entry</h1>
        <p className="text-slate-400 mt-1">Select a class and subject to manage academic results.</p>
      </header>

      {/* Selection Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Step 1: Select Class</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject('');
              setSelectedExam(null);
            }}
          >
            <option value="">Choose Class...</option>
            {[...new Set(assignments.map(a => a.class_id))].map(cid => {
              const assignment = assignments.find(a => a.class_id === cid);
              return <option key={cid} value={cid}>{assignment.classes.name}</option>
            })}
          </select>
        </div>

        <div className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl transition-opacity ${!selectedClass ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Step 2: Select Subject</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedExam(null);
            }}
          >
            <option value="">Choose Subject...</option>
            {availableSubjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl transition-opacity ${!selectedSubject ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Step 3: Assessment</label>
            <button onClick={() => setShowNewExam(true)} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> New
            </button>
          </div>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            value={selectedExam?.id || ''}
            onChange={(e) => setSelectedExam(exams.find(ex => ex.id === e.target.value))}
          >
            <option value="">Choose Exam...</option>
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name} ({new Date(ex.exam_date).toLocaleDateString()})</option>
            ))}
          </select>
        </div>
      </div>

      {/* New Assessment Modal Placeholder */}
      {showNewExam && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateExam} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6">
            <h2 className="text-2xl font-bold text-white">New Assessment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Assessment Name</label>
                <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Type</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white" value={newExam.type} onChange={e => setNewExam({...newExam, type: e.target.value})}>
                  <option>Continuous Assessment</option>
                  <option>Midterm</option>
                  <option>End-Term</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Max Score</label>
                  <input type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white" value={newExam.max_score} onChange={e => setNewExam({...newExam, max_score: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white" value={newExam.exam_date} onChange={e => setNewExam({...newExam, exam_date: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowNewExam(false)} className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Marks Table */}
      {selectedExam && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                {selectedExam.name}
                {selectedExam.is_locked && <Lock className="w-4 h-4 text-amber-500" />}
              </h3>
              <p className="text-slate-400 text-sm mt-1">Enter marks for {students.length} students. Max Score: {selectedExam.max_score}</p>
            </div>
            <button 
              onClick={handleSaveMarks}
              disabled={saving || selectedExam.is_locked}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save All Marks
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/30 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-8 py-4">#</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4 w-40 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-4 text-slate-500 font-mono text-xs">{i + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{s.full_name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{s.student_number}</td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        disabled={selectedExam.is_locked}
                        value={marks[s.id] ?? ''}
                        onChange={(e) => handleScoreChange(s.id, e.target.value)}
                        className={`w-24 mx-auto block bg-slate-950 border ${marks[s.id] > selectedExam.max_score ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2 text-center text-white focus:border-blue-500 outline-none`}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={calculateGrade(marks[s.id])} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
