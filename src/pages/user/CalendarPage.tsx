import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ResourceCalendar } from '../../components/calendar/ResourceCalendar';
import { IResource } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { Calendar, Layers, MapPin, Users, Clock } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadCalendarData() {
      try {
        setLoading(true);
        const [bookingsRes, eventsRes, resourcesRes] = await Promise.all([
          api.get('/bookings?limit=150'),
          api.get('/events'),
          api.get('/resources?activeOnly=true'),
        ]);

        if (bookingsRes.success) setBookings(bookingsRes.data);
        if (eventsRes.success) setEvents(eventsRes.data);
        if (resourcesRes.success) setResources(resourcesRes.data);
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCalendarData();
  }, []);

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus Availability Calendar
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Full schedule of confirmed bookings, pending reviews, and institutional academic events.
        </p>
      </div>

      {/* Calendar Legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
            <span className="font-medium text-slate-700">Approved Reservation (Confirmed)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 shrink-0" />
            <span className="font-medium text-slate-700">Pending Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-500 shrink-0" />
            <span className="font-medium text-slate-700">Published Academic Event</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          Showing real-time records from database
        </div>
      </div>

      {/* Interactive Calendar Component */}
      {loading ? (
        <div className="h-96 bg-white rounded-xl border border-slate-200 p-8 flex items-center justify-center text-xs text-slate-400 animate-pulse">
          Loading schedule records...
        </div>
      ) : (
        <ResourceCalendar
          bookings={bookings}
          events={events}
          resources={resources}
          onSelectBooking={handleSelectItem}
        />
      )}

      {/* Details Modal on Click */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem?.title || selectedItem?.eventTitle || 'Schedule Item'}
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-500">
                {selectedItem.bookingRef || 'Campus Event'}
              </span>
              <StatusBadge status={selectedItem.status || 'published'} />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Venue:</span>
                <span className="font-bold text-slate-900">
                  {typeof selectedItem.resource === 'object' ? selectedItem.resource?.name : 'Academic Facility'}
                </span>
              </div>
              <div className="flex items-center justify-between tabular-nums">
                <span className="text-slate-400">Date:</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedItem.startDateTime).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between tabular-nums">
                <span className="text-slate-400">Time:</span>
                <span className="font-mono font-bold text-indigo-900">
                  {new Date(selectedItem.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(selectedItem.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department / Organizer:</span>
                <span className="font-medium text-slate-800">{selectedItem.department || selectedItem.organizer}</span>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg">
              {selectedItem.purpose || selectedItem.description}
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
