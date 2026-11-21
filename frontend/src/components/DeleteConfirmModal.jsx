import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, employee }) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900">Delete Employee Record?</h3>
        <p className="text-xs text-slate-500 mt-2">
          Are you sure you want to delete <span className="font-semibold text-slate-800">{employee.full_name}</span>? This action removes their active payroll allocation and cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(employee.id)}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
