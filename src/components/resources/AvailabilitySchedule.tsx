import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Clock, Calendar as CalendarIcon, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AvailabilityScheduleProps {
  resourceId: string;
  selectedDate: string;
  onSelectSlot?: (startTime: string, endTime: string) => void;
}

export const AvailabilitySchedule: React.FC<AvailabilityScheduleProps> = ({
  resourceId,
  selectedDate,
  onSelectSlot,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAvailability() {
      try {
        setLoading(true);
        const res = await api.get(`/resources/${resourceId}/availability?date=${selectedDate}`);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load availability schedule:', err);
      } finally {
        setLoading(false);
      }
    }
    if (resourceId && selectedDate) {
      loadAvailability();
    }
  }, [resourceId, selectedDate]);

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 animate-pulse text-xs text-slate-500">
        Calculating slot availability for {selectedDate}...
      </div>
    );
  }

  const approved = data?.approvedBookings || [];
  const pending = data?.pendingBookings || [];
  const isMaintenance = data?.resource?.maintenanceStatus?.isUnderMaintenance;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-900" />
          <h4 className="text-sm font-bold text-slate-900">
            Schedule on {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </h4>
        </div>
        <div className="text-xs text-slate-500 tabular-nums">
          Operating: {data?.resource?.operatingHours?.open} – {data?.resource?.operatingHours?.close}
        </div>
      </div>

      {isMaintenance && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Resource is Scheduled for Maintenance</div>
            <div>{data?.resource?.maintenanceStatus?.reason || 'Service in progress'}</div>
          </div>
        </div>
      )}

      {/* Confirmed bookings timeline */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-700">Reserved & Pending Intervals</div>

        {approved.length === 0 && pending.length === 0 ? (
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No reservations on this date. The entire operating day is currently open for booking.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {approved.map((b: any) => {
              const start = new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = new Date(b.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={b._id}
                  className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs flex items-center justify-between text-rose-950"
                >
                  <div>
                    <div className="font-semibold">{b.eventTitle}</div>
                    <div className="text-[11px] text-rose-700">
                      Reserved by {b.department} · {b.bookingRef}
                    </div>
                  </div>
                  <div className="font-mono font-semibold tabular-nums text-rose-900">
                    {start} - {end}
                  </div>
                </div>
              );
            })}

            {pending.map((b: any) => {
              const start = new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = new Date(b.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={b._id}
                  className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs flex items-center justify-between text-amber-950"
                >
                  <div>
                    <div className="font-semibold">{b.eventTitle} (Pending Approval)</div>
                    <div className="text-[11px] text-amber-700">
                      Requested by {b.department}
                    </div>
                  </div>
                  <div className="font-mono font-medium tabular-nums text-amber-800">
                    {start} - {end}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Turnaround buffer notice */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        <span>A mandatory {data?.resource?.bufferMinutes || 15}-minute turnaround buffer is automatically enforced between adjacent bookings.</span>
      </div>
    </div>
  );
};
