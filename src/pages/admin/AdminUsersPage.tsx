import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { IUser, UserRole, AccountStatus } from '../../types';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Mail,
  Building,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit user modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('active');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '50');

      const res = await api.get(`/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load user records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 200);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const handleOpenEdit = (u: IUser) => {
    setEditingUser(u);
    setRole(u.role);
    setAccountStatus(u.accountStatus);
    setDepartment(u.department);
    setDesignation(u.designation || '');
    setEditModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSaving(true);
      const res = await api.patch(`/users/${editingUser.id || (editingUser as any)._id}`, {
        role,
        accountStatus,
        department,
        designation,
      });

      if (res.success) {
        success(`User ${editingUser.name} updated.`);
        setEditModalOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u: IUser) => {
    const userId = u.id || (u as any)._id;
    try {
      const res = await api.patch(`/users/${userId}/status`);
      if (res.success) {
        success(`Account status for ${u.name} set to ${res.accountStatus}.`);
        fetchUsers();
      }
    } catch (err: any) {
      error(err.message || 'Could not toggle status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Directory & Access Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review registered scholars, faculty members, assign roles, and activate or suspend accounts.
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
              placeholder="Search user by name, email, or department..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-800 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="faculty">Faculty Member</option>
            <option value="student">Student Scholar</option>
            <option value="staff">Staff Member</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-900 text-slate-800 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="inactive">Suspended / Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Department & Title</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u: any) => (
                  <tr key={u._id || u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{u.department}</div>
                      <div className="text-[10px] text-slate-400">{u.designation || 'Scholar'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-indigo-900 text-white'
                            : u.role === 'faculty'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.accountStatus === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <UserCheck className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          <UserX className="w-3 h-3" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-500 text-[11px]">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            u.accountStatus === 'active'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Permissions"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modify User Roles & Permissions"
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div>
            <span className="text-slate-400">User: </span>
            <span className="font-bold text-slate-900">{editingUser?.name} ({editingUser?.email})</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role Permission</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900 font-semibold"
            >
              <option value="student">Student Scholar</option>
              <option value="faculty">Faculty Member</option>
              <option value="staff">Staff Member</option>
              <option value="admin">Institutional Administrator (Dean)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
            <select
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value as AccountStatus)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-900 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save User Access'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
