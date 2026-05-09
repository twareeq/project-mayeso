import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  FileText, Download, Printer, ChevronLeft, 
  User, Award, TrendingUp, Calendar, MapPin,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import api from '../../services/api';
import PDFDownloadButton from '../../components/shared/PDFDownloadButton';

const StudentResult = () => {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const termId = searchParams.get('termId');
  const classId = searchParams.get('classId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [savingRemarks, setSavingRemarks] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!termId || !classId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/results/student/${studentId}?termId=${termId}&classId=${classId}`);
        setData(data);
        setRemarks(data.result?.teacher_remarks || '');
      } catch (err) {
        console.error('Failed to fetch student result:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [studentId, termId, classId]);

  const handleSaveRemarks = async () => {
    setSavingRemarks(true);
    try {
      await api.patch(`/results/${data.result.id}/remarks`, { teacher_remarks: remarks });
      alert('Remarks saved successfully!');
    } catch (err) {
      alert('Failed to save remarks');
    } finally {
      setSavingRemarks(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-slate-400 font-medium">Computing academic aggregates...</p>
    </div>
  );

  if (!data || !data.result) return (
    <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-4">
      <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
      <h2 className="text-2xl font-bold text-white">No Results Found</h2>
      <p className="text-slate-400">We couldn't find any grading data for this student in the selected term.</p>
    </div>
  );

  const { student, result, aggregates, exams, marks } = data;

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"],
          v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'from-green-500 to-emerald-600 shadow-green-900/20',
      'B': 'from-blue-500 to-indigo-600 shadow-blue-900/20',
      'C': 'from-yellow-500 to-amber-600 shadow-amber-900/20',
      'D': 'from-orange-500 to-red-500 shadow-red-900/20',
      'F': 'from-red-600 to-rose-700 shadow-rose-900/20'
    };
    return colors[grade] || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 group-hover:bg-slate-800">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">Back to Results</span>
        </button>

        <div className="flex items-center gap-4">
          <PDFDownloadButton 
            endpoint="/reports/student" 
            payload={{ student_id: studentId, class_id: classId, term_id: termId }}
            filename={`${student.full_name}_Result.pdf`}
          />
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-700">
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </header>

      {/* IDENTITY CARD */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -ml-20 -mb-20"></div>
        
        <div className="relative p-10 flex flex-col lg:flex-row gap-12">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center lg:items-start gap-6 lg:border-r lg:border-slate-800 lg:pr-12">
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-blue-900/40 border-4 border-slate-900">
              {student.full_name.charAt(0)}
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{student.full_name}</h1>
              <p className="text-blue-400 font-mono text-sm font-bold mt-1 uppercase tracking-widest">{student.student_number}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 w-full">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-slate-600" />
                {student.schools.name}
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Award className="w-4 h-4 text-slate-600" />
                {student.classes.name}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aggregate</div>
              <div>
                <div className="text-3xl font-black text-white mt-1">{result.overall_aggregate}</div>
                <div className="text-xs text-slate-500 mt-1">/ {result.total_possible} Total</div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Percentage</div>
              <div>
                <div className="text-3xl font-black text-blue-500 mt-1">{Number(result.overall_percentage).toFixed(1)}%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${result.overall_percentage}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50 flex flex-col justify-between items-center text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Position</div>
              <div className="text-3xl font-black text-indigo-400 mt-1">{getOrdinal(result.class_position)}</div>
              <div className="text-[10px] font-bold text-slate-600 uppercase mt-1">In Class</div>
            </div>

            <div className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${getGradeColor(result.overall_grade)} opacity-20 blur-xl group-hover:opacity-30 transition-opacity`}></div>
              <div className={`relative h-full bg-gradient-to-br ${getGradeColor(result.overall_grade)} p-6 rounded-3xl shadow-xl flex flex-col justify-between items-center text-white border border-white/10`}>
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Overall Grade</div>
                <div className="text-5xl font-black">{result.overall_grade}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em]">{result.overall_grade === 'A' ? 'Distinction' : result.overall_grade === 'B' ? 'Merit' : result.overall_grade === 'C' ? 'Credit' : result.overall_grade === 'D' ? 'Pass' : 'Fail'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUBJECT BREAKDOWN */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Subject Breakdown
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Calendar className="w-4 h-4" />
            Term {searchParams.get('termNumber') || '1'} Results
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Subject</th>
                {/* Dynamic Columns for CAs */}
                {[1, 2, 3, 4].map(n => (
                  <th key={n} className="px-4 py-6 text-center">CA{n}</th>
                ))}
                <th className="px-6 py-6 text-center">Midterm</th>
                <th className="px-6 py-6 text-center">End-Term</th>
                <th className="px-6 py-6 text-center">Total</th>
                <th className="px-6 py-6 text-center">Max</th>
                <th className="px-6 py-6 text-center">%</th>
                <th className="px-6 py-6 text-right pr-10">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {aggregates.map((agg) => {
                const subjectExams = exams.filter(e => e.subject_id === agg.subject_id);
                const getMark = (type, seq) => {
                  const exam = subjectExams.find(e => e.exam_type === type && (seq === undefined || e.sequence_no === seq));
                  if (!exam) return '—';
                  const mark = marks.find(m => m.exam_id === exam.id);
                  return mark ? mark.score : '—';
                };

                return (
                  <tr key={agg.id} className="hover:bg-slate-800/20 transition-all group">
                    <td className="px-8 py-5">
                      <div className="text-white font-bold group-hover:text-blue-400 transition-colors">{agg.subjects.name}</div>
                      <div className="text-[10px] font-mono text-slate-600 uppercase mt-0.5">{agg.subjects.code}</div>
                    </td>
                    {[1, 2, 3, 4].map(n => (
                      <td key={n} className="px-4 py-5 text-center text-slate-400 font-mono">{getMark('continuous_assessment', n)}</td>
                    ))}
                    <td className="px-6 py-5 text-center text-slate-300 font-mono font-bold">{getMark('midterm')}</td>
                    <td className="px-6 py-5 text-center text-slate-300 font-mono font-bold">{getMark('endterm')}</td>
                    <td className="px-6 py-5 text-center text-white font-black font-mono">{agg.total_score}</td>
                    <td className="px-6 py-5 text-center text-slate-500 font-mono">{agg.total_possible}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-blue-400 font-bold">{Number(agg.percentage).toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-5 text-right pr-10">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs text-white bg-gradient-to-br ${getGradeColor(agg.grade)}`}>
                        {agg.grade}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-800/20">
              <tr className="font-black">
                <td className="px-8 py-6 text-slate-500 uppercase text-xs tracking-widest">Overall Totals</td>
                <td colSpan={6}></td>
                <td className="px-6 py-6 text-center text-white text-xl">{result.overall_aggregate}</td>
                <td className="px-6 py-6 text-center text-slate-500 text-lg">{result.total_possible}</td>
                <td className="px-6 py-6 text-center text-blue-500 text-xl">{Number(result.overall_percentage).toFixed(1)}%</td>
                <td className="px-6 py-6 text-right pr-10">
                   <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg text-white bg-gradient-to-br ${getGradeColor(result.overall_grade)} shadow-lg`}>
                    {result.overall_grade}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* REMARKS & ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Teacher Remarks
          </h3>
          <textarea 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white text-sm focus:border-blue-500 outline-none transition-all resize-none h-32"
            placeholder="Enter academic and behavioral observations for the term..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <div className="flex justify-end">
            <button 
              onClick={handleSaveRemarks}
              disabled={savingRemarks}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-8 py-3 rounded-2xl font-bold transition-all"
            >
              {savingRemarks ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Remarks
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-blue-500/20 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/40">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Generate Official Report</h3>
          <p className="text-slate-400 text-sm">Download the high-fidelity PDF result sheet for printing or digital distribution.</p>
          <PDFDownloadButton 
            className="w-full mt-2"
            endpoint="/reports/student" 
            payload={{ student_id: studentId, class_id: classId, term_id: termId }}
            filename={`${student.full_name}_Official_Report.pdf`}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
