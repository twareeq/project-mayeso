import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmLabel = "Confirm", 
  confirmColor = "blue" 
}) => {
  if (!isOpen) return null;

  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
    red: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
    amber: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${confirmColor === 'red' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-400">{message}</p>
        </div>

        <div className="p-6 bg-slate-800/20 flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-white rounded-2xl font-bold transition-all shadow-lg ${colors[confirmColor] || colors.blue}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
