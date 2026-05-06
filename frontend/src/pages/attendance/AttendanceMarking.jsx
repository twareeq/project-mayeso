import React, { useState, useEffect } from 'react';
import { 
  Calendar, Check, X, Info, Save, Loader2, 
  ChevronDown, CheckCircle2, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AttendanceMarking = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { student_id: status }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data } = await api.get('/teacher-assignments');
      setAssignments(data);
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      const fetchAttendanceData = async () => {
        setLoading(true);
        try {
          const [studentRes, attRes] = await Promise.all([
            api.get(`/students?class_id=${selectedClass}`),
            api.get(`/attendance?class_id=${selectedClass}&date=${selectedDate}`)
          ]);
          setStudents(studentRes.data);
          
          const attMap = {};
          // Initialize with present by default if no data exists
          studentRes.data.forEach(s => {
            attMap[s.id] = 'present';
          });
          // Override with existing data
          attRes.data.forEach(a => {
            attMap[a.student_id] = a.status;
          });
          setAttendance(attMap);
        } finally {
          setLoading(false);
        }
      };
      fetchAttendanceData();
    }
  }, [selectedClass, selectedDate]);

  const handleStatusToggle = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const bulkData = Object.entries(attendance).map(([student_id, status]) => ({
        student_id,
        status
      }));

      await api.post('/attendance/bulk', {
        class_id: selectedClass,
        date: selectedDate,
        attendance: bulkData
      });
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const newAtt = { ...attendance };
    students.forEach(s => {
      newAtt[s.id] = 'present';
    });
    setAttendance(newAtt);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Daily Attendance</h1>
          <p className="text-slate-400 mt-1">Track student presence and participation.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || !selectedClass}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Attendance
        </button>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Class</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class...</option>
            {[...new Set(assignments.map(a => a.class_id))].map(cid => (
              <option key={cid} value={cid}>{assignments.find(a => a.class_id === cid).classes.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Date</label>
          <input 
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <button 
          onClick={markAllPresent}
          disabled={!selectedClass}
          className="px-6 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark All Present
        </button>
      </div>

      {/* Attendance Table */}
      {selectedClass && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-800/30 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-8 py-4">Student</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                        {s.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{s.full_name}</p>
                        <p className="text-slate-500 text-xs font-mono">{s.student_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleStatusToggle(s.id, 'present')}
                        className={`p-2 rounded-lg border transition-all ${
                          attendance[s.id] === 'present' 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusToggle(s.id, 'absent')}
                        className={`p-2 rounded-lg border transition-all ${
                          attendance[s.id] === 'absent' 
                            ? 'bg-red-500/20 border-red-500 text-red-500' 
                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusToggle(s.id, 'excused')}
                        className={`p-2 rounded-lg border transition-all ${
                          attendance[s.id] === 'excused' 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-400 w-full focus:border-blue-500 outline-none"
                      placeholder="Optional notes..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;
