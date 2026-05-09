import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, Save, Send } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  class_id: z.string().min(1, 'Select a class'),
  subject_id: z.string().min(1, 'Select a subject'),
  week_number: z.number().min(1).max(15),
  academic_year: z.string().min(1),
  content: z.string().min(10, 'Content must be at least 10 characters')
});

const LessonPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      academic_year: '2025/2026',
      week_number: 1
    }
  });

  const selectedClass = watch('class_id');

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await api.get('/teacher-assignments');
      setAssignments(data);

      if (id) {
        const { data: plan } = await api.get(`/lesson-plans/${id}`);
        reset(plan);
      }
    };
    fetchData();
  }, [id, reset]);

  const availableSubjects = assignments
    .filter(a => a.class_id === selectedClass)
    .map(a => a.subjects);

  const onSubmit = async (data, isSubmit = false) => {
    setLoading(true);
    try {
      let planId = id;
      if (id) {
        await api.patch(`/lesson-plans/${id}`, data);
      } else {
        const { data: result } = await api.post('/lesson-plans', data);
        planId = result.id;
      }

      if (isSubmit) {
        await api.post(`/lesson-plans/${planId}/submit`);
      }

      alert(`Lesson plan ${isSubmit ? 'submitted' : 'saved'} successfully!`);
      navigate('/lesson-plans');
    } catch (error) {
      console.error('Save error:', error);
      const message = error.response?.data?.error?.message || 'Failed to save lesson plan';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/lesson-plans" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to List
      </Link>

      <header>
        <h1 className="text-3xl font-bold text-white">{id ? 'Edit' : 'Create'} Lesson Plan</h1>
        <p className="text-slate-400 mt-1">Detail your teaching strategy and content.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
            <input 
              {...register('title')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              placeholder="e.g., Introduction to Fractions"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Academic Year</label>
            <input 
              {...register('academic_year')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Class</label>
            <select 
              {...register('class_id')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            >
              <option value="">Select Class</option>
              {[...new Set(assignments.map(a => a.class_id))].map(cid => (
                <option key={cid} value={cid}>{assignments.find(a => a.class_id === cid).classes.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
            <select 
              {...register('subject_id')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            >
              <option value="">Select Subject</option>
              {availableSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Week Number</label>
            <input 
              type="number"
              {...register('week_number', { valueAsNumber: true })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Lesson Content</label>
          <textarea 
            {...register('content')}
            rows={12}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none resize-none"
            placeholder="Outline your lesson objectives, activities, and resources..."
          />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-800">
          <button 
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save as Draft
          </button>
          <button 
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Save & Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanForm;
