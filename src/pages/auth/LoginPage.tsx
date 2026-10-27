import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  Building,
  Phone,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'login' or 'register'
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'student' | 'admin' | null>(null);

  // Registration form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science & Engineering',
    role: 'student',
    designation: '',
    phone: '',
  });
  const [loadingReg, setLoadingReg] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Biotechnology & Life Sciences',
    'Mechanical Engineering',
    'Physics & Applied Sciences',
    'Business Administration & Management',
    'Civil & Infrastructure Engineering',
  ];

  // 1-Click Fast Demo Login for Student or Admin
  const handleFastDemoLogin = async (role: 'student' | 'admin') => {
    try {
      setDemoLoading(role);
      if (role === 'student') {
        await login('student.alex@academic.edu', 'Student@123');
        success('Signed in as Demo Student (Alex Rivera)');
        navigate('/dashboard');
      } else {
        await login('admin@academic.edu', 'Admin@123');
        success('Signed in as Demo Administrator (Dr. Arthur Vance)');
        navigate('/admin');
      }
    } catch (err: any) {
      error(err.message || `Failed to sign in as demo ${role}.`);
    } finally {
      setDemoLoading(null);
    }
  };

  // Standard Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      error('Please enter both institutional email and password.');
      return;
    }

    try {
      setLoadingLogin(true);
      await login(loginEmail, loginPassword);
      success('Welcome back! Signed in successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoadingLogin(false);
    }
  };

  // New Account Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regData.password !== regData.confirmPassword) {
      error('Passwords do not match. Please re-enter.');
      return;
    }

    if (regData.password.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoadingReg(true);
      await register({
        name: regData.name,
        email: regData.email,
        password: regData.password,
        department: regData.department,
        role: regData.role,
        designation: regData.designation,
        phone: regData.phone,
      });
      success('Account created successfully! Welcome to Easwari Engineering College Portal.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
    } finally {
      setLoadingReg(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Institutional Branding Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-black text-xs tracking-widest shadow-xs">
            EEC
          </div>
          <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Easwari Engineering College
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Academic Event & Resource Booking Portal
          </p>
        </div>

        {/* Mode Tabs: Sign In vs Create New Account */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {mode === 'login' ? (
          <div className="space-y-6">
            {/* Demo Role Fast Sign-In Box */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                  <span>1-Click Demo Sign In</span>
                </div>
                <span className="text-[11px] text-indigo-700 font-medium">
                  Instant Access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Student Demo Button */}
                <button
                  type="button"
                  onClick={() => handleFastDemoLogin('student')}
                  disabled={demoLoading !== null}
                  className="flex flex-col text-left p-3 rounded-lg bg-white border border-indigo-200/80 hover:border-indigo-400 hover:shadow-xs transition-all disabled:opacity-60 group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-indigo-900">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      Demo Student
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Student
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 truncate">
                    Alex Rivera · CS Scholar
                  </span>
                  <div className="mt-2 text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                    {demoLoading === 'student' ? 'Signing In...' : 'Sign in as Student →'}
                  </div>
                </button>

                {/* Admin Demo Button */}
                <button
                  type="button"
                  onClick={() => handleFastDemoLogin('admin')}
                  disabled={demoLoading !== null}
                  className="flex flex-col text-left p-3 rounded-lg bg-white border border-indigo-200/80 hover:border-indigo-400 hover:shadow-xs transition-all disabled:opacity-60 group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-indigo-900">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" />
                      Demo Admin
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      Dean / Admin
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 truncate">
                    Dr. Arthur Vance · Dean
                  </span>
                  <div className="mt-2 text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                    {demoLoading === 'admin' ? 'Signing In...' : 'Sign in as Admin →'}
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or sign in with email
              </span>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student.alex@academic.edu or admin@academic.edu"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingLogin}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loadingLogin ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don’t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-semibold text-indigo-900 hover:text-indigo-700 cursor-pointer"
                >
                  Create new account
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* New Account Creation Form */
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Register for booking seminar halls, laboratories, auditoriums, and smart rooms at Easwari Engineering College.
              </span>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="e.g. John Doe / Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="user@eec.edu or user@academic.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={regData.role}
                    onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 font-medium"
                  >
                    <option value="student">Student Scholar</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="staff">Campus Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={regData.department}
                    onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 font-medium"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingReg}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{loadingReg ? 'Creating Account...' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-indigo-900 hover:text-indigo-700 cursor-pointer"
                >
                  Sign In to existing account
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
