import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-base font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1">
        The academic resource, dossier, or page you were looking for does not exist or has been moved.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link
          to="/"
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 rounded-xl hover:bg-indigo-800 transition-colors flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          <span>Portal Home</span>
        </Link>
      </div>
    </div>
  );
};
