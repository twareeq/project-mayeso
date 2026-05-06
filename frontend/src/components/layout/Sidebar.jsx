import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardList, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  School,
  Map,
  Building,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { role, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['all'] },
    { label: 'Students', icon: Users, path: '/students', roles: ['teacher', 'section_head', 'head_teacher', 'admin'] },
    { label: 'Marks', icon: ClipboardList, path: '/marks', roles: ['teacher', 'admin'] },
    { label: 'Attendance', icon: GraduationCap, path: '/attendance', roles: ['teacher', 'admin'] },
    { label: 'Lesson Plans', icon: BookOpen, path: '/lesson-plans', roles: ['teacher', 'section_head', 'head_teacher', 'admin'] },
    { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['teacher', 'section_head', 'head_teacher', 'zone_manager', 'district_officer', 'admin'] },
    { label: 'Schools', icon: School, path: '/schools', roles: ['zone_manager', 'district_officer', 'admin'] },
    { label: 'Zones', icon: Map, path: '/zones', roles: ['district_officer', 'admin'] },
    { label: 'Users', icon: Settings, path: '/users', roles: ['admin'] },
    { label: 'School Setup', icon: Building, path: '/setup', roles: ['head_teacher', 'admin'] },
    { label: 'System Config', icon: Sliders, path: '/config', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(role)
  );

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">M</div>
        <h1 className="text-xl font-bold text-white">Mayeso</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
