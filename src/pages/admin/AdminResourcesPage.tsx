import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { IResource } from '../../types';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Layers,
  PlusCircle,
  Edit,
  Trash2,
  Wrench,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Search,
} from 'lucide-react';

export const AdminResourcesPage: React.FC = () => {
  const { success, error } = useToast();
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Maintenance modal
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [maintResource, setMaintResource] = useState<IResource | null>(null);
  const [maintReason, setMaintReason] = useState('');
  const [maintActive, setMaintActive] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: 'seminar_hall',
    description: '',
    building: 'Alan Turing Computing Center',
    floor: '1st Floor',
    roomNumber: '101',
    capacity: 100,
    facilities: 'Laser Projection, Surround Sound, Microphones, Wi-Fi',
    openTime: '08:00',
    closeTime: '20:00',
    bufferMinutes: 15,
    maxDurationHours: 6,
    imageUrl: '/src/assets/images/resource_seminar_hall_1793023439386.jpg',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await api.get(`/resources?${params.toString()}`);
      if (res.success) {
        setResources(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchResources, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({
      name: '',
      category: 'seminar_hall',
      description: '',
      building: 'Alan Turing Computing Center',
      floor: '1st Floor',
      roomNumber: '101',
      capacity: 100,
      facilities: 'Laser Projection, Surround Sound, Microphones, Wi-Fi',
      openTime: '08:00',
      closeTime: '20:00',
      bufferMinutes: 15,
      maxDurationHours: 6,
      imageUrl: '/src/assets/images/resource_seminar_hall_1793023439386.jpg',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (r: IResource) => {
    setIsEditing(true);
    setCurrentId(r._id);
    setForm({
      name: r.name,
      category: r.category,
      description: r.description,
      building: r.location.building,
      floor: r.location.floor,
      roomNumber: r.location.roomNumber,
      capacity: r.capacity,
      facilities: r.facilities.join(', '),
      openTime: r.operatingHours?.open || '08:00',
      closeTime: r.operatingHours?.close || '20:00',
      bufferMinutes: r.bufferMinutes || 15,
      maxDurationHours: r.bookingRestrictions?.maxDurationHours || 6,
      imageUrl: r.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        location: {
          building: form.building,
          floor: form.floor,
          roomNumber: form.roomNumber,
        },
        capacity: Number(form.capacity),
        facilities: form.facilities.split(',').map((f) => f.trim()).filter(Boolean),
        operatingHours: {
          open: form.openTime,
          close: form.closeTime,
        },
        bookingRestrictions: {
          maxDurationHours: Number(form.maxDurationHours),
          minNoticeHours: 2,
          maxAdvanceDays: 60,
          allowWeekends: true,
        },
        bufferMinutes: Number(form.bufferMinutes),
        imageUrl: form.imageUrl,
      };

      if (isEditing && currentId) {
        await api.patch(`/resources/${currentId}`, payload);
        success('Resource updated successfully.');
      } else {
        await api.post('/resources', payload);
        success('New resource registered successfully.');
      }

      setModalOpen(false);
      fetchResources();
    } catch (err: any) {
      error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMaintenance = (r: IResource) => {
    setMaintResource(r);
    setMaintActive(r.maintenanceStatus?.isUnderMaintenance || false);
    setMaintReason(r.maintenanceStatus?.reason || '');
    setMaintModalOpen(true);
  };

  const handleSaveMaintenance = async () => {
    if (!maintResource) return;
    try {
      await api.patch(`/resources/${maintResource._id}/maintenance`, {
        isUnderMaintenance: maintActive,
        reason: maintReason,
      });
      success(`Maintenance status updated for "${maintResource.name}".`);
      setMaintModalOpen(false);
      fetchResources();
    } catch (err: any) {
      error(err.message || 'Failed to update maintenance state');
    }
  };

  const handleDelete = async (r: IResource) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${r.name}"?`)) return;
    try {
      await api.delete(`/resources/${r._id}`);
      success(`Resource "${r.name}" deleted.`);
      fetchResources();
    } catch (err: any) {
      error(err.message || 'Could not delete resource');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Resource Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure seminar halls, laboratories, auditoriums, capacity rules, and scheduled maintenance.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800 transition-colors shadow-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Resource</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venue by name, location, or equipment..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Venue & Category</th>
                  <th className="py-3 px-4">Building & Room</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Operating Hours</th>
                  <th className="py-3 px-4">Buffer Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {resources.map((r) => {
                  const isMaint = r.maintenanceStatus?.isUnderMaintenance;

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.name}</div>
                        <div className="text-[10px] text-indigo-900 font-semibold uppercase tracking-wider">
                          {r.category.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{r.location?.building}</div>
                        <div className="text-[10px] text-slate-500">
                          {r.location?.floor}, Rm {r.location?.roomNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-bold text-slate-900">
                        {r.capacity} Seats
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-slate-600">
                        {r.operatingHours?.open} - {r.operatingHours?.close}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-slate-600">
                        {r.bufferMinutes} mins
                      </td>
                      <td className="py-3.5 px-4">
                        {isMaint ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            <Wrench className="w-3 h-3" />
                            <span>Maintenance</span>
                          </span>
                        ) : r.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenMaintenance(r)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Toggle Maintenance"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 text-indigo-900 hover:bg-indigo-50 rounded-lg"
                            title="Edit Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit Resource Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Campus Resource' : 'Register New Campus Resource'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Main Auditorium"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
              >
                <option value="seminar_hall">Seminar Hall</option>
                <option value="classroom">Smart Classroom</option>
                <option value="computer_lab">Computer Laboratory</option>
                <option value="science_lab">Science Research Lab</option>
                <option value="auditorium">Auditorium</option>
                <option value="meeting_room">Boardroom</option>
                <option value="projector">Projector Kit</option>
                <option value="av_equipment">AV Equipment</option>
                <option value="other">Other Facility</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Seating Capacity</label>
              <input
                type="number"
                required
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Building</label>
              <input
                type="text"
                required
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Floor</label>
              <input
                type="text"
                required
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Open Time</label>
              <input
                type="time"
                value={form.openTime}
                onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Close Time</label>
              <input
                type="time"
                value={form.closeTime}
                onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Buffer (Minutes)</label>
              <input
                type="number"
                min="0"
                value={form.bufferMinutes}
                onChange={(e) => setForm({ ...form, bufferMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Installed Facilities (Comma separated)</label>
            <input
              type="text"
              value={form.facilities}
              onChange={(e) => setForm({ ...form, facilities: e.target.value })}
              placeholder="e.g. 4K Laser Projection, Surround Sound, Video Conferencing"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Image Asset Path / URL</label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900 font-mono text-[11px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Maintenance Toggle Modal */}
      <Modal
        isOpen={maintModalOpen}
        onClose={() => setMaintModalOpen(false)}
        title="Scheduled Maintenance Settings"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="font-bold text-slate-900">{maintResource?.name}</div>
            <div className="text-slate-500">{maintResource?.location?.building}</div>
          </div>

          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={maintActive}
              onChange={(e) => setMaintActive(e.target.checked)}
              className="w-4 h-4 text-indigo-900 rounded"
            />
            <div>
              <div className="font-bold text-slate-900">Mark Under Maintenance</div>
              <div className="text-slate-500 text-[11px]">
                When active, the conflict engine will automatically reject new booking attempts during this period.
              </div>
            </div>
          </label>

          {maintActive && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Service Scope</label>
              <input
                type="text"
                value={maintReason}
                onChange={(e) => setMaintReason(e.target.value)}
                placeholder="e.g. Routine projector lamp recalibration / carpet shampoo"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setMaintModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveMaintenance}
              className="px-4 py-2 font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg"
            >
              Save Maintenance State
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
