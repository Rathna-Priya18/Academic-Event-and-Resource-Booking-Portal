import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  BarChart3,
  Calendar,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const AdminReportsPage: React.FC = () => {
  const { success, error } = useToast();
  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Export filters
  const [exportStatus, setExportStatus] = useState('all');

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [mRes, aRes] = await Promise.all([
          api.get('/reports/overview'),
          api.get('/reports/analytics'),
        ]);

        if (mRes.success) setMetrics(mRes.metrics);
        if (aRes.success) setAnalytics(aRes.data);
      } catch (err: any) {
        error(err.message || 'Failed to load report analytics');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const url = `/reports/export${exportStatus !== 'all' ? `?status=${exportStatus}` : ''}`;
      const blob = await api.get(url);

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute(
        'download',
        `academic_facility_bookings_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      success('CSV report generated and downloaded successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to export CSV report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  const m = metrics || {};
  const a = analytics || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Campus resource utilization metrics, department demand distributions, and raw CSV export.
          </p>
        </div>

        {/* CSV Export Button Strip */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={exportStatus}
            onChange={(e) => setExportStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="all">Export All Bookings</option>
            <option value="approved">Approved Slots Only</option>
            <option value="pending">Pending Requests Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800 transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating CSV...' : 'Download CSV Export'}</span>
          </button>
        </div>
      </div>

      {/* High-Level Analytical Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Total Reservations</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{m.totalBookings || 0}</div>
          <div className="text-[10px] text-slate-400">All recorded submissions</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Approval Efficiency</div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">{m.approvalRate || 0}%</div>
          <div className="text-[10px] text-slate-400">Approved vs Declined ratio</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Campus Venues Available</div>
          <div className="text-2xl font-bold text-indigo-900 tabular-nums">{m.activeResources || 0}</div>
          <div className="text-[10px] text-slate-400">Out of {m.totalResources || 0} registered facilities</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Scheduled Campus Events</div>
          <div className="text-2xl font-bold text-purple-700 tabular-nums">{m.totalEvents || 0}</div>
          <div className="text-[10px] text-slate-400">Institutional symposia</div>
        </div>
      </div>

      {/* Most Frequently Booked Resources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Most Frequently Utilized Academic Facilities</h3>
            <p className="text-xs text-slate-500">Ranking by total approved reservation hours</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            Audited Utilization
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Rank & Venue Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Campus Location</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4 text-right">Approved Reservations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(a.topResources || []).map((res: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-900 flex items-center justify-center text-[10px] font-black shrink-0">
                      {idx + 1}
                    </span>
                    <span>{res.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium uppercase text-[10px] text-indigo-900">
                    {res.category?.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {res.building}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums font-semibold text-slate-900">
                    {res.capacity} Seats
                  </td>
                  <td className="py-3.5 px-4 text-right tabular-nums font-bold text-emerald-700">
                    {res.bookingsCount} approved
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">Monthly Reservation Volume Progression</h3>
          <p className="text-xs text-slate-500">Historical trend of requests and confirmations</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={a.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="total" fill="#1e1b4b" radius={[4, 4, 0, 0]} name="Total Bookings" />
              <Bar dataKey="approved" fill="#16a34a" radius={[4, 4, 0, 0]} name="Approved Slots" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
