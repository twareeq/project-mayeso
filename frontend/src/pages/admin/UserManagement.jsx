import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Shield, 
  Building,
  Loader2,
  Trash2
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'teacher',
    school_id: '',
    zone_id: '',
    district_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Reference data
  const [schools, setSchools] = useState([]);

  const fetchData = async () => {
    try {
      const [usersRes, schoolsRes] = await Promise.all([
        api.get('/users'),
        api.get('/schools')
      ]);
      setUsers(usersRes.data);
      setSchools(schoolsRes.data);
    } catch (err) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users', newUser);
      setShowAddModal(false);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'teacher',
        school_id: '',
        zone_id: '',
        district_id: ''
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage platform users, roles, and access permissions.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          <UserPlus className="w-5 h-5" />
          Add New User
        </button>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <Shield className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Full Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white uppercase">
                        {user.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-100">{user.full_name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-mono uppercase">
                      {user.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {user.school_id ? schools.find(s => s.id === user.school_id)?.name : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <input 
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white"
                    value={newUser.full_name}
                    onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <input 
                    required
                    type="email"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                  <input 
                    required
                    type="password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="admin">System Admin</option>
                    <option value="district_officer">District Officer</option>
                    <option value="zone_manager">Zone Manager</option>
                    <option value="head_teacher">Head Teacher</option>
                    <option value="section_head">Section Head</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Assign to School</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white"
                    value={newUser.school_id}
                    onChange={e => setNewUser({...newUser, school_id: e.target.value})}
                  >
                    <option value="">None / Not Applicable</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
