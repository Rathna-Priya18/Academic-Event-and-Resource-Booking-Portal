import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ResourceCalendar } from '../../components/calendar/ResourceCalendar';
import { IResource } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { Shield, Calendar, Info } from 'lucide-react';

export const AdminCalendarPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bRes, eRes, rRes] = await Promise.all([
          api.get('/bookings?limit=200'),
          api.get('/events?isPublished=false'),
          api.get('/resources'),
        ]);

        if (bRes.success) setBookings(bRes.data);
        if (eRes.success) setEvents(eRes.data);
        if (rRes.success) setResources(rRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Master Institutional Calendar & Scheduling
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Full schedule overview of all departmental bookings, maintenance closures, and public university convocations.
        </p>
      </div>

      {loading ? (
        <div className="h-96 bg-white rounded-xl border border-slate-200 p-8 flex items-center justify-center text-xs text-slate-400 animate-pulse">
          Loading institutional schedule matrix...
        </div>
      ) : (
        <ResourceCalendar
          bookings={bookings}
          events={events}
          resources={resources}
          onSelectBooking={(item) => {
            setSelectedItem(item);
            setModalOpen(true);
          }}
        />
      )}

      {/* Item Modal */}
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
