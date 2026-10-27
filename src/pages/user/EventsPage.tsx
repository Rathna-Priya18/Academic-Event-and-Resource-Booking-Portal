import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { IEvent } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  PlusCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New Event Modal (Faculty/Admin/Staff)
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    organizer: user?.name || '',
    department: user?.department || 'Computer Science & Engineering',
    category: 'Academic',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '12:00',
    targetAudience: 'All Campus Community',
    maxParticipants: 100,
  });
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      const res = await api.get(`/events?${params.toString()}`);
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load campus events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      error('Please specify both start and end dates');
      return;
    }

    try {
      setCreating(true);
      const startDateTime = new Date(`${form.startDate}T${form.startTime}:00`);
      const endDateTime = new Date(`${form.endDate}T${form.endTime}:00`);

      const res = await api.post('/events', {
        title: form.title,
        description: form.description,
        organizer: form.organizer,
        department: form.department,
        category: form.category,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        targetAudience: form.targetAudience,
        maxParticipants: Number(form.maxParticipants),
        isPublished: true,
      });

      if (res.success) {
        success('Campus event published to institutional board.');
        setModalOpen(false);
        fetchEvents();
      }
    } catch (err: any) {
      error(err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const canPublish = user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'staff';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Academic Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Institutional symposia, distinguished lectures, hackathons, and departmental workshops.
          </p>
        </div>
        {canPublish && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800 transition-colors shadow-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Event</span>
          </button>
        )}
      </div>

      {/* Categories Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'Academic', 'Student Activities', 'Institutional', 'Research'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              selectedCategory === cat
                ? 'bg-indigo-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="There are no upcoming published events in this category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const resource = typeof event.resource === 'object' ? event.resource : null;

            return (
              <div
                key={event._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    {event.bannerUrl ? (
                      <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center text-white/50 text-xs font-bold">
                        Academic Event
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-indigo-900 shadow-xs">
                      {event.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="text-[11px] font-semibold text-indigo-900">
                      {event.department}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100 tabular-nums">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{new Date(event.startDateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {resource && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{resource.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Audience: {event.targetAudience}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                    Organizer: <span className="font-semibold text-slate-700">{event.organizer}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Event Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Institutional Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Distinguished Turing Lecture 2026"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
              >
                <option value="Academic">Academic</option>
                <option value="Student Activities">Student Activities</option>
                <option value="Institutional">Institutional</option>
                <option value="Research">Research</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg disabled:opacity-50"
            >
              {creating ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
