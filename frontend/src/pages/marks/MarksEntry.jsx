import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Save, Plus, Lock, CheckCircle, 
  AlertCircle, Loader2, Filter, User, ChevronLeft,
  Calendar, BookOpen, GraduationCap, Clock
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';

const MarksEntry = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data state
  const [assignments, setAssignments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingMarks, setExistingMarks] = useState([]);

  // Selection state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);

  // Marks entry state
  const [marksData, setMarksData] = useState({}); // { student_id: { score, is_absent, status } }

  // New Assessment Form
  const [showNewExam, setShowNewExam] = useState(false);
  const [newExam, setNewExam] = useState({ 
    name: '', 
    type: 'continuous_assessment', 
    exam_date: new Date().toISOString().split('T')[0], 
    max_score: 20,
    sequence_no: 1
  });

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const [assignmentRes, termRes] = await Promise.all([
          api.get('/teacher-assignments'),
          api.get('/system-config') // We'll get terms from here or a dedicated endpoint
        ]);
        setAssignments(assignmentRes.data);
        
        // Fetch terms from a dedicated endpoint if possible
        const { data: termsData } = await api.get('/academic-terms');
        setTerms(termsData || []);
        
        const currentTerm = termsData?.find(t => t.is_current);
        if (currentTerm) setSelectedTerm(currentTerm.id);

      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Step 1 -> Step 2
  const handleStep1Continue = () => {
    if (selectedClass && selectedTerm) setStep(2);
  };

  // Step 2 -> Step 3
  const handleStep2Continue = async () => {
    if (selectedSubject && selectedExam) {
      setLoading(true);
      try {
        const [studentRes, markRes] = await Promise.all([
          api.get(`/students?class_id=${selectedClass}`),
          api.get(`/marks?exam_id=${selectedExam.id}`)
        ]);
        
        setStudents(studentRes.data);
        setExistingMarks(markRes.data);

        // Initialize marks data
        const initialMarks = {};
        studentRes.data.forEach(s => {
          const existing = markRes.data.find(m => m.student_id === s.id);
          initialMarks[s.id] = {
            score: existing ? existing.score : '',
            is_absent: existing ? existing.is_absent : false,
            status: existing ? 'Saved' : 'New'
          };
        });
        setMarksData(initialMarks);
        setStep(3);
      } catch (err) {
        console.error('Failed to load marks entry:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch subjects for selected class
  const availableSubjects = assignments
    .filter(a => a.class_id === selectedClass)
    .map(a => a.subjects);

  // Fetch exams when class/subject/term changes
  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm) {
      const fetchExams = async () => {
        const { data } = await api.get(`/exams?class_id=${selectedClass}&subject_id=${selectedSubject}&term_id=${selectedTerm}`);
        setExams(data);
      };
      fetchExams();
    }
  }, [selectedClass, selectedSubject, selectedTerm]);

  const handleScoreChange = (studentId, score) => {
    const val = score === '' ? '' : parseFloat(score);
    if (val !== '' && (val < 0 || val > selectedExam.max_score)) return;

    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: val,
        is_absent: false,
        status: prev[studentId].status === 'Saved' ? 'Edited' : 'New'
      }
    }));
  };

  const handleAttendanceChange = (studentId, isAbsent) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        is_absent: isAbsent,
        score: isAbsent ? 0 : prev[studentId].score,
        status: prev[studentId].status === 'Saved' ? 'Edited' : 'New'
      }
    }));
  };

  const calculateGrade = (score) => {
    if (score === undefined || score === '' || !selectedExam) return '-';
    const pct = (score / selectedExam.max_score) * 100;
    if (pct >= 80) return 'A';
    if (pct >= 65) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const marksToSave = Object.entries(marksData)
        .filter(([_, data]) => data.score !== '' || data.is_absent)
        .map(([student_id, data]) => ({
          student_id,
          score: data.is_absent ? 0 : data.score,
          is_absent: data.is_absent
        }));

      await api.post('/marks/bulk', {
        exam_id: selectedExam.id,
        marks: marksToSave
      });

      // Update status to saved
      const updatedMarks = { ...marksData };
      Object.keys(updatedMarks).forEach(sid => {
        if (updatedMarks[sid].score !== '' || updatedMarks[sid].is_absent) {
          updatedMarks[sid].status = 'Saved';
        }
      });
      setMarksData(updatedMarks);
      alert(`${marksToSave.length} marks saved successfully!`);
    } catch (err) {
      alert('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/exams', {
        ...newExam,
        class_id: selectedClass,
        subject_id: selectedSubject,
        term_id: selectedTerm
      });
      setExams([data, ...exams]);
      setSelectedExam(data);
      setShowNewExam(false);
    } catch (err) {
      alert('Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            Selection Class & Term
          </h2>
          <p className="text-slate-400 text-sm mt-1">Select the class and academic term for marks entry.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Class</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Choose Class...</option>
              {[...new Set(assignments.map(a => a.class_id))].map(cid => {
                const assignment = assignments.find(a => a.class_id === cid);
                return <option key={cid} value={cid}>{assignment.classes.name}</option>
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Academic Term</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <option value="">Choose Term...</option>
              {terms.map(t => (
                <option key={t.id} value={t.id}>Term {t.term_number} - {t.year} {t.is_current ? '(Current)' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={handleStep1Continue}
          disabled={!selectedClass || !selectedTerm}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          Continue to Subject Selection
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Subject & Assessment
            </h2>
            <p className="text-slate-400 text-sm mt-1">Select the specific subject and assessment type.</p>
          </div>
          <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Choose Subject...</option>
              {availableSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assessment</label>
              <button 
                onClick={() => setShowNewExam(!showNewExam)} 
                className="text-xs text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> {showNewExam ? 'Cancel' : 'Create New'}
              </button>
            </div>

            {showNewExam ? (
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Name (e.g. CA1)</label>
                    <input className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Type</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm" value={newExam.type} onChange={e => setNewExam({...newExam, type: e.target.value})}>
                      <option value="continuous_assessment">CA</option>
                      <option value="midterm">Midterm</option>
                      <option value="endterm">End-Term</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Max Score</label>
                    <input type="number" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm" value={newExam.max_score} onChange={e => setNewExam({...newExam, max_score: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleCreateExam} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2 rounded-lg transition-all">
                  Create Assessment
                </button>
              </div>
            ) : (
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                value={selectedExam?.id || ''}
                onChange={(e) => setSelectedExam(exams.find(ex => ex.id === e.target.value))}
              >
                <option value="">Choose Assessment...</option>
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name} - {new Date(ex.exam_date).toLocaleDateString()} (Max: {ex.max_score})</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <button 
          onClick={handleStep2Continue}
          disabled={!selectedSubject || !selectedExam}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Marks Table'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/20">
          <div className="flex items-center gap-6">
            <button onClick={() => setStep(2)} className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">{selectedExam.name}</h3>
                {selectedExam.is_locked ? (
                  <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
                    <Lock className="w-3 h-3" /> LOCKED
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                    <CheckCircle className="w-3 h-3" /> ACTIVE
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {assignments.find(a => a.class_id === selectedClass)?.classes.name}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {availableSubjects.find(s => s.id === selectedSubject)?.name}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Max: {selectedExam.max_score}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <div className="text-xs font-bold text-slate-500 uppercase">Progress</div>
              <div className="text-lg font-mono text-white">
                {Object.values(marksData).filter(m => m.score !== '' || m.is_absent).length} / {students.length}
              </div>
            </div>
            <button 
              onClick={handleSaveAll}
              disabled={saving || selectedExam.is_locked}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 transition-all"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save All Marks
            </button>
          </div>
        </div>
        
        {selectedExam.is_locked && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex items-center gap-3 text-amber-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">This assessment is locked. Marks cannot be edited. Contact the Head Teacher to unlock.</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-800">
              <tr>
                <th className="px-8 py-5">#</th>
                <th className="px-6 py-5">Student Information</th>
                <th className="px-6 py-5 text-center">Attended</th>
                <th className="px-6 py-5 w-40 text-center">Score</th>
                <th className="px-6 py-5 text-center">Grade</th>
                <th className="px-6 py-5 text-right pr-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {students.map((s, i) => {
                const data = marksData[s.id] || {};
                const isInvalid = data.score > selectedExam.max_score;
                
                return (
                  <tr key={s.id} className={`group hover:bg-slate-800/20 transition-all ${data.is_absent ? 'bg-slate-900/50 opacity-60' : ''}`}>
                    <td className="px-8 py-5 text-slate-600 font-mono text-xs">{i + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold group-hover:text-blue-400 transition-colors">{s.full_name}</div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">{s.student_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="checkbox"
                        disabled={selectedExam.is_locked}
                        checked={!data.is_absent}
                        onChange={(e) => handleAttendanceChange(s.id, !e.target.checked)}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/20 outline-none"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input 
                        type="number"
                        disabled={selectedExam.is_locked || data.is_absent}
                        value={data.score ?? ''}
                        onChange={(e) => handleScoreChange(s.id, e.target.value)}
                        className={`w-28 mx-auto block bg-slate-950 border ${isInvalid ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-slate-800'} rounded-xl px-4 py-3 text-center text-white font-mono text-lg focus:border-blue-500 outline-none transition-all`}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={calculateGrade(data.score)} />
                    </td>
                    <td className="px-6 py-5 text-right pr-8">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        data.status === 'Saved' ? 'text-green-500' : 
                        data.status === 'Edited' ? 'text-amber-500' : 'text-slate-600'
                      }`}>
                        {data.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 py-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-[0.3em] mb-2">
            <span className="w-8 h-[1px] bg-blue-500"></span>
            Academic Pipeline
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Marks Entry</h1>
          <p className="text-slate-400 mt-2 max-w-xl">Standardized assessment grading for Malawian primary education. Automated aggregation and ranking enabled.</p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 ${
                step === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-110' : 
                step > i ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                {step > i ? <CheckCircle className="w-5 h-5" /> : i}
              </div>
              {i < 3 && <div className={`w-8 h-[2px] rounded-full ${step > i ? 'bg-green-600' : 'bg-slate-800'}`}></div>}
            </div>
          ))}
        </div>
      </header>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default MarksEntry;
