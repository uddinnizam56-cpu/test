import React, { useState } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  Sparkles,
  Building2,
} from 'lucide-react';
import { CleanupDrive, Language } from '../../types';

interface AdminDrivesTabProps {
  cleanupDrives: CleanupDrive[];
  language: Language;
  onCreateCleanupDrive?: (drive: CleanupDrive) => void;
  onUpdateCleanupDrive?: (driveId: string, updated: Partial<CleanupDrive>) => void;
  onDeleteCleanupDrive?: (driveId: string) => void;
}

export const AdminDrivesTab: React.FC<AdminDrivesTabProps> = ({
  cleanupDrives,
  language,
  onCreateCleanupDrive,
  onUpdateCleanupDrive,
  onDeleteCleanupDrive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<CleanupDrive | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [date, setDate] = useState('Saturday, Aug 15, 2026');
  const [time, setTime] = useState('09:00 AM - 01:00 PM');
  const [locationHub, setLocationHub] = useState('');
  const [targetCategory, setTargetCategory] = useState('E-Waste & Scrap Metal');
  const [targetCategoryIcon, setTargetCategoryIcon] = useState('💻');
  const [maxSlots, setMaxSlots] = useState(150);
  const [expectedKg, setExpectedKg] = useState(2000);
  const [bonusPoints, setBonusPoints] = useState(100);
  const [status, setStatus] = useState<CleanupDrive['status']>('upcoming');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80');
  const [description, setDescription] = useState('');

  const filtered = cleanupDrives.filter((d) => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.locality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenAdd = () => {
    setTitle('');
    setOrganizer('PunarChakra & Ward RWA');
    setLocality('Indiranagar');
    setCity('Bengaluru');
    setDate('Saturday, Aug 15, 2026');
    setTime('09:00 AM - 01:00 PM');
    setLocationHub('BDA Complex Grounds');
    setTargetCategory('E-Waste & Scrap Metal');
    setTargetCategoryIcon('💻');
    setMaxSlots(150);
    setExpectedKg(2000);
    setBonusPoints(100);
    setStatus('upcoming');
    setImage('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80');
    setDescription('Community scrap collection drive with dedicated EV collection vehicles and digital weighing scales.');
    setAddModalOpen(true);
  };

  const handleOpenEdit = (d: CleanupDrive) => {
    setSelectedDrive(d);
    setTitle(d.title);
    setOrganizer(d.organizer);
    setLocality(d.locality);
    setCity(d.city);
    setDate(d.date);
    setTime(d.time);
    setLocationHub(d.locationHub);
    setTargetCategory(d.targetCategory);
    setTargetCategoryIcon(d.targetCategoryIcon);
    setMaxSlots(d.maxSlots);
    setExpectedKg(d.expectedKg);
    setBonusPoints(d.bonusPoints);
    setStatus(d.status);
    setImage(d.image);
    setDescription(d.description);
    setEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !locality || !locationHub) return;
    const newDrive: CleanupDrive = {
      id: `d_${Date.now()}`,
      title,
      organizer,
      locality,
      city,
      date,
      time,
      locationHub,
      targetCategory,
      targetCategoryIcon,
      participantsCount: 0,
      maxSlots: Number(maxSlots),
      expectedKg: Number(expectedKg),
      bonusPoints: Number(bonusPoints),
      status,
      joined: false,
      image,
      description,
    };
    if (onCreateCleanupDrive) {
      onCreateCleanupDrive(newDrive);
    }
    setAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrive || !title) return;
    if (onUpdateCleanupDrive) {
      onUpdateCleanupDrive(selectedDrive.id, {
        title,
        organizer,
        locality,
        city,
        date,
        time,
        locationHub,
        targetCategory,
        targetCategoryIcon,
        maxSlots: Number(maxSlots),
        expectedKg: Number(expectedKg),
        bonusPoints: Number(bonusPoints),
        status,
        image,
        description,
      });
    }
    setEditModalOpen(false);
    setSelectedDrive(null);
  };

  const handleConfirmDelete = (id: string) => {
    if (onDeleteCleanupDrive) {
      onDeleteCleanupDrive(id);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-teal-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-wider border border-teal-500/30 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              Community Recycling Drives
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Neighborhood & Tech Park Drives</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white">
            Community Drives & Society Events Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Schedule new scrap collection drives, update meeting hubs, set volunteer capacity, grant bonus Eco Reward points, and mark drives completed.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Drive</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {(['all', 'upcoming', 'live', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg transition-all capitalize whitespace-nowrap ${
                statusFilter === s ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search drive by title, society, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-40 bg-slate-100 overflow-hidden">
              <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-black uppercase">
                  {d.targetCategoryIcon} {d.targetCategory}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    d.status === 'upcoming'
                      ? 'bg-amber-400 text-slate-950'
                      : d.status === 'live'
                      ? 'bg-emerald-500 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {d.status}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] text-teal-300 font-bold block">{d.organizer}</span>
                <h4 className="font-black text-sm text-white line-clamp-1">{d.title}</h4>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 text-xs">
              <p className="text-slate-600 line-clamp-2">{d.description}</p>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Time</span>
                  <span className="font-extrabold text-slate-900 truncate block">{d.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Meeting Hub</span>
                  <span className="font-extrabold text-slate-900 truncate block">{d.locationHub}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Volunteers</span>
                  <span className="font-extrabold text-slate-800">
                    {d.participantsCount} / {d.maxSlots} Slots
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Weight</span>
                  <span className="font-extrabold text-teal-700">{d.expectedKg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Reward</span>
                  <span className="font-black text-amber-600">+{d.bonusPoints} Pts</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(d)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirmId(d.id)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          ADD CLEANUP DRIVE MODAL
          ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Schedule Community Drive</h3>
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
                <label className="font-bold text-slate-700 block mb-1">Drive Title</label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar Zero-Waste Weekend Cleanathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Organizer</label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Locality</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mysuru">Mysuru</option>
                    <option value="Mangaluru">Mangaluru</option>
                    <option value="Hubballi">Hubballi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location Hub / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. BDA Complex Parking Grounds, Indiranagar"
                  value={locationHub}
                  onChange={(e) => setLocationHub(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Volunteers</label>
                  <input
                    type="number"
                    value={maxSlots}
                    onChange={(e) => setMaxSlots(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Kg</label>
                  <input
                    type="number"
                    value={expectedKg}
                    onChange={(e) => setExpectedKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bonus Eco Pts</label>
                  <input
                    type="number"
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md"
                >
                  Schedule Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT CLEANUP DRIVE MODAL
          ========================================================================= */}
      {editModalOpen && selectedDrive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Edit Community Drive</h3>
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
                <label className="font-bold text-slate-700 block mb-1">Drive Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Category</label>
                  <input
                    type="text"
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meeting Location</label>
                <input
                  type="text"
                  value={locationHub}
                  onChange={(e) => setLocationHub(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Slots</label>
                  <input
                    type="number"
                    value={maxSlots}
                    onChange={(e) => setMaxSlots(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Kg</label>
                  <input
                    type="number"
                    value={expectedKg}
                    onChange={(e) => setExpectedKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bonus Eco Pts</label>
                  <input
                    type="number"
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md"
                >
                  Update Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE DRIVE MODAL
          ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">Delete Community Drive</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently cancel and remove this community drive event?
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
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
