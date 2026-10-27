import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { IBooking } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  Filter,
  XCircle,
  Eye,
  PlusCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [loading, setLoading] = useState(true);

  // Cancellation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '50');

      const res = await api.get(`/bookings/my?${params.toString()}`);
      if (res.success) {
        setBookings(res.data);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [statusFilter]);

  const handleCancelClick = (b: IBooking) => {
    setSelectedBooking(b);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    try {
      setCancelling(true);
      const res = await api.patch(`/bookings/${selectedBooking._id}/cancel`, {
        reason: cancelReason || 'Cancelled by requester',
      });
      if (res.success) {
        success(`Booking ${selectedBooking.bookingRef} cancelled. Slot has been released.`);
        setCancelModalOpen(false);
        fetchMyBookings();
      }
    } catch (err: any) {
      error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Booking Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your reservation requests, administrative approval statuses, and cancellation options.
          </p>
        </div>
        <Link
          to="/bookings/new"
          className="px-4 py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800 transition-colors shadow-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Booking Request</span>
        </Link>
      </div>

      {/* Filter Tabs and Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-indigo-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Approved ({counts.approved})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Declined ({counts.rejected})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'cancelled'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancelled ({counts.cancelled})
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
              viewMode === 'table'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
              viewMode === 'cards'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Cards View
          </button>
        </div>
      </div>

      {/* Bookings View */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings match criteria"
          description="You don't have any reservations under the current filter selection."
          actionLabel="Book a Hall or Lab"
          onAction={() => (window.location.href = '/bookings/new')}
        />
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Event Title & Purpose</th>
                  <th className="py-3 px-4">Venue & Location</th>
                  <th className="py-3 px-4">Reserved Time Slot</th>
                  <th className="py-3 px-4">Attendees</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bookings.map((b) => {
                  const resourceName = typeof b.resource === 'object' ? b.resource?.name : 'Resource';
                  const building = typeof b.resource === 'object' ? b.resource?.location?.building : '';
                  const canCancel = b.status === 'pending' || b.status === 'approved';

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {b.bookingRef}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{b.eventTitle}</div>
                        <div className="text-[11px] text-slate-500 truncate">{b.purpose}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{resourceName}</div>
                        <div className="text-[10px] text-slate-500">{building}</div>
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        <div className="font-medium text-slate-900">
                          {new Date(b.startDateTime).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(b.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-4 tabular-nums font-medium text-slate-700">
                        {b.expectedAttendees}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/bookings/${b._id}`}
                            className="p-1.5 text-slate-600 hover:text-indigo-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Full Booking Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {canCancel && (
                            <button
                              onClick={() => handleCancelClick(b)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancel Reservation"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b) => {
            const resourceName = typeof b.resource === 'object' ? b.resource?.name : 'Resource';
            const building = typeof b.resource === 'object' ? b.resource?.location?.building : '';
            const canCancel = b.status === 'pending' || b.status === 'approved';

            return (
              <div
                key={b._id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{b.bookingRef}</span>
                    <StatusBadge status={b.status} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                    {b.eventTitle}
                  </h3>
                  <div className="text-xs text-indigo-900 font-semibold mb-2">
                    {resourceName}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {b.purpose}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100 tabular-nums">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span className="font-medium text-slate-800">{new Date(b.startDateTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Time:</span>
                      <span className="font-medium text-slate-800">
                        {new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(b.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Attendees:</span>
                      <span className="font-medium text-slate-800">{b.expectedAttendees} Scholars</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <Link
                    to={`/bookings/${b._id}`}
                    className="flex-1 py-1.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                  {canCancel && (
                    <button
                      onClick={() => handleCancelClick(b)}
                      className="py-1.5 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Booking Cancellation"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Slot Release Notice</div>
              <p className="mt-0.5">
                Cancelling this reservation will immediately release this venue slot for other academic faculty and departments.
              </p>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">Reservation Reference</div>
            <div className="font-mono text-sm font-bold text-slate-900">
              {selectedBooking?.bookingRef} — {selectedBooking?.eventTitle}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cancellation Reason (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule postponed / Speaker travel changed"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Releasing Slot...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
