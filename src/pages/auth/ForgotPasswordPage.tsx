import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        success('Password reset instructions generated.');
        if (res.resetCode) {
          setResetCode(res.resetCode);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to request reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your registered institutional email to receive a password reset token.
          </p>
        </div>

        {resetCode ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span>Verification Reset Code</span>
              </div>
              <p className="text-xs text-emerald-800">
                In local evaluation mode, use this code on the reset page:
              </p>
              <div className="p-2.5 bg-white border border-emerald-300 rounded-lg font-mono text-xs text-slate-900 select-all break-all font-bold">
                {resetCode}
              </div>
            </div>

            <button
              onClick={() => navigate(`/reset-password?token=${resetCode}`)}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Enter New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@academic.edu"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : 'Send Reset Instructions'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
