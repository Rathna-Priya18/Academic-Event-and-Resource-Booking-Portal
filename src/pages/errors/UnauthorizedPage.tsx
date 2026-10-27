import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">403</h1>
      <h2 className="text-base font-bold text-slate-800 mt-2">Access Restricted</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1">
        You do not have the required role privileges (e.g. Dean or Administrator) to access this administrative control panel.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link
          to="/dashboard"
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 rounded-xl hover:bg-indigo-800 transition-colors flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
