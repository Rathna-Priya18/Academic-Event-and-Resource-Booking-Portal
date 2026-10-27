import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { IBooking } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  History,
} from 'lucide-react';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${id}`);
      if (res.success) {
        setBooking(res.booking);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const handleConfirmCancel = async () => {
    if (!booking) return;
    try {
      setCancelling(true);
      const res = await api.patch(`/bookings/${booking._id}/cancel`, {
        reason: cancelReason || 'Cancelled by requester',
      });
      if (res.success) {
        success(`Booking ${booking.bookingRef} cancelled. Slot released.`);
        setCancelModalOpen(false);
        fetchBooking();
      }
    } catch (err: any) {
      error(err.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Booking Dossier Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">This reservation reference does not exist or you do not have permission to view it.</p>
        <Link to="/my-bookings" className="mt-4 inline-block text-xs font-bold text-indigo-900">
          ← Return to My Bookings
        </Link>
      </div>
    );
  }

  const resource = typeof booking.resource === 'object' ? booking.resource : null;
  const requester = typeof booking.user === 'object' ? booking.user : null;
  const canCancel = booking.status === 'pending' || booking.status === 'approved';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={isAdmin ? '/admin/approvals' : '/my-bookings'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isAdmin ? 'Back to Approval Center' : 'Back to My Bookings'}</span>
        </Link>
      </div>

      {/* Main Dossier Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">
                {booking.bookingRef}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                {booking.eventCategory}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {booking.eventTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={booking.status} className="text-xs py-1 px-3" />
            {canCancel && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
              >
                Cancel Reservation
              </button>
            )}
          </div>
        </div>

        {/* Approval or Rejection Notification Alert Box */}
        {booking.status === 'approved' && booking.approvalDetails && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900">Approved Reservation Confirmed</div>
              <div className="mt-0.5">
                Remarks: {booking.approvalDetails.remarks || 'Confirmed by administration.'}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 tabular-nums">
                Approved on {new Date(booking.approvalDetails.approvedAt || '').toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {booking.status === 'rejected' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-900">Booking Request Declined</div>
              <div className="mt-0.5">
                Justification: {booking.rejectionReason || 'No reason specified by administration.'}
              </div>
            </div>
          </div>
        )}

        {booking.status === 'cancelled' && (
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Reservation Cancelled</div>
              <div className="mt-0.5">
                Reason: {booking.cancellationDetails?.reason || 'Cancelled by requester'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                Cancelled on {new Date(booking.cancellationDetails?.cancelledAt || '').toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Grid Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Column 1: Venue & Timing */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Facility & Timing Specifications
            </h3>
            <div className="space-y-2.5 text-slate-600">
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Reserved Venue:</span>
                <span className="font-bold text-slate-900 text-right">{resource?.name}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-800 text-right">
                  {resource?.location?.building}, {resource?.location?.floor}, Rm {resource?.location?.roomNumber}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Reservation Date:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {new Date(booking.startDateTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Time Interval:</span>
                <span className="font-mono font-bold text-indigo-900 tabular-nums">
                  {new Date(booking.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(booking.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Expected Attendees:</span>
                <span className="font-bold text-slate-900 tabular-nums">{booking.expectedAttendees} Scholars</span>
              </div>
            </div>
          </div>

          {/* Column 2: Requester & Academic Purpose */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Requester & Purpose
            </h3>
            <div className="space-y-2.5 text-slate-600">
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Requester Name:</span>
                <span className="font-bold text-slate-900">{requester?.name}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-medium text-slate-800">{requester?.email}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-medium text-slate-800">{booking.department}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Contact Phone:</span>
                <span className="font-medium text-slate-800">{booking.contactPhone || 'N/A'}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Special Requirements:</span>
                <span className="font-medium text-slate-800 text-right">{booking.specialRequirements || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Purpose Description */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 mb-1">Academic Purpose & Scope</h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {booking.purpose}
          </p>
        </div>

        {/* Status Lifecycle Audit History */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <History className="w-4 h-4 text-indigo-900" />
            <span>Booking Lifecycle Status History</span>
          </div>
          <div className="space-y-2">
            {booking.statusHistory && booking.statusHistory.map((item, idx) => {
              const changedByName = typeof item.changedBy === 'object' ? item.changedBy?.name : 'System';
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-slate-700">{item.note || 'Status updated'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 tabular-nums">
                    {changedByName} · {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Cancellation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel booking <span className="font-mono font-bold text-slate-900">{booking.bookingRef}</span>?
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cancellation Reason
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Provide reason for record keeping"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Keep Active
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Releasing Slot...' : 'Confirm Release'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
