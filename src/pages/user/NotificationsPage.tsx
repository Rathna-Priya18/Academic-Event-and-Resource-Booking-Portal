import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'booking_rejected':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'booking_cancelled':
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
      case 'booking_submitted':
        return <Info className="w-5 h-5 text-indigo-600" />;
      case 'event_published':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System announcements, booking status changes, and administrative actions.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are completely caught up! New reservation updates and announcements will appear here."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markAsRead(n._id);
                if (n.actionUrl) navigate(n.actionUrl);
              }}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                !n.isRead ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className="shrink-0 mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()} ·{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.actionUrl && (
                  <span className="mt-2 inline-block text-[11px] font-bold text-indigo-900 hover:underline">
                    View Associated Record →
                  </span>
                )}
              </div>
              {!n.isRead && (
                <div className="shrink-0 self-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 block" title="Unread" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotificationsPage;
