import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IResource } from '../../types';
import { AvailabilitySchedule } from '../../components/resources/AvailabilitySchedule';
import {
  Users,
  MapPin,
  Clock,
  ShieldAlert,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Wrench,
  Sparkles,
} from 'lucide-react';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<IResource | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Date for live availability schedule checking
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    async function loadResource() {
      try {
        setLoading(true);
        const res = await api.get(`/resources/${id}`);
        if (res.success) {
          setResource(res.resource);
          setUpcomingBookings(res.upcomingBookings || []);
        }
      } catch (err) {
        console.error('Failed to load resource details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadResource();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/5" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-32 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Resource not found</h3>
        <p className="text-xs text-slate-500 mt-1">The resource you requested does not exist or was removed.</p>
        <Link to="/resources" className="mt-4 inline-block text-xs font-bold text-indigo-900">
          ← Return to Resources
        </Link>
      </div>
    );
  }

  const isMaintenance = resource.maintenanceStatus?.isUnderMaintenance;
  const isAvailable = resource.isActive && !isMaintenance;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resource Catalog</span>
        </Link>
      </div>

      {/* Hero Banner Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-bold text-indigo-900 uppercase tracking-wider">{resource.category.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span>{resource.location?.building}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {resource.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-700">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Seating Capacity</div>
              <div className="font-bold text-base text-slate-900 tabular-nums">{resource.capacity} Attendees</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Location</div>
              <div className="font-semibold text-slate-900">{resource.location?.floor}, Rm {resource.location?.roomNumber}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Operating Hours</div>
              <div className="font-semibold text-slate-900 tabular-nums">{resource.operatingHours?.open} - {resource.operatingHours?.close}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Turnaround Buffer</div>
              <div className="font-semibold text-slate-900 tabular-nums">{resource.bufferMinutes} minutes</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Max Duration</div>
              <div className="font-semibold text-slate-900 tabular-nums">{resource.bookingRestrictions?.maxDurationHours} hours max</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Min Notice</div>
              <div className="font-semibold text-slate-900 tabular-nums">{resource.bookingRestrictions?.minNoticeHours} hours notice</div>
            </div>
          </div>

          {/* CTA Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              {isMaintenance ? (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>Currently under maintenance</span>
                </div>
              ) : isAvailable ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Online & Ready for Bookings</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Resource currently inactive</span>
                </div>
              )}
            </div>

            <Link
              to={`/bookings/new?resourceId=${resource._id}`}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                isAvailable
                  ? 'bg-indigo-900 text-white hover:bg-indigo-800 shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              <span>Submit Booking Request</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: High-Res Image Card */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative min-h-[300px] lg:min-h-full bg-slate-100">
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Facilities & Equipment Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Installed Facilities & Equipment</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {resource.facilities.map((fac, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-800 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>{fac}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Date-Picker Schedule Checker */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Availability Schedule</h3>
            <p className="text-xs text-slate-500">
              Select an upcoming date to inspect confirmed reservation blocks and free intervals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-900"
            />
          </div>
        </div>

        <AvailabilitySchedule
          resourceId={resource._id}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};
