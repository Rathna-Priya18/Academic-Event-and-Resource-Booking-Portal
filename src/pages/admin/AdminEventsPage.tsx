import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { IEvent } from '../../types';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';
import { Sparkles, PlusCircle, Trash2, Edit, Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const { success, error } = useToast();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // New Event Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    organizer: 'Dean of Academic Affairs',
    department: 'Academic Administration',
    category: 'Institutional',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    targetAudience: 'All Campus Community',
    maxParticipants: 500,
    bannerUrl: '/src/assets/images/resource_auditorium_1793023440037.jpg',
  });
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events?isPublished=false');
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const startDateTime = new Date(`${form.startDate}T${form.startTime}:00`);
      const endDateTime = new Date(`${form.endDate}T${form.endTime}:00`);

      await api.post('/events', {
        title: form.title,
        description: form.description,
        organizer: form.organizer,
        department: form.department,
        category: form.category,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        targetAudience: form.targetAudience,
        maxParticipants: Number(form.maxParticipants),
        bannerUrl: form.bannerUrl,
        isPublished: true,
      });

      success('Campus event published.');
      setModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      error(err.message || 'Failed to publish event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await api.delete(`/events/${id}`);
      success(`Event "${title}" removed.`);
      fetchEvents();
    } catch (err: any) {
      error(err.message || 'Failed to delete event');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Event Publisher
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish convocations, symposiums, keynote addresses, and official campus milestones.
          </p>
        </div>
        <button
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            setForm((prev) => ({ ...prev, startDate: today, endDate: today }));
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800 transition-colors shadow-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Event</span>
        </button>
      </div>

      {/* Events Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Event Title & Category</th>
                  <th className="py-3 px-4">Organizer & Dept</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ev.title}</div>
                      <div className="text-[10px] text-indigo-900 font-semibold uppercase">{ev.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ev.organizer}</div>
                      <div className="text-[10px] text-slate-500">{ev.department}</div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <div>{new Date(ev.startDateTime).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(ev.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(ev.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{ev.targetAudience}</td>
                    <td className="py-3.5 px-4">
                      {ev.isPublished ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Published
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(ev._id, ev.title)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Publish Official Event">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900"
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
              disabled={saving}
              className="px-4 py-2 font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
