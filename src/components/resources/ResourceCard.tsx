import React from 'react';
import { Link } from 'react-router-dom';
import { IResource } from '../../types';
import { Users, MapPin, Clock, Wrench, ArrowRight } from 'lucide-react';

interface ResourceCardProps {
  resource: IResource;
  onBookNow?: (resource: IResource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onBookNow }) => {
  const isMaintenance = resource.maintenanceStatus?.isUnderMaintenance;
  const isAvailable = resource.isActive && !isMaintenance;

  const categoryLabels: Record<string, string> = {
    seminar_hall: 'Seminar Hall',
    classroom: 'Smart Classroom',
    computer_lab: 'Computer Lab',
    science_lab: 'Research Lab',
    auditorium: 'Auditorium',
    meeting_room: 'Boardroom',
    projector: 'Audio/Visual Kit',
    av_equipment: 'AV Equipment',
    other: 'Campus Facility',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between group">
      <div>
        {/* Resource Image with Fallback Container */}
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          {resource.imageUrl ? (
            <img
              src={resource.imageUrl}
              alt={resource.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to stylized SVG placeholder if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}

          {/* Fallback container if image not provided */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-indigo-950 -z-10 flex items-center justify-center text-white/50 text-sm font-semibold">
            {categoryLabels[resource.category] || 'Resource'}
          </div>

          {/* Availability Status Ribbon */}
          <div className="absolute top-3 right-3">
            {isMaintenance ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white shadow-xs">
                <Wrench className="w-3.5 h-3.5" />
                <span>Maintenance</span>
              </span>
            ) : isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white shadow-xs">
                <span>Available</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-600 text-white shadow-xs">
                <span>Inactive</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5">
          {/* Metadata line without pill clutter */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <span className="text-indigo-900 font-semibold">{categoryLabels[resource.category] || resource.category}</span>
            <span aria-hidden="true">·</span>
            <span>{resource.location?.building}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 mb-2 group-hover:text-indigo-900 transition-colors">
            {resource.name}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {resource.description}
          </p>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="tabular-nums font-medium">{resource.capacity} Seats Capacity</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{resource.location?.floor}, Rm {resource.location?.roomNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 text-slate-500 truncate">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="tabular-nums">Hours: {resource.operatingHours?.open} - {resource.operatingHours?.close} ({resource.bufferMinutes}m turnaround)</span>
            </div>
          </div>

          {/* Facilities preview */}
          {resource.facilities && resource.facilities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {resource.facilities.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded"
                >
                  {f}
                </span>
              ))}
              {resource.facilities.length > 3 && (
                <span className="text-[10px] text-slate-400 px-1 py-0.5">
                  +{resource.facilities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-5 pb-5 pt-2 flex items-center gap-3">
        <Link
          to={`/resources/${resource._id}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Details & Schedule
        </Link>
        <Link
          to={`/bookings/new?resourceId=${resource._id}`}
          className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            isAvailable
              ? 'bg-indigo-900 text-white hover:bg-indigo-800'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
          }`}
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
