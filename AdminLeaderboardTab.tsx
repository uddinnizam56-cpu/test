import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Plus,
  Trash2,
  Edit2,
  Search,
  MapPin,
  Sparkles,
  Heart,
  AlertTriangle,
  X,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { LeaderboardUser, Language } from '../../types';

interface AdminLeaderboardTabProps {
  leaderboardUsers: LeaderboardUser[];
  language: Language;
  onCreateLeaderboardUser?: (user: LeaderboardUser) => void;
  onUpdateLeaderboardUser?: (userId: string, updated: Partial<LeaderboardUser>) => void;
  onDeleteLeaderboardUser?: (userId: string) => void;
}

export const AdminLeaderboardTab: React.FC<AdminLeaderboardTabProps> = ({
  leaderboardUsers,
  language,
  onCreateLeaderboardUser,
  onUpdateLeaderboardUser,
  onDeleteLeaderboardUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formLocality, setFormLocality] = useState('');
  const [formCity, setFormCity] = useState('Bengaluru');
  const [formTotalKg, setFormTotalKg] = useState(250);
  const [formPoints, setFormPoints] = useState(1800);
  const [formCo2SavedKg, setFormCo2SavedKg] = useState(620);
  const [formBadgeTitle, setFormBadgeTitle] = useState('Green Crusader 🌿');
  const [formAvatar, setFormAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  const [formCheers, setFormCheers] = useState(45);

  const CITIES = ['All', 'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi'];

  const filtered = leaderboardUsers.filter((u) => {
    const matchesCity = selectedCity === 'All' || u.city === selectedCity;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.locality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormLocality('Indiranagar');
    setFormCity('Bengaluru');
    setFormTotalKg(250);
    setFormPoints(1800);
    setFormCo2SavedKg(620);
    setFormBadgeTitle('Eco Champion 🌿');
    setFormAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');
    setFormCheers(25);
    setAddModalOpen(true);
  };

  const handleOpenEdit = (u: LeaderboardUser) => {
    setSelectedUser(u);
    setFormName(u.name);
    setFormLocality(u.locality);
    setFormCity(u.city);
    setFormTotalKg(u.totalKg);
    setFormPoints(u.points);
    setFormCo2SavedKg(u.co2SavedKg);
    setFormBadgeTitle(u.badgeTitle);
    setFormAvatar(u.avatar);
    setFormCheers(u.cheers);
    setEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLocality) return;
    const newUser: LeaderboardUser = {
      id: `lb_${Date.now()}`,
      rank: leaderboardUsers.length + 1,
      name: formName,
      avatar: formAvatar,
      locality: formLocality,
      city: formCity,
      totalKg: Number(formTotalKg),
      points: Number(formPoints),
      co2SavedKg: Number(formCo2SavedKg),
      badgeTitle: formBadgeTitle,
      cheers: Number(formCheers),
    };
    if (onCreateLeaderboardUser) {
      onCreateLeaderboardUser(newUser);
    }
    setAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !formName) return;
    if (onUpdateLeaderboardUser) {
      onUpdateLeaderboardUser(selectedUser.id, {
        name: formName,
        locality: formLocality,
        city: formCity,
        totalKg: Number(formTotalKg),
        points: Number(formPoints),
        co2SavedKg: Number(formCo2SavedKg),
        badgeTitle: formBadgeTitle,
        avatar: formAvatar,
        cheers: Number(formCheers),
      });
    }
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = (id: string) => {
    if (onDeleteLeaderboardUser) {
      onDeleteLeaderboardUser(id);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 text-white p-6 rounded-3xl shadow-xl border border-amber-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Eco Champions Roster
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Monthly Sustainability League</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white">
            Eco Leaderboard Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Add new recycling champions, adjust recycling kg weights, modify badges, and remove inactive or fraudulent leaderboard entries across cities.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leaderboard Champion</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                  selectedCity === c ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search champion by name or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Champion</th>
                <th className="py-3 px-4">City & Locality</th>
                <th className="py-3 px-4">Scrap Recycled</th>
                <th className="py-3 px-4">Eco Points</th>
                <th className="py-3 px-4">CO₂ Prevented</th>
                <th className="py-3 px-4">Badge Title</th>
                <th className="py-3 px-4">Community Cheers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filtered.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-3.5 px-4">
                    <span
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-black text-slate-900 block">{u.name}</span>
                        {u.isCurrentUser && (
                          <span className="text-[10px] text-emerald-600 font-bold">Logged In User</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span>{u.locality}, {u.city}</span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">{u.totalKg} kg</td>
                  <td className="py-3.5 px-4 font-black text-emerald-600">{u.points} Pts</td>
                  <td className="py-3.5 px-4 text-slate-600 font-bold">{u.co2SavedKg} kg</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-extrabold">
                      {u.badgeTitle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-rose-600 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{u.cheers}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        title="Edit champion"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete from leaderboard"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          ADD LEADERBOARD CHAMPION MODAL
          ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 font-display">Add Leaderboard Champion</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recycler Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nandini Murthy"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Locality / Ward</label>
                  <input
                    type="text"
                    placeholder="e.g. Malleshwaram"
                    value={formLocality}
                    onChange={(e) => setFormLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mysuru">Mysuru</option>
                    <option value="Mangaluru">Mangaluru</option>
                    <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
                    <option value="Belagavi">Belagavi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Kg</label>
                  <input
                    type="number"
                    value={formTotalKg}
                    onChange={(e) => setFormTotalKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Eco Points</label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CO₂ Kg Saved</label>
                  <input
                    type="number"
                    value={formCo2SavedKg}
                    onChange={(e) => setFormCo2SavedKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-teal-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Badge Title</label>
                <input
                  type="text"
                  placeholder="e.g. Zero-Waste Pioneer 👑"
                  value={formBadgeTitle}
                  onChange={(e) => setFormBadgeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Avatar Photo URL</label>
                <input
                  type="url"
                  value={formAvatar}
                  onChange={(e) => setFormAvatar(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black shadow-md"
                >
                  Add Champion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT LEADERBOARD CHAMPION MODAL
          ========================================================================= */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 font-display">Edit Leaderboard Champion</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recycler Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Locality</label>
                  <input
                    type="text"
                    value={formLocality}
                    onChange={(e) => setFormLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mysuru">Mysuru</option>
                    <option value="Mangaluru">Mangaluru</option>
                    <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
                    <option value="Belagavi">Belagavi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Kg</label>
                  <input
                    type="number"
                    value={formTotalKg}
                    onChange={(e) => setFormTotalKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Eco Points</label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CO₂ Kg Saved</label>
                  <input
                    type="number"
                    value={formCo2SavedKg}
                    onChange={(e) => setFormCo2SavedKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-teal-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Badge Title</label>
                <input
                  type="text"
                  value={formBadgeTitle}
                  onChange={(e) => setFormBadgeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cheers Count</label>
                  <input
                    type="number"
                    value={formCheers}
                    onChange={(e) => setFormCheers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Avatar Photo URL</label>
                  <input
                    type="url"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md"
                >
                  Update Champion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE LEADERBOARD USER MODAL
          ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">Remove from Leaderboard</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this recycler from the public eco leaderboard?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
