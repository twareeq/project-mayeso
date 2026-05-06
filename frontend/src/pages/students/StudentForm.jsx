import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  full_name: z.string().min(3, 'Name must be at least 3 characters'),
  date_of_birth: z.string().refine((date) => new Date(date) < new Date(), 'Date must be in the past'),
  gender: z.enum(['male', 'female']),
  class_id: z.string().min(1, 'Please select a class')
});

const StudentForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [fetchingClasses, setFetchingClasses] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get('/classes');
        setClasses(data);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      } finally {
        setFetchingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      // Find selected class to get its school_id
      const selectedClass = classes.find(c => c.id === formData.class_id);
      const school_id = selectedClass?.sections?.school_id || user.school_id;

      if (!school_id) {
        throw new Error('Could not determine school ID. Please ensure the class is correctly configured.');
      }

      const { data: result } = await api.post('/students', {
        ...formData,
        school_id
      });
      setSuccessData(result);
    } catch (error) {
      alert(error.response?.data?.error?.message || 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-2xl">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 text-emerald-500 rounded-full mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Student Registered!</h2>
        <p className="text-slate-400 mb-8">
          The student has been successfully enrolled in the system.
        </p>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-8 inline-block w-full">
          <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">Student Number</p>
          <p className="text-2xl font-mono text-blue-500 font-bold">{successData.student_number}</p>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={() => setSuccessData(null)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors">
            Register Another
          </button>
          <Link to="/students" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-bold">
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link to="/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </Link>

      <header>
        <h1 className="text-3xl font-bold text-white">Register Student</h1>
        <p className="text-slate-400 mt-1">Enroll a new student in the platform hierarchy.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <input 
              {...register('full_name')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter student's full name"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
              <input 
                type="date"
                {...register('date_of_birth')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
              />
              {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Gender</label>
              <select 
                {...register('gender')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Class Assignment</label>
            <select 
              {...register('class_id')}
              disabled={fetchingClasses}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors disabled:opacity-50"
            >
              <option value="">{fetchingClasses ? 'Loading classes...' : 'Select Class'}</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.sections?.name || 'No Section'})</option>
              ))}
            </select>
            {errors.class_id && <p className="text-red-500 text-xs mt-1">{errors.class_id.message}</p>}
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
};

export default StudentForm;
