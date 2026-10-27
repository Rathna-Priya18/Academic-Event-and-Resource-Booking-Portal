import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Clock,
  PlusCircle,
  FileText,
  Users,
  ShieldCheck,
  BarChart3,
  Bell,
  Settings,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const userNavItems = [
    { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Browse Resources', path: '/resources', icon: Layers },
    { label: 'Request Booking', path: '/bookings/new', icon: PlusCircle },
    { label: 'My Bookings', path: '/my-bookings', icon: Clock },
    { label: 'Campus Calendar', path: '/calendar', icon: Calendar },
    { label: 'Academic Events', path: '/events', icon: Sparkles },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile & Settings', path: '/profile', icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Booking Approvals', path: '/admin/approvals', icon: ShieldCheck },
    { label: 'Resource Registry', path: '/admin/resources', icon: Layers },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Schedule Calendar', path: '/admin/calendar', icon: Calendar },
    { label: 'Event Publisher', path: '/admin/events', icon: Sparkles },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Trail Logs', path: '/admin/audit-logs', icon: ClipboardList },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 overflow-y-auto">
          {/* Module Mode Tag */}
          <div className="mb-4 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isAdmin ? 'Administration Suite' : 'Requester Workspace'}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                isAdmin ? 'bg-indigo-100 text-indigo-900' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {user?.role || 'Guest'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/dashboard'}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-600">Easwari Engineering College</div>
          <div className="text-[10px]">Academic Resource Portal v1.0</div>
        </div>
      </aside>
    </>
  );
};
