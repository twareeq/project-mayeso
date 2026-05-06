import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Calendar, BookOpen, 
  TrendingUp, Clock, FileText, Download, Loader2 
} from 'lucide-react';
import api from '../../services/api';
import PDFDownloadButton from '../../components/shared/PDFDownloadButton';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('performance');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [studentRes, perfRes, attRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/analytics/student/${id}`),
          api.get(`/attendance?student_id=${id}`)
        ]);
        setStudent(studentRes.data);
        setPerformance(perfRes.data);
        setAttendance(attRes.data);
      } catch (err) {
        console.error('Failed to fetch student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!student) return <div className="p-20 text-center text-slate-500">Student not found.</div>;

  return (
    <div className="space-y-8">
      <Link to="/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">{student.full_name}</h2>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-widest mt-1">{student.student_number}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Class</span>
                <span className="text-white font-medium">{student.classes?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Gender</span>
                <span className="text-white font-medium capitalize">{student.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">DOB</span>
                <span className="text-white font-medium">{new Date(student.date_of_birth).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">School</span>
                <span className="text-white font-medium">{student.classes?.sections?.schools?.name}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Parent / Guardian
            </h3>
            {student.parent_id ? (
              <div className="space-y-2">
                <p className="text-white font-medium">{student.parent_name || 'N/A'}</p>
                <p className="text-slate-500 text-sm">{student.parent_email || 'No contact provided'}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-4">No parent account linked.</p>
                <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors">
                  Link Parent Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex border-b border-slate-800 bg-slate-800/20">
              {['performance', 'attendance', 'result-sheet'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                      Academic History
                    </h3>
                  </div>
                  <table className="w-full text-left">
                    <thead className="text-slate-500 text-xs uppercase tracking-widest border-b border-slate-800">
                      <tr>
                        <th className="pb-4">Assessment</th>
                        <th className="pb-4">Subject</th>
                        <th className="pb-4">Score</th>
                        <th className="pb-4">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {performance.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 text-white font-medium">{p.exam}</td>
                          <td className="py-4 text-slate-400">{p.subject}</td>
                          <td className="py-4 font-bold text-blue-500">{p.score}%</td>
                          <td className="py-4 font-bold text-emerald-500">{p.grade}</td>
                        </tr>
                      ))}
                      {performance.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-slate-600 italic">No marks recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-6 h-6 text-amber-500" />
                    Attendance Record
                  </h3>
                  <table className="w-full text-left">
                    <thead className="text-slate-500 text-xs uppercase tracking-widest border-b border-slate-800">
                      <tr>
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {attendance.map((a, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 text-white font-medium">{new Date(a.date).toLocaleDateString()}</td>
                          <td className="py-4 capitalize">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              a.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'result-sheet' && (
                <div className="space-y-12 text-center py-12">
                  <div className="inline-flex items-center justify-center p-8 bg-blue-600/10 rounded-full mb-4">
                    <FileText className="w-16 h-16 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Aggregate Result Summary</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Generate and download the official student result sheet including class positions and grading.
                    </p>
                  </div>
                  <PDFDownloadButton 
                    endpoint={`/reports/student/${id}`}
                    filename={`${student.student_number}_result.pdf`}
                    label="Download Result Sheet (PDF)"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
