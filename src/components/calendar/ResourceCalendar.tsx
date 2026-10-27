import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { IResource } from '../../types';

interface CalendarEvent {
  id: string;
  title: string;
  resourceName: string;
  start: Date;
  end: Date;
  status: string;
  type: 'booking' | 'event';
}

interface ResourceCalendarProps {
  bookings: any[];
  events: any[];
  resources: IResource[];
  onSelectBooking?: (booking: any) => void;
}

export const ResourceCalendar: React.FC<ResourceCalendarProps> = ({
  bookings,
  events,
  resources,
  onSelectBooking,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Combine items into calendar items
  const calendarItems: CalendarEvent[] = [
    ...bookings
      .filter((b) => {
        if (selectedResource !== 'all') {
          const resId = typeof b.resource === 'object' ? b.resource?._id : b.resource;
          if (resId !== selectedResource) return false;
        }
        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
        return true;
      })
      .map((b) => ({
        id: b._id,
        title: b.eventTitle,
        resourceName: typeof b.resource === 'object' ? b.resource?.name : 'Resource',
        start: new Date(b.startDateTime),
        end: new Date(b.endDateTime),
        status: b.status,
        type: 'booking' as const,
        raw: b,
      })),
    ...events
      .filter(() => statusFilter === 'all' || statusFilter === 'event')
      .map((e) => ({
        id: e._id,
        title: e.title,
        resourceName: typeof e.resource === 'object' ? e.resource?.name : 'Campus',
        start: new Date(e.startDateTime),
        end: new Date(e.endDateTime),
        status: 'published',
        type: 'event' as const,
        raw: e,
      })),
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
            {monthNames[month]} {year}
          </h3>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-l-lg"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={today}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 border-x border-slate-200 text-slate-700"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-r-lg"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-900"
            >
              <option value="all">All Resources</option>
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-900"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600 py-2.5">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-100">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-24 bg-slate-50/50 p-2" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isToday =
            new Date().getDate() === dayNum &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          // Find items matching this day
          const dayItems = calendarItems.filter((item) => {
            return (
              item.start.getDate() === dayNum &&
              item.start.getMonth() === month &&
              item.start.getFullYear() === year
            );
          });

          return (
            <div
              key={`day-${dayNum}`}
              className={`min-h-24 bg-white p-2 flex flex-col justify-between hover:bg-slate-50/50 transition-colors ${
                isToday ? 'bg-indigo-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    isToday
                      ? 'w-6 h-6 rounded-full bg-indigo-900 text-white flex items-center justify-center'
                      : 'text-slate-700'
                  }`}
                >
                  {dayNum}
                </span>
                {dayItems.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                    {dayItems.length} {dayItems.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>

              {/* Items in this day */}
              <div className="space-y-1 overflow-y-auto max-h-24">
                {dayItems.slice(0, 3).map((item) => {
                  const time = item.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const isApproved = item.status === 'approved';
                  const isPending = item.status === 'pending';

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectBooking && onSelectBooking((item as any).raw)}
                      className={`px-1.5 py-1 rounded text-[10px] leading-tight cursor-pointer truncate font-medium border ${
                        item.type === 'event'
                          ? 'bg-purple-50 text-purple-900 border-purple-200'
                          : isApproved
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      title={`${item.title} (${item.resourceName}) at ${time}`}
                    >
                      <span className="font-bold tabular-nums mr-1">{time}</span>
                      <span>{item.title}</span>
                    </div>
                  );
                })}
                {dayItems.length > 3 && (
                  <div className="text-[10px] text-slate-400 text-center font-medium">
                    +{dayItems.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
