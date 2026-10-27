import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { IResource } from '../../types';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Filter, SlidersHorizontal, Layers } from 'lucide-react';

export const BrowseResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<IResource[]>([]);
  const [meta, setMeta] = useState<{ buildings: string[]; categories: string[] }>({
    buildings: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [minCapacity, setMinCapacity] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (selectedBuilding !== 'all') params.append('building', selectedBuilding);
        if (minCapacity) params.append('minCapacity', minCapacity);
        if (activeOnly) params.append('activeOnly', 'true');

        const res = await api.get(`/resources?${params.toString()}`);
        if (res.success) {
          setResources(res.data);
          if (res.meta) setMeta(res.meta);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchResources();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedBuilding, minCapacity, activeOnly]);

  const categoryDisplayNames: Record<string, string> = {
    seminar_hall: 'Seminar Halls',
    classroom: 'Smart Classrooms',
    computer_lab: 'Computer Labs',
    science_lab: 'Science Labs',
    auditorium: 'Auditoriums',
    meeting_room: 'Boardrooms',
    projector: 'Projectors & AV',
    av_equipment: 'AV Equipment',
    other: 'Other Facilities',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus Resources & Venues
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore and reserve institutional halls, research laboratories, auditoriums, and media equipment.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hall name, room number, or equipment (e.g. Laser, GPU, 4K)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-800 font-medium"
          >
            <option value="all">All Categories</option>
            {meta.categories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryDisplayNames[cat] || cat}
              </option>
            ))}
          </select>

          {/* Building Dropdown */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full md:w-56 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-800 font-medium"
          >
            <option value="all">All Campus Buildings</option>
            {meta.buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Min Capacity */}
          <div className="w-full md:w-36 flex items-center">
            <input
              type="number"
              min="1"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              placeholder="Min Seats"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900 tabular-nums"
            />
          </div>
        </div>

        {/* Quick filter pills (functional button toggles) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Quick Category:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('seminar_hall')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedCategory === 'seminar_hall'
                    ? 'bg-indigo-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Seminar Halls
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('computer_lab')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedCategory === 'computer_lab'
                    ? 'bg-indigo-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Computer Labs
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('science_lab')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedCategory === 'science_lab'
                    ? 'bg-indigo-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Science Labs
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('auditorium')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedCategory === 'auditorium'
                    ? 'bg-indigo-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Auditoriums
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-900 focus:ring-indigo-900"
            />
            <span className="text-xs font-medium">Available Only (Exclude Maintenance)</span>
          </label>
        </div>
      </div>

      {/* Resource Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>
          Showing <span className="text-slate-900 font-bold tabular-nums">{resources.length}</span> institutional resources
        </span>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No resources match your search"
          description="Try broadening your search query or selecting a different department/building filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('all');
            setSelectedBuilding('all');
            setMinCapacity('');
            setActiveOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};
