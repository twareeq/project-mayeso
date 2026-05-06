import React from 'react';
import { HardHat } from 'lucide-react';

const ComingSoon = ({ moduleName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
      <div className="w-16 h-16 bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
        <HardHat className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-100">{moduleName}</h2>
      <p className="text-slate-400 max-w-md">
        This module is currently under construction and is scheduled for a future development phase.
      </p>
    </div>
  );
};

export default ComingSoon;
