import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  Layers,
  MapPin,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [bookingsRes, resourcesRes] = await Promise.all([
          api.get('/bookings/my?limit=5'),
          api.get('/resources?limit=4&activeOnly=true'),
        ]);

        if (bookingsRes.success) {
          setData(bookingsRes);
        }
        if (resourcesRes.success) {
          setAvailableResources(resourcesRes.data);
        }
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const counts = data?.counts || { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  const recentBookings = data?.data || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
            {user?.department}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your academic reservations, check live hall availability, and track institutional approvals.
          </p>
        </div>
        <Link
          to="/bookings/new"
          className="px-5 py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800 transition-colors shadow-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Reservation Request</span>
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Bookings</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{counts.total}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending Review</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{counts.pending}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Approved & Confirmed</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{counts.approved}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Declined / Cancelled</div>
            <div className="text-2xl font-bold text-slate-600 mt-1 tabular-nums">
              {counts.rejected + counts.cancelled}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Bookings Table + Available Venues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Bookings */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Booking Requests</h2>
            <Link
              to="/my-bookings"
              className="text-xs font-semibold text-indigo-900 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <EmptyState
              title="No bookings recorded"
              description="You haven't submitted any resource booking requests yet. Browse available facilities to submit your first request."
              actionLabel="Book a Resource"
              onAction={() => (window.location.href = '/resources')}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Ref & Event</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">Scheduled Slot</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentBookings.map((b: any) => (
                      <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{b.eventTitle}</div>
                          <div className="font-mono text-[10px] text-slate-400">{b.bookingRef}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{b.resource?.name || 'Resource'}</div>
                          <div className="text-[10px] text-slate-500">{b.resource?.location?.building}</div>
                        </td>
                        <td className="py-3 px-4 tabular-nums">
                          <div>{new Date(b.startDateTime).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {new Date(b.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/bookings/${b._id}`}
                            className="font-semibold text-indigo-900 hover:text-indigo-700"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Available Venues */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Explore Venues</h2>
            <Link
              to="/resources"
              className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
            >
              Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {availableResources.map((res: any) => (
              <div
                key={res._id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{res.name}</h4>
                  <span className="text-[10px] font-semibold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
                    {res.capacity} Seats
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{res.location?.building} · Rm {res.location?.roomNumber}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <Link
                    to={`/resources/${res._id}`}
                    className="font-medium text-slate-600 hover:text-slate-900 text-[11px]"
                  >
                    View Schedule
                  </Link>
                  <Link
                    to={`/bookings/new?resourceId=${res._id}`}
                    className="font-bold text-indigo-900 hover:text-indigo-700 text-[11px]"
                  >
                    Reserve Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
