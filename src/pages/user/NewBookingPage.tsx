import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { IResource } from '../../types';
import { AvailabilitySchedule } from '../../components/resources/AvailabilitySchedule';
import {
  Calendar,
  Clock,
  Users,
  Building,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const NewBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [resources, setResources] = useState<IResource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<IResource | null>(null);

  // Form Fields
  const [eventTitle, setEventTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [eventCategory, setEventCategory] = useState('seminar');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default tomorrow
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [expectedAttendees, setExpectedAttendees] = useState(30);
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [specialRequirements, setSpecialRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Load resources
  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await api.get('/resources?activeOnly=true');
        if (res.success) {
          setResources(res.data);
          const paramId = searchParams.get('resourceId');
          if (paramId) {
            setSelectedResourceId(paramId);
            const found = res.data.find((r: IResource) => r._id === paramId);
            if (found) setSelectedResource(found);
          } else if (res.data.length > 0) {
            setSelectedResourceId(res.data[0]._id);
            setSelectedResource(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      }
    }
    fetchResources();
  }, [searchParams]);

  // Update selected resource object when ID changes
  useEffect(() => {
    if (selectedResourceId && resources.length > 0) {
      const found = resources.find((r) => r._id === selectedResourceId);
      setSelectedResource(found || null);
    }
  }, [selectedResourceId, resources]);

  // Live conflict pre-check
  useEffect(() => {
    async function preCheckConflict() {
      if (!selectedResourceId || !bookingDate || !startTime || !endTime) return;
      try {
        const start = new Date(`${bookingDate}T${startTime}:00`);
        const end = new Date(`${bookingDate}T${endTime}:00`);

        if (start >= end) {
          setConflictWarning('Start time must be strictly before end time.');
          return;
        }

        const res = await api.get(`/resources/${selectedResourceId}/availability?date=${bookingDate}`);
        if (res.success) {
          const approved = res.approvedBookings || [];
          const bufferMs = (selectedResource?.bufferMinutes || 15) * 60 * 1000;
          const reqStart = start.getTime();
          const reqEnd = end.getTime();

          const hasOverlap = approved.some((b: any) => {
            const bStart = new Date(b.startDateTime).getTime() - bufferMs;
            const bEnd = new Date(b.endDateTime).getTime() + bufferMs;
            // Half-open interval with buffer: startA < endB && endA > startB
            return reqStart < bEnd && reqEnd > bStart;
          });

          if (hasOverlap) {
            setConflictWarning('Schedule Conflict: This requested time slot overlaps with an approved reservation or required turnaround buffer.');
          } else {
            setConflictWarning(null);
          }
        }
      } catch {
        // ignore precheck errors
      }
    }

    const timer = setTimeout(preCheckConflict, 300);
    return () => clearTimeout(timer);
  }, [selectedResourceId, bookingDate, startTime, endTime, selectedResource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResourceId) {
      error('Please select a resource venue.');
      return;
    }

    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const endDateTime = new Date(`${bookingDate}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      error('Booking start time must be strictly before end time.');
      return;
    }

    if (selectedResource && expectedAttendees > selectedResource.capacity) {
      error(`Expected attendees (${expectedAttendees}) exceeds maximum venue capacity of ${selectedResource.capacity}.`);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/bookings', {
        resourceId: selectedResourceId,
        eventTitle,
        purpose,
        department,
        eventCategory,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        expectedAttendees: Number(expectedAttendees),
        contactPhone,
        specialRequirements,
      });

      if (res.success && res.booking) {
        success(`Booking ${res.booking.bookingRef} submitted for administrator review.`);
        navigate(`/bookings/${res.booking._id}`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resources</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          New Resource Booking Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submit an academic venue reservation. The server automatically checks availability and prevents overlapping bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resource Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Venue / Facility <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 font-semibold text-slate-900"
              >
                {resources.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} — {r.location.building} (Cap: {r.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Event Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event / Session Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Annual Symposium on Frontier Computing"
                className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>

            {/* Event Category & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Category
                </label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 font-medium"
                >
                  <option value="seminar">Seminar / Guest Keynote</option>
                  <option value="workshop">Interactive Workshop</option>
                  <option value="conference">Academic Conference</option>
                  <option value="lecture">Curriculum Lecture</option>
                  <option value="lab_session">Lab Research Sprint</option>
                  <option value="cultural">Campus Cultural Event</option>
                  <option value="student_club">Student Society Meeting</option>
                  <option value="examination">Examination / Assessment</option>
                  <option value="meeting">Board / Faculty Meeting</option>
                  <option value="other">Other Institutional Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organizing Department
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                />
              </div>
            </div>

            {/* Date, Start Time, End Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reservation Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
                />
              </div>
            </div>

            {/* Expected Attendees & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Attendees Count <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedResource?.capacity || 1000}
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
                />
                {selectedResource && (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Venue maximum capacity: {selectedResource.capacity} seats
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Purpose & Academic Objectives <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the academic agenda, invited dignitaries, and necessity for this facility..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 leading-relaxed"
              />
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Requirements (AV, Streaming, Podium, Seating Layout)
              </label>
              <input
                type="text"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. Wireless lapel mic, live Zoom streaming, tea catering in foyer"
                className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
              />
            </div>

            {/* Live Conflict Alert Warning */}
            {conflictWarning && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Potential Scheduling Conflict</div>
                  <div className="mt-0.5 leading-relaxed">{conflictWarning}</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(conflictWarning)}
              className="w-full py-3 px-4 text-xs sm:text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Validating & Reserving...' : 'Submit Booking Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Venue Preview & Schedule Snapshot */}
        <div className="lg:col-span-5 space-y-6">
          {selectedResource && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="h-40 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={selectedResource.imageUrl}
                  alt={selectedResource.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Selected Venue
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedResource.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{selectedResource.location?.building}</span>
                  <span aria-hidden="true">·</span>
                  <span>Rm {selectedResource.location?.roomNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-slate-800 tabular-nums">{selectedResource.capacity} Seats</span>
                </div>
              </div>

              {/* Live Schedule for this Date */}
              <div className="pt-2 border-t border-slate-100">
                <AvailabilitySchedule
                  resourceId={selectedResource._id}
                  selectedDate={bookingDate}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
