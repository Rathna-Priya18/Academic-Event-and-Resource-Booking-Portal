import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { IAuditLog } from '../../types';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ClipboardList,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const { error } = useToast();
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedAction !== 'all') params.append('action', selectedAction);
      if (selectedEntity !== 'all') params.append('entityType', selectedEntity);
      params.append('limit', '50');

      const res = await api.get(`/audit-logs?${params.toString()}`);
      if (res.success) {
        setLogs(res.data);
        if (res.meta?.actions) setActions(res.meta.actions);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchAuditLogs, 200);
    return () => clearTimeout(timer);
  }, [search, selectedAction, selectedEntity]);

  const getActionColor = (action: string) => {
    if (action.includes('APPROVE')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (action.includes('REJECT') || action.includes('DELETE'))
      return 'bg-rose-50 text-rose-800 border-rose-200';
    if (action.includes('CREATE') || action.includes('REGISTER'))
      return 'bg-indigo-50 text-indigo-900 border-indigo-200';
    if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-800 border-blue-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Security & Audit Log Records
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Immutable audit trails of booking approvals, status overrides, facility creation, and authentication events.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit descriptions, user emails, or entity IDs..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full md:w-56 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-800 font-medium"
          >
            <option value="all">All Actions</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full md:w-44 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-800 font-medium"
          >
            <option value="all">All Entity Types</option>
            <option value="Booking">Booking</option>
            <option value="Resource">Resource</option>
            <option value="User">User</option>
            <option value="Event">Event</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <TableSkeleton rows={10} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit entries"
          description="No security or system records found for the current query."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Actor Email & Role</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Event Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 tabular-nums text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.actorEmail}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{log.entityType}</span>
                      {log.entityId && (
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-[100px]">
                          {log.entityId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
