"use client";

import { useState } from "react";
import { Users, UserPlus, Shield, Trash2, Edit2, Check, X, Mail } from "lucide-react";
import { toast } from "react-hot-toast";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Booker" | "Viewer";
  bookingLimit: number;
  spentThisMonth: number;
  status: "Active" | "Pending";
};

export default function B2BTeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Booker" as any, bookingLimit: 50000 });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TeamMember>>({});

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error("Name and Email are required");
      return;
    }
    
    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      spentThisMonth: 0,
      status: "Pending"
    };
    
    setMembers([...members, member]);
    setIsAddingMode(false);
    setNewMember({ name: "", email: "", role: "Booker", bookingLimit: 50000 });
    toast.success(`Invitation sent to ${member.email}`);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    toast.success("Team member removed");
  };

  const startEditing = (member: TeamMember) => {
    setEditingId(member.id);
    setEditData(member);
  };

  const saveEditing = () => {
    if (!editData.name || !editData.email) {
      toast.error("Name and email are required");
      return;
    }
    setMembers(members.map(m => m.id === editingId ? { ...m, ...editData } as TeamMember : m));
    setEditingId(null);
    toast.success("Team member updated");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">Team Management</h1>
          <p className="text-[var(--text-secondary)]">Manage your corporate users, assign roles, and set monthly booking limits.</p>
        </div>
        {!isAddingMode && (
          <button 
            onClick={() => setIsAddingMode(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add Team Member
          </button>
        )}
      </div>

      {isAddingMode && (
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-outline)] mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Invite New Member
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Full Name</label>
              <input 
                type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})}
                placeholder="Jane Doe"
                className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Email Address</label>
              <input 
                type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})}
                placeholder="jane@company.com"
                className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Role</label>
              <select 
                value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value as any})}
                className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-[var(--text-primary)] appearance-none"
              >
                <option value="Admin">Admin (Full Access)</option>
                <option value="Booker">Booker (Can Book)</option>
                <option value="Viewer">Viewer (Read Only)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Monthly Limit (₹)</label>
              <input 
                type="number" value={newMember.bookingLimit} onChange={e => setNewMember({...newMember, bookingLimit: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-outline)]">
            <button 
              onClick={() => setIsAddingMode(false)}
              className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddMember}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-opacity text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Send Invitation
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-outline)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-outline)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Team Member</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Usage vs Limit</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-outline)]">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-base font-semibold text-[var(--text-primary)]">No team members yet</p>
                      <p className="text-sm mt-1">Click "Add Team Member" to invite your colleagues.</p>
                    </div>
                  </td>
                </tr>
              ) : members.map((member) => (
                editingId === member.id ? (
                  <tr key={member.id} className="bg-orange-50/10 dark:bg-orange-500/5">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" value={editData.name || ""} 
                          onChange={e => setEditData({...editData, name: e.target.value})}
                          className="px-3 py-1.5 text-sm border border-[var(--border-input)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-orange-500"
                          placeholder="Name"
                        />
                        <input 
                          type="email" value={editData.email || ""} 
                          onChange={e => setEditData({...editData, email: e.target.value})}
                          className="px-3 py-1.5 text-sm border border-[var(--border-input)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-orange-500"
                          placeholder="Email"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={editData.role} 
                        onChange={e => setEditData({...editData, role: e.target.value as any})}
                        className="px-3 py-2 text-sm border border-[var(--border-input)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-orange-500"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Booker">Booker</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-secondary)]">₹</span>
                        <input 
                          type="number" value={editData.bookingLimit || 0} 
                          onChange={e => setEditData({...editData, bookingLimit: parseInt(e.target.value) || 0})}
                          className="w-24 px-3 py-1.5 text-sm border border-[var(--border-input)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={editData.status} 
                        onChange={e => setEditData({...editData, status: e.target.value as any})}
                        className="px-3 py-2 text-sm border border-[var(--border-input)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-orange-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={saveEditing} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title="Save">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" title="Cancel">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={member.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{member.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 w-max
                        ${member.role === 'Admin' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 
                          member.role === 'Booker' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 
                          'bg-slate-500/10 text-slate-600 dark:text-slate-400'}`}
                      >
                        {member.role === 'Admin' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-48">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[var(--text-primary)]">₹{member.spentThisMonth.toLocaleString()}</span>
                          <span className="text-[var(--text-muted)]">/ ₹{member.bookingLimit.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-[var(--border-outline)] rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (member.spentThisMonth / member.bookingLimit) > 0.9 ? 'bg-red-500' :
                              (member.spentThisMonth / member.bookingLimit) > 0.75 ? 'bg-amber-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${Math.min(100, (member.spentThisMonth / member.bookingLimit) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg
                        ${member.status === 'Active' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => startEditing(member)}
                          className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Member"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removeMember(member.id)}
                          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
