import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Award, TrendingDown, 
  Search, Download, ExternalLink, Filter,
  AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';
import api from '../../services/api';
import { Link, useSearchParams } from 'react-router-dom';

const ClassResults = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const termId = searchParams.get('termId');

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({
    average: 0,
    passRate: 0,
    highest: { name: '-', score: 0 },
    lowest: { name: '-', score: 0 }
  });

  useEffect(() => {
    const fetchClassResults = async () => {
      if (!classId || !termId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/results/class/${classId}?termId=${termId}`);
        setResults(data);

        // Compute summary
        if (data.length > 0) {
          const totalPct = data.reduce((sum, r) => sum + Number(r.overall_percentage), 0);
          const avg = totalPct / data.length;
          const passing = data.filter(r => Number(r.overall_percentage) >= 40).length;
          const sorted = [...data].sort((a, b) => b.overall_aggregate - a.overall_aggregate);

          setSummary({
            average: avg,
            passRate: (passing / data.length) * 100,
            highest: { name: sorted[0].students.full_name, score: sorted[0].overall_aggregate },
            lowest: { name: sorted[data.length - 1].students.full_name, score: sorted[data.length - 1].overall_aggregate }
          });
        }
      } catch (err) {
        console.error('Failed to fetch class results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassResults();
  }, [classId, termId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-slate-400 font-medium">Aggregating class performance data...</p>
    </div>
  );

  return (
    <div className="space-y-10 py-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.3em] mb-2">
            <span className="w-8 h-[1px] bg-indigo-500"></span>
            Performance Analytics
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Class Results</h1>
          <p className="text-slate-400 mt-2 max-w-xl">Comprehensive overview of academic performance for the selected class and term.</p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-900/20 transition-all">
          <Download className="w-5 h-5" />
          Generate Class Report PDF
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Class Average</div>
              <div className="text-4xl font-black text-white mt-2">{summary.average.toFixed(1)}%</div>
            </div>
            <div className="bg-blue-600/20 p-3 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            <TrendingDown className="w-3 h-3" /> Targeted: 65%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pass Rate</div>
              <div className="text-4xl font-black text-emerald-500 mt-2">{summary.passRate.toFixed(1)}%</div>
            </div>
            <div className="bg-emerald-600/20 p-3 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {results.filter(r => r.overall_percentage >= 40).length} of {results.length} Students
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Highest Score</div>
              <div className="text-2xl font-black text-white mt-2">{summary.highest.score}</div>
              <div className="text-[10px] font-bold text-amber-500 uppercase mt-1 truncate max-w-[150px]">{summary.highest.name}</div>
            </div>
            <div className="bg-amber-600/20 p-3 rounded-2xl">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">At Risk</div>
              <div className="text-4xl font-black text-rose-500 mt-2">{results.filter(r => r.overall_percentage < 40).length}</div>
            </div>
            <div className="bg-rose-600/20 p-3 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <div className="mt-6 text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            Needs Intervention
          </div>
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Ranking Table</h2>
            <div className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {results.length} Students
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none w-64 transition-all"
                placeholder="Search students..."
              />
            </div>
            <button className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-800">
              <tr>
                <th className="px-8 py-6">Pos</th>
                <th className="px-6 py-6">Student Information</th>
                <th className="px-6 py-6 text-center">Aggregate</th>
                <th className="px-6 py-6 text-center">Possible</th>
                <th className="px-6 py-6 text-center">Percentage</th>
                <th className="px-6 py-6 text-center">Grade</th>
                <th className="px-6 py-6 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {results.map((r, i) => {
                const isFirst = r.class_position === 1;
                const isFailing = r.overall_percentage < 40;
                
                return (
                  <tr key={r.id} className={`group hover:bg-slate-800/30 transition-all ${isFirst ? 'bg-amber-500/5' : ''} ${isFailing ? 'bg-rose-500/5' : ''}`}>
                    <td className="px-8 py-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                        isFirst ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/40' : 
                        r.class_position <= 3 ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {r.class_position}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
                          {r.students.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold group-hover:text-blue-400 transition-colors">{r.students.full_name}</div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">{r.students.student_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center text-white font-black font-mono text-lg">{r.overall_aggregate}</td>
                    <td className="px-6 py-6 text-center text-slate-500 font-mono">{r.total_possible}</td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`font-black ${isFailing ? 'text-rose-500' : 'text-blue-400'}`}>{Number(r.overall_percentage).toFixed(1)}%</span>
                        <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${isFailing ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${r.overall_percentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-lg font-black text-xs text-white bg-slate-800 border border-slate-700`}>
                        {r.overall_grade}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right pr-10">
                      <Link 
                        to={`/students/${r.student_id}/result?termId=${termId}&classId=${classId}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-white bg-blue-500/10 hover:bg-blue-600 px-4 py-2 rounded-xl border border-blue-500/20 transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Full Result
                      </Link>
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
};

export default ClassResults;
