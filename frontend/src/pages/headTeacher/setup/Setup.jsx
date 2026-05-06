import React, { useState } from 'react';
import SectionsTab from './SectionsTab';
import ClassesTab from './ClassesTab';
import SubjectsTab from './SubjectsTab';
import TeachersTab from './TeachersTab';
import { Layers, Users, BookOpen, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';

const SchoolSetup = () => {
  const [activeTab, setActiveTab] = useState('sections');

  const tabs = [
    { id: 'sections', label: 'Sections', icon: Layers },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'teachers', label: 'Teacher Assignments', icon: GraduationCap },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">School Hierarchy Setup</h1>
        <p className="text-slate-400 mt-1">Configure your school's structure before the academic term begins.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-b-2 border-blue-500 text-blue-400 bg-slate-800/50" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'sections' && <SectionsTab />}
          {activeTab === 'classes' && <ClassesTab />}
          {activeTab === 'subjects' && <SubjectsTab />}
          {activeTab === 'teachers' && <TeachersTab />}
        </div>
      </div>
    </div>
  );
};

export default SchoolSetup;
