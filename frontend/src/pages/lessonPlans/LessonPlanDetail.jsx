import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, BookOpen, User, 
  CheckCircle, XCircle, Clock, Loader2, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';

const LessonPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await api.get(`/lesson-plans/${id}`);
        setPlan(data);
      } catch (err) {
        console.error('Failed to fetch lesson plan:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleReview = async (status, notes = '') => {
    setReviewing(true);
    try {
      await api.post(`/lesson-plans/${id}/review`, { status, review_notes: notes });
      setPlan({ ...plan, status, review_notes: notes });
      alert(`Plan ${status} successfully!`);
    } catch (err) {
      alert('Failed to review lesson plan');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!plan) return <div className="p-20 text-center text-slate-500">Lesson plan not found.</div>;

  const isReviewer = ['section_head', 'head_teacher', 'admin'].includes(user.role);
  const canReview = isReviewer && plan.status === 'submitted';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/lesson-plans" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to List
      </Link>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{plan.title}</h1>
            <p className="text-slate-400">Week {plan.week_number} • {plan.subjects?.name} • {plan.classes?.name}</p>
          </div>
        </div>
        <StatusBadge status={plan.status} className="text-sm px-4 py-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl min-h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-slate-500">Lesson Content</h3>
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
              {plan.content}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Metadata</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">Teacher</p>
                  <p className="text-sm text-white font-medium">{plan.profiles?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs text-slate-500">Academic Year</p>
                  <p className="text-sm text-white font-medium">{plan.academic_year}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm text-white font-medium">{new Date(plan.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {plan.status === 'rejected' && (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs">
                <AlertCircle className="w-4 h-4" />
                Rejection Notes
              </div>
              <p className="text-sm text-red-200">{plan.review_notes}</p>
            </div>
          )}

          {canReview && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Review Action</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleReview('rejected', prompt('Enter rejection reason:'))}
                  disabled={reviewing}
                  className="flex-1 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl font-bold transition-all border border-red-500/20"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleReview('reviewed')}
                  disabled={reviewing}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  Approve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanDetail;
