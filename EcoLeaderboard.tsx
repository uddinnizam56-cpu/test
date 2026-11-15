import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  Search,
  MapPin,
  TrendingUp,
  Share2,
  Heart,
  ChevronRight,
  ShieldCheck,
  Zap,
  Leaf,
  Users,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { UserProfile, Language, LeaderboardUser } from '../../types';
import { translations } from '../../utils/translations';

interface EcoLeaderboardProps {
  userProfile: UserProfile;
  language: Language;
  leaderboardUsers?: LeaderboardUser[];
  onUpdateUsers?: (users: LeaderboardUser[]) => void;
}

const INITIAL_LEADERBOARD_DATA: LeaderboardUser[] = [
  {
    id: 'l1',
    rank: 1,
    name: 'Ananya Rao',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    totalKg: 485,
    points: 3420,
    co2SavedKg: 1210,
    badgeTitle: 'Green Legend 👑',
    cheers: 142,
  },
  {
    id: 'l2',
    rank: 2,
    name: 'Suresh Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    locality: 'Koramangala',
    city: 'Bengaluru',
    totalKg: 412,
    points: 2890,
    co2SavedKg: 1030,
    badgeTitle: 'Zero-Waste Master 🥈',
    cheers: 98,
  },
  {
    id: 'l3',
    rank: 3,
    name: 'Priya Hegde',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    locality: 'Jayanagar',
    city: 'Bengaluru',
    totalKg: 365,
    points: 2540,
    co2SavedKg: 910,
    badgeTitle: 'Eco Pioneer 🥉',
    cheers: 87,
  },
  {
    id: 'l4',
    rank: 4,
    name: 'Rohan Sharma',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    locality: 'Whitefield',
    city: 'Bengaluru',
    totalKg: 310,
    points: 2180,
    co2SavedKg: 770,
    badgeTitle: 'Recycling Champ',
    cheers: 64,
  },
  {
    id: 'l5',
    rank: 5,
    name: 'Meera Patil',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    locality: 'Malleshwaram',
    city: 'Bengaluru',
    totalKg: 275,
    points: 1950,
    co2SavedKg: 680,
    badgeTitle: 'Planet Hero',
    cheers: 52,
  },
  {
    id: 'l6',
    rank: 6,
    name: 'Karthik Gowda',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    locality: 'HSR Layout',
    city: 'Bengaluru',
    totalKg: 240,
    points: 1710,
    co2SavedKg: 600,
    badgeTitle: 'Circular Enthusiast',
    cheers: 41,
  },
  {
    id: 'l7',
    rank: 7,
    name: 'Rajesh Sharma (You)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    totalKg: 184,
    points: 1250,
    co2SavedKg: 460,
    badgeTitle: 'Eco Warrior 🌿',
    cheers: 36,
    isCurrentUser: true,
  },
  {
    id: 'l8',
    rank: 8,
    name: 'Deepa Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    locality: 'JP Nagar',
    city: 'Bengaluru',
    totalKg: 165,
    points: 1120,
    co2SavedKg: 410,
    badgeTitle: 'Green Crusader',
    cheers: 29,
  },
  {
    id: 'l9',
    rank: 9,
    name: 'Vikram Joshi',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    locality: 'Hebbal',
    city: 'Bengaluru',
    totalKg: 145,
    points: 980,
    co2SavedKg: 360,
    badgeTitle: 'Scrap Saver',
    cheers: 22,
  },
  {
    id: 'l10',
    rank: 10,
    name: 'Kavitha Shetty',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    locality: 'Banashankari',
    city: 'Bengaluru',
    totalKg: 130,
    points: 890,
    co2SavedKg: 320,
    badgeTitle: 'Eco Starter',
    cheers: 19,
  },
];

const CITIES = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi'];

export const EcoLeaderboard: React.FC<EcoLeaderboardProps> = ({
  userProfile,
  language,
  leaderboardUsers = INITIAL_LEADERBOARD_DATA,
  onUpdateUsers,
}) => {
  const t = translations[language];
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [timeframe, setTimeframe] = useState<'month' | 'alltime'>('month');
  const [localLeaderboardData, setLocalLeaderboardData] = useState<LeaderboardUser[]>(leaderboardUsers);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cheeredUserIds, setCheeredUserIds] = useState<{ [id: string]: boolean }>({});
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Keep in sync with parent prop updates
  useEffect(() => {
    setLocalLeaderboardData(leaderboardUsers);
  }, [leaderboardUsers]);

  const leaderboardData = localLeaderboardData;

  const currentUser = leaderboardData.find((u) => u.isCurrentUser) || {
    id: 'l7',
    rank: 7,
    name: userProfile.name + ' (You)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    locality: userProfile.savedAddresses?.[0]?.area || 'Indiranagar',
    city: 'Bengaluru',
    totalKg: userProfile.totalRecycledKg || 184,
    points: userProfile.ecoRewardPoints || 1250,
    co2SavedKg: userProfile.totalCo2SavedKg || 460,
    badgeTitle: 'Eco Warrior 🌿',
    cheers: 36,
    isCurrentUser: true,
  };

  const handleCheer = (userId: string) => {
    if (cheeredUserIds[userId]) return;

    setCheeredUserIds((prev) => ({ ...prev, [userId]: true }));
    const updated = localLeaderboardData.map((u) =>
      u.id === userId ? { ...u, cheers: u.cheers + 1 } : u
    );
    setLocalLeaderboardData(updated);
    if (onUpdateUsers) {
      onUpdateUsers(updated);
    }
  };

  const handleShareRank = () => {
    setShareToast(`Copied! "I am ranked #${currentUser.rank} in ${selectedCity} Eco-Leaderboard on PunarChakra with ${currentUser.totalKg}kg recycled!"`);
    setTimeout(() => {
      setShareToast(null);
    }, 4000);
  };

  const filteredUsers = leaderboardData
    .filter(
      (u) =>
        u.city === selectedCity &&
        (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.locality.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.totalKg - a.totalKg)
    .map((u, idx) => ({ ...u, rank: idx + 1 }));

  const top3 = filteredUsers.slice(0, 3);
  const ranks4to10 = filteredUsers.slice(3, 10);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {shareToast && (
        <div className="p-4 bg-emerald-900 text-white rounded-2xl shadow-lg border border-emerald-700 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-xs sm:text-sm">{shareToast}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Trophy className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-black tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                City Sustainability League
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Monthly Reset in 12 Days</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              {selectedCity} Eco Champions Leaderboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Compete with neighbors, recycle doorstep scrap, climb the city rankings, and unlock bonus Eco Reward Points every month!
            </p>
          </div>

          {/* User Rank Snapshot Card */}
          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl shrink-0 w-full lg:w-auto flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-black text-xl shadow-md border border-emerald-400">
              #{currentUser.rank}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Your Current Rank ({selectedCity})
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <span>{currentUser.totalKg} kg Recycled</span>
                <span className="text-emerald-400">• {currentUser.points} Pts</span>
              </div>
              <button
                onClick={handleShareRank}
                className="mt-1.5 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-all"
              >
                <Share2 className="w-3 h-3" />
                <span>Share My Rank Badge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* City Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {CITIES.map((c) => (
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

        {/* Timeframe & Search Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search recycler or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === 'month' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('alltime')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === 'alltime' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Showcase */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Silver - 2nd Place */}
          <div className="order-2 md:order-1 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full bg-slate-100 py-1 text-[10px] font-black uppercase text-slate-600 tracking-wider mb-4 rounded-full">
              🥈 2nd Rank Champion
            </div>
            <div className="relative mb-3">
              <img
                src={top3[1].avatar}
                alt={top3[1].name}
                className="w-20 h-20 rounded-full object-cover border-4 border-slate-200 shadow-md"
              />
              <span className="absolute -bottom-2 -right-1 bg-slate-700 text-white font-black text-xs px-2 py-0.5 rounded-full border-2 border-white">
                #2
              </span>
            </div>
            <h4 className="font-extrabold text-base text-slate-900 font-display">{top3[1].name}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{top3[1].locality}, {top3[1].city}</span>
            </p>
            <span className="mt-2 text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {top3[1].badgeTitle}
            </span>

            <div className="mt-4 pt-4 border-t border-slate-100 w-full grid grid-cols-2 gap-2 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Recycled</span>
                <p className="text-base font-black text-slate-900 font-display">{top3[1].totalKg} kg</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Eco Points</span>
                <p className="text-base font-black text-emerald-600 font-display">{top3[1].points} Pts</p>
              </div>
            </div>

            <button
              onClick={() => handleCheer(top3[1].id)}
              className={`mt-4 w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                cheeredUserIds[top3[1].id]
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${cheeredUserIds[top3[1].id] ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              <span>{cheeredUserIds[top3[1].id] ? 'Cheered!' : 'Cheer'} ({top3[1].cheers})</span>
            </button>
          </div>

          {/* Gold - 1st Place (Center Big Banner) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 rounded-3xl border-2 border-amber-400 p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-2">
            <div className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 py-1 text-xs font-black uppercase tracking-wider mb-4 rounded-full shadow-xs flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4 fill-slate-950" />
              👑 1st Rank Leader
            </div>
            <div className="relative mb-3">
              <img
                src={top3[0].avatar}
                alt={top3[0].name}
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-950 font-black text-sm px-2.5 py-0.5 rounded-full border-2 border-white shadow-md">
                #1
              </span>
            </div>
            <h4 className="font-black text-lg text-slate-900 font-display">{top3[0].name}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>{top3[0].locality}, {top3[0].city}</span>
            </p>
            <span className="mt-2 text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              {top3[0].badgeTitle}
            </span>

            <div className="mt-4 pt-4 border-t border-amber-200/60 w-full grid grid-cols-2 gap-2 text-center">
              <div>
                <span className="text-[10px] font-extrabold text-amber-800 uppercase">Total Recycled</span>
                <p className="text-xl font-black text-slate-900 font-display">{top3[0].totalKg} kg</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-800 uppercase">Eco Points</span>
                <p className="text-xl font-black text-emerald-700 font-display">{top3[0].points} Pts</p>
              </div>
            </div>

            <button
              onClick={() => handleCheer(top3[0].id)}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                cheeredUserIds[top3[0].id]
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${cheeredUserIds[top3[0].id] ? 'fill-rose-600 text-rose-600' : 'fill-slate-950 text-slate-950'}`} />
              <span>{cheeredUserIds[top3[0].id] ? 'Cheered Champion!' : 'Cheer #1 Champion'} ({top3[0].cheers})</span>
            </button>
          </div>

          {/* Bronze - 3rd Place */}
          <div className="order-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full bg-amber-100 py-1 text-[10px] font-black uppercase text-amber-900 tracking-wider mb-4 rounded-full">
              🥉 3rd Rank Champion
            </div>
            <div className="relative mb-3">
              <img
                src={top3[2].avatar}
                alt={top3[2].name}
                className="w-20 h-20 rounded-full object-cover border-4 border-amber-200 shadow-md"
              />
              <span className="absolute -bottom-2 -right-1 bg-amber-700 text-white font-black text-xs px-2 py-0.5 rounded-full border-2 border-white">
                #3
              </span>
            </div>
            <h4 className="font-extrabold text-base text-slate-900 font-display">{top3[2].name}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{top3[2].locality}, {top3[2].city}</span>
            </p>
            <span className="mt-2 text-[10px] font-extrabold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {top3[2].badgeTitle}
            </span>

            <div className="mt-4 pt-4 border-t border-slate-100 w-full grid grid-cols-2 gap-2 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Recycled</span>
                <p className="text-base font-black text-slate-900 font-display">{top3[2].totalKg} kg</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Eco Points</span>
                <p className="text-base font-black text-emerald-600 font-display">{top3[2].points} Pts</p>
              </div>
            </div>

            <button
              onClick={() => handleCheer(top3[2].id)}
              className={`mt-4 w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                cheeredUserIds[top3[2].id]
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${cheeredUserIds[top3[2].id] ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              <span>{cheeredUserIds[top3[2].id] ? 'Cheered!' : 'Cheer'} ({top3[2].cheers})</span>
            </button>
          </div>
        </div>
      )}

      {/* Ranks 4 to 10 Table List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-slate-900 font-display flex items-center gap-2">
              <span>Top 10 Recyclers in {selectedCity}</span>
              <span className="text-xs font-bold text-slate-500">({filteredUsers.length} active members)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Rankings calculated by total scrap weight collected in kilograms and Eco Reward Points.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredUsers.map((user) => {
            const isMe = user.isCurrentUser;
            return (
              <div
                key={user.id}
                className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isMe
                    ? 'bg-emerald-50/90 ring-2 ring-emerald-500/20'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <span
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                      user.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : user.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    #{user.rank}
                  </span>

                  {/* Avatar */}
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />

                  {/* User info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 font-display">
                        {user.name}
                      </span>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>📍 {user.locality}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{user.badgeTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Stats & Interactivity */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto text-right border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Weight</span>
                    <span className="text-sm font-black text-slate-900 font-display">
                      {user.totalKg} kg
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Eco Pts</span>
                    <span className="text-sm font-black text-emerald-600 font-display">
                      {user.points} Pts
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">CO₂ Saved</span>
                    <span className="text-xs font-bold text-slate-600">
                      {user.co2SavedKg} kg
                    </span>
                  </div>

                  <button
                    onClick={() => handleCheer(user.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      cheeredUserIds[user.id]
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${cheeredUserIds[user.id] ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                    <span>{user.cheers}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
