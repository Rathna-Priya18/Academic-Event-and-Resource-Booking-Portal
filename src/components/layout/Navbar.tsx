import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  Calendar,
  LogOut,
  User,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, showSidebarToggle }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark (Single text element wordmark, single-line) */}
          <div className="flex items-center gap-3 shrink-0">
            {showSidebarToggle && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
                aria-label="Toggle navigation drawer"
              >
                <Layers className="w-5 h-5" />
              </button>
            )}
            <Link
              to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-black text-xs tracking-wider">
                EEC
              </div>
              <span>Easwari Resource Portal</span>
            </Link>
          </div>

          {/* Zone 2: Navigation Links (4-5 single-line clean links) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/resources" className="hover:text-indigo-900 transition-colors whitespace-nowrap shrink-0">
              Browse Resources
            </Link>
            <Link to="/calendar" className="hover:text-indigo-900 transition-colors whitespace-nowrap shrink-0">
              Campus Calendar
            </Link>
            <Link to="/events" className="hover:text-indigo-900 transition-colors whitespace-nowrap shrink-0">
              Academic Events
            </Link>
            {isAuthenticated && (
              <Link
                to={isAdmin ? '/admin/approvals' : '/my-bookings'}
                className="hover:text-indigo-900 transition-colors whitespace-nowrap shrink-0"
              >
                {isAdmin ? 'Booking Approvals' : 'My Bookings'}
              </Link>
            )}
          </nav>

          {/* Zone 3: Actions & Profile Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="font-semibold text-sm text-slate-900">
                          Notifications ({unreadCount})
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                if (!n.isRead) markAsRead(n._id);
                                if (n.actionUrl) {
                                  navigate(n.actionUrl);
                                  setShowNotifications(false);
                                }
                              }}
                              className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-indigo-50/50' : ''
                              }`}
                            >
                              <div className="font-semibold text-slate-900 mb-0.5">{n.title}</div>
                              <p className="text-slate-600 leading-normal">{n.message}</p>
                              <div className="mt-1 text-[10px] text-slate-400 tabular-nums">
                                {new Date(n.createdAt).toLocaleDateString()} ·{' '}
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="px-4 py-2 border-t border-slate-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs uppercase">
                      {user?.name.charAt(0) || 'U'}
                    </div>
                    <div className="hidden lg:block text-left text-xs">
                      <div className="font-semibold text-slate-900 truncate max-w-[130px]">{user?.name}</div>
                      <div className="text-slate-500 capitalize">{user?.role}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-semibold text-slate-900">{user?.name}</div>
                        <div className="text-slate-500 truncate">{user?.email}</div>
                        <div className="mt-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 inline-block px-1.5 py-0.5 rounded">
                          {user?.department}
                        </div>
                      </div>

                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <Shield className="w-4 h-4 text-indigo-700" />
                          <span>Admin Control Center</span>
                        </Link>
                      ) : (
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>User Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Profile & Security</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-900 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
