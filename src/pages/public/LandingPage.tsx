import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Calendar,
  Layers,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredResources, setFeaturedResources] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/resources?limit=3&activeOnly=true');
        if (res.success) {
          setFeaturedResources(res.data);
        }
        // Public overview metric preview
        const pubMetrics = await api.get('/resources');
        if (pubMetrics.success) {
          setMetrics({
            totalResources: pubMetrics.pagination?.total || 11,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-12">

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-900 tracking-wide uppercase">
            <span>Easwari Engineering College</span>
            <span aria-hidden="true">·</span>
            <span>Campus Facilities & Resource Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Academic Event & Resource Booking Portal
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            Streamlined reservation management for university seminar halls, high-performance computing labs, auditoriums, and smart lecture theaters with real-time mathematical conflict prevention.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/resources"
              className="px-6 py-3 rounded-xl bg-indigo-900 text-white text-xs sm:text-sm font-bold hover:bg-indigo-800 transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Explore Resource Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/calendar"
              className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Check Availability Schedule
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 text-xs text-slate-600">
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">0%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Double Bookings (Zero Conflict)</div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">11+</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Specialized Campus Venues</div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">100%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Role-Based Access Control</div>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[340px] lg:min-h-full">
          <img
            src="/src/assets/images/hero_academic_campus_1793023440205.jpg"
            alt="University Academic Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1">
              Main Campus Facility Hub
            </div>
            <div className="text-lg font-bold">
              Imperial Architecture & Research Quadrangle
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              Integrated booking scheduling across 6 academic departments and central university auditoriums.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Atomic Conflict Prevention</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Implements the strict half-open interval rule (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">startA &lt; endB &amp;&amp; endA &gt; startB</code>) with automatic changeover buffer periods and atomic concurrency protection.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Multi-Tier Approval Workflows</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deans and administrators review requests with purpose, expected attendees, and department scope. One-click approvals with server-side availability revalidation.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Live Institutional Calendar</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Interactive month and week schedule views give students, faculty, and administrators total transparency over reserved, pending, and available venue slots.
          </p>
        </div>
      </div>

      {/* Featured Venues Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Institutional Venues</h2>
            <p className="text-xs text-slate-500 mt-1">
              Discover executive seminar halls, high-performance computing clusters, and auditoriums.
            </p>
          </div>
          <Link
            to="/resources"
            className="text-xs font-bold text-indigo-900 hover:text-indigo-700 flex items-center gap-1.5"
          >
            <span>View All Resources</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredResources.map((resource) => (
            <div
              key={resource._id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={resource.imageUrl}
                    alt={resource.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="text-xs text-indigo-900 font-semibold mb-1">
                    {resource.location?.building}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-2">
                    {resource.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="font-semibold tabular-nums">{resource.capacity} Seats</span>
                    <span>{resource.operatingHours?.open} - {resource.operatingHours?.close}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0">
                <Link
                  to={`/resources/${resource._id}`}
                  className="w-full py-2 text-center block text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  View Venue Schedule
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
