import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight } from 'lucide-react';

export const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Generate breadcrumb trail
  const pathnames = location.pathname.split('/').filter((x) => x);

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password');

  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        showSidebarToggle={showSidebar}
      />

      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          className={`flex-1 transition-all duration-200 ${
            showSidebar ? 'lg:pl-64' : ''
          } flex flex-col min-w-0`}
        >
          {showSidebar && pathnames.length > 0 && (
            <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 flex items-center text-xs text-slate-500">
              <Link to="/dashboard" className="hover:text-indigo-900 font-medium">
                Home
              </Link>
              {pathnames.map((segment, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const formattedName = segment
                  .replace(/-/g, ' ')
                  .replace(/^[a-z]/, (c) => c.toUpperCase());

                return (
                  <React.Fragment key={to}>
                    <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 shrink-0" />
                    {isLast ? (
                      <span className="font-semibold text-slate-800 truncate">{formattedName}</span>
                    ) : (
                      <Link to={to} className="hover:text-indigo-900 truncate">
                        {formattedName}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children || <Outlet />}
          </div>

          <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-8 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                © {new Date().getFullYear()} Easwari Engineering College. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-slate-500">
                <Link to="/resources" className="hover:text-slate-800">Resource Catalog</Link>
                <Link to="/calendar" className="hover:text-slate-800">Campus Calendar</Link>
                <Link to="/events" className="hover:text-slate-800">Events Board</Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
