import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  Trophy,
  TreePine,
  Truck,
  PlusCircle,
  Share2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Flame,
  X,
  Send,
  Leaf,
  Coins,
} from 'lucide-react';
import { UserProfile, Language, CleanupDrive } from '../../types';
import { translations } from '../../utils/translations';

interface CommunityCleanupProps {
  userProfile: UserProfile;
  language: Language;
  drives?: CleanupDrive[];
  onUpdateDrives?: (drives: CleanupDrive[]) => void;
}

const INITIAL_DRIVES: CleanupDrive[] = [
  {
    id: 'd1',
    title: 'Indiranagar Zero-Waste Weekend Scrap Mega Drive',
    organizer: 'Indiranagar RWA & PunarChakra',
    locality: 'Indiranagar 100ft Road Ward 80',
    city: 'Bengaluru',
    date: 'Saturday, Aug 8, 2026',
    time: '08:30 AM - 01:00 PM',
    locationHub: 'BDA Complex Parking Grounds, Indiranagar',
    targetCategory: 'E-Waste & Heavy Metal Scrap',
    targetCategoryIcon: '💻',
    participantsCount: 84,
    maxSlots: 120,
    expectedKg: 1500,
    bonusPoints: 100,
    status: 'upcoming',
    joined: false,
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    description: 'Bring all old electronics, copper wiring, appliances, and iron scrap. Free EV truck doorstep pickup for elderly residents within 2km radius!',
  },
  {
    id: 'd2',
    title: 'Koramangala Green Society Bulk Cardboard & Paper Cleanathon',
    organizer: 'Koramangala Youth Green Club',
    locality: 'Koramangala 4th Block',
    city: 'Bengaluru',
    date: 'Sunday, Aug 9, 2026',
    time: '09:00 AM - 02:00 PM',
    locationHub: 'Koramangala BBMP Community Park Gate 2',
    targetCategory: 'Corrugated Boxes & Books',
    targetCategoryIcon: '📦',
    participantsCount: 112,
    maxSlots: 150,
    expectedKg: 2200,
    bonusPoints: 75,
    status: 'upcoming',
    joined: true,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    description: 'Clear out old textbooks, packaging cartons, and old newspapers. All proceeds go toward planting native avenue trees in Ward 151.',
  },
  {
    id: 'd3',
    title: 'Whitefield Tech Park E-Waste & Appliance Collection',
    organizer: 'Whitefield Rising Eco Brigade',
    locality: 'Whitefield Main Rd',
    city: 'Bengaluru',
    date: 'Wednesday, Aug 12, 2026',
    time: '10:00 AM - 04:00 PM',
    locationHub: 'ITPL Main Gate Visitor Pavilion',
    targetCategory: 'Computers, Laptops & Batteries',
    targetCategoryIcon: '🔋',
    participantsCount: 145,
    maxSlots: 200,
    expectedKg: 3100,
    bonusPoints: 120,
    status: 'upcoming',
    joined: false,
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    description: 'Drop off retired office electronics, broken monitors, cables, and battery backups safely with certified e-waste recyclers.',
  },
  {
    id: 'd4',
    title: 'Jayanagar Heritage Neighborhood Scrap Drive',
    organizer: 'Jayanagar Eco Foundation',
    locality: 'Jayanagar 4th T Block',
    city: 'Bengaluru',
    date: 'Sunday, Aug 2, 2026',
    time: 'Completed',
    locationHub: 'Shalini Grounds, Jayanagar',
    targetCategory: 'Mixed Domestic Metals & Bottles',
    targetCategoryIcon: '🍾',
    participantsCount: 198,
    maxSlots: 200,
    expectedKg: 2850,
    bonusPoints: 100,
    status: 'completed',
    joined: true,
    image: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
    description: 'Community drive successfully diverted 2,850 kg scrap from landfills and funded 40 new solar street lamps for the locality.',
  },
];

export const CommunityCleanup: React.FC<CommunityCleanupProps> = ({
  userProfile,
  language,
  drives: parentDrives,
  onUpdateDrives,
}) => {
  const t = translations[language];
  const [drives, setDrives] = useState<CleanupDrive[]>(parentDrives || INITIAL_DRIVES);
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [filterTab, setFilterTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [rsvpToast, setRsvpToast] = useState<string | null>(null);
  const [organizeModalOpen, setOrganizeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (parentDrives) {
      setDrives(parentDrives);
    }
  }, [parentDrives]);

  // Organize Drive Form Inputs
  const [societyName, setSocietyName] = useState('');
  const [localityName, setLocalityName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [expectedHouses, setExpectedHouses] = useState('50-100');
  const [organizeSubmitted, setOrganizeSubmitted] = useState(false);

  const handleToggleJoin = (driveId: string) => {
    setDrives((prev) => {
      const next = prev.map((d) => {
        if (d.id === driveId) {
          const nextJoined = !d.joined;
          const delta = nextJoined ? 1 : -1;
          const driveTitle = d.title;

          setRsvpToast(
            nextJoined
              ? `RSVP Confirmed for "${driveTitle}"! +${d.bonusPoints} Eco Reward Points added.`
              : `Cancelled RSVP for "${driveTitle}".`
          );

          setTimeout(() => setRsvpToast(null), 4000);

          return {
            ...d,
            joined: nextJoined,
            participantsCount: d.participantsCount + delta,
          };
        }
        return d;
      });
      if (onUpdateDrives) {
        onUpdateDrives(next);
      }
      return next;
    });
  };

  const handleOrganizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!societyName || !localityName || !contactPhone) return;

    setOrganizeSubmitted(true);
    setTimeout(() => {
      setOrganizeSubmitted(false);
      setOrganizeModalOpen(false);
      setSocietyName('');
      setLocalityName('');
      setContactPhone('');
      setRsvpToast('Drive request submitted! PunarChakra logistics officer will contact you within 24 hours to schedule EV scrap trucks.');
      setTimeout(() => setRsvpToast(null), 5000);
    }, 1500);
  };

  const filteredDrives = drives.filter(
    (d) => d.city === selectedCity && d.status === filterTab
  );

  // Aggregated Community Stats
  const totalKgDiverted = 14280;
  const totalVolunteers = 1840;
  const co2PreventedTons = 38.5;
  const communityFundsRaised = '₹1,45,000';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {rsvpToast && (
        <div className="p-4 bg-emerald-900 text-white rounded-2xl shadow-xl border border-emerald-700 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-extrabold text-xs sm:text-sm">{rsvpToast}</span>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5 w-fit">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Community Recycling Action Hub
            </span>

            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              Local Neighborhood Collection Drives
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join scheduled group scrap collection drives in your ward, apartment society, or tech park. Earn extra Eco Reward Points while keeping Karnataka clean!
            </p>
          </div>

          <button
            onClick={() => setOrganizeModalOpen(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg flex items-center gap-2 shrink-0 border border-emerald-300"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Organize Drive in My Locality</span>
          </button>
        </div>

        {/* Community Impact Metrics Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Scrap Diverted</span>
            <span className="text-lg sm:text-2xl font-black text-white font-display mt-0.5 block">
              {totalKgDiverted.toLocaleString()} kg
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">From City Landfills</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Volunteers</span>
            <span className="text-lg sm:text-2xl font-black text-white font-display mt-0.5 block">
              {totalVolunteers.toLocaleString()} Households
            </span>
            <span className="text-[10px] text-teal-400 font-semibold">Across 42 Wards</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">CO₂ Emissions Avoided</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-400 font-display mt-0.5 block">
              {co2PreventedTons} Tons
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Clean air impact</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Community Eco Fund</span>
            <span className="text-lg sm:text-2xl font-black text-amber-400 font-display mt-0.5 block">
              {communityFundsRaised}
            </span>
            <span className="text-[10px] text-amber-300 font-semibold">Raised for Ward Parks</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Location Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* City Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedCity === c
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto justify-center">
          <button
            onClick={() => setFilterTab('upcoming')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              filterTab === 'upcoming' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Scheduled Drives ({drives.filter((d) => d.city === selectedCity && d.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              filterTab === 'completed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Past Hall of Fame ({drives.filter((d) => d.city === selectedCity && d.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Scheduled Drive Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDrives.length === 0 ? (
          <div className="lg:col-span-2 p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-extrabold text-slate-900">No {filterTab} drives in {selectedCity}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to request a community collection drive in your society! PunarChakra sends dedicated EV trucks & weighing scales.
            </p>
            <button
              onClick={() => setOrganizeModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-emerald-700 transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request Local Drive</span>
            </button>
          </div>
        ) : (
          filteredDrives.map((drive) => {
            const slotsPercent = Math.min(100, Math.round((drive.participantsCount / drive.maxSlots) * 100));

            return (
              <div
                key={drive.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between space-y-4"
              >
                {/* Top Image & Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={drive.image}
                    alt={drive.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <span>{drive.targetCategoryIcon}</span>
                      <span>{drive.targetCategory}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                      +{drive.bonusPoints} Eco Pts
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[10px] font-bold text-emerald-300 uppercase flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{drive.organizer}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black font-display text-white leading-snug">
                      {drive.title}
                    </h3>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5 pt-0 space-y-4 flex-1">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {drive.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Date & Time</span>
                        <span className="font-extrabold text-slate-900">{drive.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Meeting Point</span>
                        <span className="font-extrabold text-slate-900 truncate block max-w-[150px]" title={drive.locationHub}>
                          {drive.locationHub}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Slot Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Volunteers RSVP'd: {drive.participantsCount} / {drive.maxSlots}</span>
                      </span>
                      <span className="text-emerald-700">{slotsPercent}% Capacity</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${slotsPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Target Weight</span>
                    <span className="text-sm font-black text-slate-900 font-display">
                      {drive.expectedKg} kg Target
                    </span>
                  </div>

                  {drive.status === 'completed' ? (
                    <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Drive Completed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleToggleJoin(drive.id)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-xs ${
                        drive.joined
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {drive.joined ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Joined (Cancel RSVP)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>RSVP & Join Drive (+{drive.bonusPoints} Pts)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Organize Local Drive Form Modal */}
      {organizeModalOpen && (
        <div className="fixed inset-0 z-[600] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 relative">
              <button
                onClick={() => setOrganizeModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                  Doorstep Logistics Support
                </span>
              </div>
              <h3 className="text-xl font-black font-display text-white">
                Request Society Collection Drive
              </h3>
              <p className="text-xs text-emerald-100/90 mt-1">
                We bring EV scrap trucks, digital weighing scales, and instant UPI payouts right to your apartment complex or neighborhood!
              </p>
            </div>

            <form onSubmit={handleOrganizeSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Apartment Society / Colony Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sobha Windfall Apartments"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Locality & City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar 100ft Rd, Bengaluru"
                  value={localityName}
                  onChange={(e) => setLocalityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Contact Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98860 *****"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Est. Participating Flats
                  </label>
                  <select
                    value={expectedHouses}
                    onChange={(e) => setExpectedHouses(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="20-50">20-50 Flats</option>
                    <option value="50-100">50-100 Flats</option>
                    <option value="100-250">100-250 Flats</option>
                    <option value="250+">250+ Large Gated Society</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Free PunarChakra Partner Benefits</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  RWA / Society gets 5% bonus eco-fund on total weight collected for park beautification!
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOrganizeModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={organizeSubmitted}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{organizeSubmitted ? 'Submitting Request...' : 'Submit Drive Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
