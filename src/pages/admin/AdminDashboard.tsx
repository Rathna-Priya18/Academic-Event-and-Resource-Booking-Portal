import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  Layers,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminDashboard() {
      try {
        setLoading(true);
        const [overviewRes, analyticsRes, pendingRes] = await Promise.all([
          api.get('/reports/overview'),
          api.get('/reports/analytics'),
          api.get('/bookings?status=pending&limit=4'),
        ]);

        if (overviewRes.success) setMetrics(overviewRes.metrics);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
        if (pendingRes.success) setPendingBookings(pendingRes.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
        <div className="h-80 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  const m = metrics || {};
  const a = analytics || {};

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Institutional Administration Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
            Dean & Facility Oversight Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Real-time database analytics, reservation workflow approvals, and institutional hall capacity governance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/approvals"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-xs flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Approvals ({m.pendingBookings || 0})</span>
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors border border-white/20"
          >
            Export CSV Reports
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Registered Users</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{m.totalUsers || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Faculty, Scholars, Staff</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Campus Resources</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{m.totalResources || 0}</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{m.activeResources || 0} Active Online</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending Approvals</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{m.pendingBookings || 0}</div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">Awaiting Dean review</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Bookings Executed</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{m.totalBookings || 0}</div>
            <div className="text-[10px] text-indigo-900 font-medium mt-0.5">{m.approvalRate || 0}% Approval Ratio</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pending Approvals Quick Strip */}
      {pendingBookings.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Action Required: Pending Reservation Requests
              </h3>
            </div>
            <Link
              to="/admin/approvals"
              className="text-xs font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1"
            >
              <span>Go to Approval Workflow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {pendingBookings.map((b) => (
              <div
                key={b._id}
                className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] font-bold text-slate-500">{b.bookingRef}</span>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                    Pending
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{b.eventTitle}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {b.resource?.name} · {b.department}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="tabular-nums font-medium text-slate-700">
                    {new Date(b.startDateTime).toLocaleDateString()}
                  </span>
                  <Link
                    to="/admin/approvals"
                    className="font-bold text-indigo-900 hover:text-indigo-700"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section: Utilization by Department + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Department Bookings Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Venue Utilization by Department</h3>
              <p className="text-xs text-slate-500">Distribution of requests and approved slots across colleges</p>
            </div>
            <span className="text-xs font-semibold text-indigo-900 bg-indigo-50 px-2 py-1 rounded">
              Aggregated from MongoDB
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.bookingsByDept || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="totalBookings" fill="#1e1b4b" radius={[4, 4, 0, 0]} name="Total Requests" />
                <Bar dataKey="approvedBookings" fill="#16a34a" radius={[4, 4, 0, 0]} name="Approved Slots" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Reservation Status Breakdown</h3>
            <p className="text-xs text-slate-500">Current lifecycle states of all bookings</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={m.statusDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(m.statusDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {(m.statusDistribution || []).map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}:</span>
                <span className="font-bold text-slate-900 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Booking Hours Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Peak Campus Venue Booking Hours</h3>
            <p className="text-xs text-slate-500">Hourly reservation load from 08:00 to 20:00 across all academic buildings</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <TrendingUp className="w-4 h-4 text-indigo-900" />
            <span>Optimal Changeover Window: 12:30 - 13:30</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={a.peakHours || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#4338ca"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4338ca' }}
                activeDot={{ r: 6 }}
                name="Active Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
