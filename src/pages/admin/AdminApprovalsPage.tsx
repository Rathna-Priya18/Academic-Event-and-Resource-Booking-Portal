import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { IBooking, IResource } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  Layers,
  Search,
} from 'lucide-react';

export const AdminApprovalsPage: React.FC = () => {
  const { success, error } = useToast();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedResource, setSelectedResource] = useState('all');
  const [search, setSearch] = useState('');

  // Approval modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [approving, setApproving] = useState(false);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (selectedResource !== 'all') params.append('resourceId', selectedResource);
      if (search) params.append('search', search);
      params.append('limit', '50');

      const res = await api.get(`/bookings?${params.toString()}`);
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load booking approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadResources() {
      try {
        const res = await api.get('/resources');
        if (res.success) setResources(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadResources();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchBookings, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, selectedResource, search]);

  const handleOpenApprove = (b: IBooking) => {
    setSelectedBooking(b);
    setApprovalRemarks('Approved. AV technicians and venue key custodians notified.');
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedBooking) return;
    try {
      setApproving(true);
      const res = await api.patch(`/bookings/${selectedBooking._id}/approve`, {
        remarks: approvalRemarks,
      });

      if (res.success) {
        success(`Booking ${selectedBooking.bookingRef} approved! Slot confirmed.`);
        setApproveModalOpen(false);
        fetchBookings();
      }
    } catch (err: any) {
      error(err.message || 'Approval failed. Conflict re-detected.');
    } finally {
      setApproving(false);
    }
  };

  const handleOpenReject = (b: IBooking) => {
    setSelectedBooking(b);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedBooking) return;
    if (!rejectionReason.trim()) {
      error('Please provide a reason for declining this request.');
      return;
    }

    try {
      setRejecting(true);
      const res = await api.patch(`/bookings/${selectedBooking._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });

      if (res.success) {
        success(`Booking ${selectedBooking.bookingRef} has been declined.`);
        setRejectModalOpen(false);
        fetchBookings();
      }
    } catch (err: any) {
      error(err.message || 'Failed to reject booking');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Booking Approvals & Oversight
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, approve, or decline institutional venue requests with atomic conflict revalidation.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ref number, title, requester, or department..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="w-full md:w-56 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-800 font-medium"
          >
            <option value="all">All Campus Venues</option>
            {resources.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-900 hover:bg-rose-100'
            }`}
          >
            Declined
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'cancelled'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-indigo-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Bookings
          </button>
        </div>
      </div>

      {/* Approvals Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No booking requests"
          description="There are currently no requests matching this status filter."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Ref & Event</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Venue & Capacity</th>
                  <th className="py-3 px-4">Scheduled Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bookings.map((b) => {
                  const resourceName = typeof b.resource === 'object' ? b.resource?.name : 'Resource';
                  const requesterName = typeof b.user === 'object' ? b.user?.name : 'User';
                  const requesterEmail = typeof b.user === 'object' ? b.user?.email : '';
                  const isPending = b.status === 'pending';

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.eventTitle}</div>
                        <div className="font-mono text-[10px] text-slate-400">{b.bookingRef}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">{b.purpose}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{requesterName}</div>
                        <div className="text-[10px] text-slate-500">{b.department}</div>
                        <div className="text-[10px] text-slate-400">{requesterEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{resourceName}</div>
                        <div className="text-[10px] text-slate-500 tabular-nums">
                          Attendees: <span className="font-bold text-slate-700">{b.expectedAttendees}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <div className="font-medium text-slate-900">{new Date(b.startDateTime).toLocaleDateString()}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(b.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleOpenApprove(b)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleOpenReject(b)}
                                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </>
                          ) : (
                            <Link
                              to={`/bookings/${b._id}`}
                              className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                            >
                              Dossier
                            </Link>
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
      )}

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Booking Request"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
            <div className="font-bold text-emerald-900">Pre-Approval Availability Check</div>
            <p>
              Confirming this booking will lock the venue for this time slot and enforce the turnaround buffer.
            </p>
          </div>

          <div className="space-y-1 text-slate-700">
            <div>
              <span className="text-slate-400">Event: </span>
              <span className="font-bold text-slate-900">{selectedBooking?.eventTitle}</span>
            </div>
            <div>
              <span className="text-slate-400">Venue: </span>
              <span className="font-semibold text-slate-900">
                {typeof selectedBooking?.resource === 'object' ? selectedBooking?.resource?.name : 'Resource'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Slot: </span>
              <span className="font-mono tabular-nums">
                {selectedBooking && new Date(selectedBooking.startDateTime).toLocaleString()} -{' '}
                {selectedBooking && new Date(selectedBooking.endDateTime).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Administrator Remarks
            </label>
            <input
              type="text"
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
              placeholder="e.g. Approved. Keys with security office."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setApproveModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmApprove}
              disabled={approving}
              className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {approving ? 'Verifying Conflict Engine...' : 'Confirm & Approve'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Booking Request"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Please enter the justification for declining request{' '}
            <span className="font-mono font-bold text-slate-900">{selectedBooking?.bookingRef}</span>. The requester will be notified immediately.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decline Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Venue reserved for institutional accreditation inspection / exceeds maximum duration..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={rejecting}
              className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
            >
              {rejecting ? 'Declining...' : 'Confirm Decline'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
