import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function AccountPage() {
  const { user, authFetch, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form state
  const [profile, setProfile] = useState({
    full_name: '',
    organization: '',
    role: '',
    phone: '',
    location: '',
    bio: '',
    notify_critical: true,
    notify_high: true,
    notify_medium: false,
    notify_low: false,
    default_sector_filter: '',
  });

  // Password change state
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Watchlist state
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // Status messages
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // Fetch full user profile & preferences
  const fetchProfile = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/users/me/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          full_name: data.full_name || '',
          organization: data.organization || '',
          role: data.role || '',
          phone: data.phone || '',
          location: data.profile?.location || '',
          bio: data.profile?.bio || '',
          notify_critical: data.profile?.notify_critical ?? true,
          notify_high: data.profile?.notify_high ?? true,
          notify_medium: data.profile?.notify_medium ?? false,
          notify_low: data.profile?.notify_low ?? false,
          default_sector_filter: data.profile?.default_sector_filter || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  }, [authFetch]);

  // Fetch watchlist
  const fetchWatchlist = useCallback(async () => {
    setLoadingWatchlist(true);
    try {
      const res = await authFetch(`${API_BASE}/api/users/me/watchlist`);
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data || []);
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoadingWatchlist(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchProfile();
    fetchWatchlist();
  }, [fetchProfile, fetchWatchlist]);

  // Handle profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const res = await authFetch(`${API_BASE}/api/users/me/profile`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update profile.');
      setStatusMessage({ type: 'success', text: 'Profile preferences updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.new_password.length < 8) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const res = await authFetch(`${API_BASE}/api/users/me/password`, {
        method: 'PUT',
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to change password.');
      setStatusMessage({ type: 'success', text: 'Password changed successfully! Please sign in again on next session.' });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Remove project from watchlist
  const handleRemoveWatchlist = async (projectId) => {
    try {
      const res = await authFetch(`${API_BASE}/api/users/me/watchlist/${projectId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWatchlist(prev => prev.filter(item => item.project_id !== projectId));
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  return (
    <div className="w-full px-4 lg:px-8 py-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xl font-bold shadow-sm">
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'PR'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.full_name || 'My Account'}</h1>
            <p className="text-sm text-gray-500">{user?.email} • {profile.role || user?.role || 'Infrastructure Official'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mt-6 gap-8 text-sm font-semibold">
        <button
          onClick={() => { setActiveTab('profile'); setStatusMessage({ type: '', text: '' }); }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile' ? 'border-[#0A2540] text-[#0A2540]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">badge</span>
          Profile & Organization
        </button>
        <button
          onClick={() => { setActiveTab('notifications'); setStatusMessage({ type: '', text: '' }); }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'notifications' ? 'border-[#0A2540] text-[#0A2540]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">notifications</span>
          Alert Preferences
        </button>
        <button
          onClick={() => { setActiveTab('watchlist'); setStatusMessage({ type: '', text: '' }); }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'watchlist' ? 'border-[#0A2540] text-[#0A2540]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">bookmark</span>
          My Watchlist ({watchlist.length})
        </button>
        <button
          onClick={() => { setActiveTab('security'); setStatusMessage({ type: '', text: '' }); }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'security' ? 'border-[#0A2540] text-[#0A2540]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">lock</span>
          Security & Password
        </button>
      </div>

      {/* Status Feedback banner */}
      {statusMessage.text && (
        <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {statusMessage.text}
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-6">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.full_name}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Ministry / Organisation</label>
                <input
                  type="text"
                  placeholder="e.g. NHAI, MoRTH, PMO"
                  value={profile.organization}
                  onChange={e => setProfile({ ...profile, organization: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Official Role</label>
                <input
                  type="text"
                  placeholder="e.g. Director, Chief Engineer, Analyst"
                  value={profile.role}
                  onChange={e => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Posting Location / State</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                  value={profile.location}
                  onChange={e => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Bio / Responsibility Brief</label>
              <textarea
                rows="3"
                placeholder="Brief summary of infrastructure portfolios under monitoring..."
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0A2540] hover:bg-[#12365a] text-white font-semibold rounded-lg shadow-sm text-sm transition-colors"
              >
                {saving ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Project Risk Threshold Notifications</h2>
              <p className="text-xs text-gray-500 mt-1">Configure which risk level triggers appear in your priority monitoring alerts.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.notify_critical}
                  onChange={e => setProfile({ ...profile, notify_critical: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <div>
                  <div className="text-sm font-semibold text-red-900">Critical Risk Level (Immediate Action)</div>
                  <div className="text-xs text-red-700">Litigation stay orders, environmental stops, critical contractor stalls.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.notify_high}
                  onChange={e => setProfile({ ...profile, notify_high: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <div>
                  <div className="text-sm font-semibold text-amber-900">High Risk Level (Needs Attention)</div>
                  <div className="text-xs text-amber-700">Land acquisition disputes, fund disbursement lags, Right-of-Way slippages.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.notify_medium}
                  onChange={e => setProfile({ ...profile, notify_medium: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-semibold text-blue-900">Medium Risk Level (Monitoring)</div>
                  <div className="text-xs text-blue-700">Minor contractor mobilization delays, pending routine utility shift approvals.</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0A2540] hover:bg-[#12365a] text-white font-semibold rounded-lg shadow-sm text-sm transition-colors"
              >
                {saving ? 'Updating preferences...' : 'Save Notification Preferences'}
              </button>
            </div>
          </form>
        )}

        {/* WATCHLIST TAB */}
        {activeTab === 'watchlist' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Saved Project Watchlist</h2>
                <p className="text-xs text-gray-500">Quick-access pinned projects you are tracking closely.</p>
              </div>
              <Link
                to="/projects"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Browse More Projects
              </Link>
            </div>

            {loadingWatchlist ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading watchlist...</div>
            ) : watchlist.length === 0 ? (
              <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <span className="material-symbols-outlined text-3xl mb-2 text-gray-300">bookmark_border</span>
                <p className="text-sm font-medium text-gray-600">No projects added to your watchlist yet.</p>
                <p className="text-xs text-gray-400 mt-1">Open any project in the Dashboard or Projects view and click 'Track' to save here.</p>
                <Link
                  to="/projects"
                  className="mt-4 inline-block px-4 py-2 bg-[#0A2540] text-white text-xs font-semibold rounded-lg"
                >
                  View All Projects
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {watchlist.map(item => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                          {item.project_id}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.project_name || 'Project Details'}
                        </span>
                      </div>
                      {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/projects`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleRemoveWatchlist(item.project_id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 max-w-lg">
            <div>
              <h2 className="text-base font-bold text-gray-900">Change Account Password</h2>
              <p className="text-xs text-gray-500 mt-1">Ensure your password is at least 8 characters long.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Current Password</label>
              <input
                type="password"
                required
                value={passwords.current_password}
                onChange={e => setPasswords({ ...passwords, current_password: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">New Password</label>
              <input
                type="password"
                required
                value={passwords.new_password}
                onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirm_password}
                onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0A2540] hover:bg-[#12365a] text-white font-semibold rounded-lg shadow-sm text-sm transition-colors"
              >
                {saving ? 'Updating password...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
