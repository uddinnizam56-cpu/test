import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Wallet,
  Award,
  ArrowUpRight,
  Share2,
  Copy,
  Check,
  Zap,
  Sprout,
  ShoppingBag,
  Gift,
  History,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  Scale,
  Target,
} from 'lucide-react';
import { UserProfile, WalletTransaction, RewardVoucher, Language, PickupOrder } from '../../types';
import { translations } from '../../utils/translations';
import { CarbonSavedCalculator, SmartEcoPledgeRecord } from './CarbonSavedCalculator';
import { ReferAFriendModal } from './ReferAFriendModal';
import { Co2EmissionsChart } from './Co2EmissionsChart';
import { getMilestoneProgress } from '../../utils/milestones';

interface EcoWalletAndRewardsProps {
  userProfile: UserProfile;
  transactions: WalletTransaction[];
  vouchers: RewardVoucher[];
  orders?: PickupOrder[];
  language: Language;
  onWithdrawFunds: (amount: number, upiId: string) => void;
  onRedeemVoucher: (voucherId: string) => void;
  onPledgeSigned?: (pledge: SmartEcoPledgeRecord) => void;
}

interface MilestoneTier {
  id: string;
  points: number;
  title: string;
  reward: string;
  icon: string;
  claimed: boolean;
}

export const EcoWalletAndRewards: React.FC<EcoWalletAndRewardsProps> = ({
  userProfile,
  transactions,
  vouchers,
  orders = [],
  language,
  onWithdrawFunds,
  onRedeemVoucher,
  onPledgeSigned,
}) => {
  const t = translations[language];
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const [referModalOpen, setReferModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(userProfile.walletBalance);
  const [upiIdInput, setUpiIdInput] = useState<string>('ananya@okaxis');
  const [redeemedVoucherCode, setRedeemedVoucherCode] = useState<string | null>(null);

  // Confetti & Celebration Modal State
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    code?: string;
    badgeIcon?: string;
    rewardText?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });

  const [milestones, setMilestones] = useState<MilestoneTier[]>([
    {
      id: 'm1',
      points: 500,
      title: 'Green Pioneer Badge 🌿',
      reward: '+50 Bonus Pts & Free Sapling',
      icon: '🌱',
      claimed: true,
    },
    {
      id: 'm2',
      points: 1000,
      title: 'Eco Warrior Legend 👑',
      reward: '+100 Bonus Pts & 15% BigBasket Pass',
      icon: '🏆',
      claimed: false,
    },
    {
      id: 'm3',
      points: 2500,
      title: 'Zero-Waste Champion ⚡',
      reward: '+250 Bonus Pts & VIP Priority Pickups',
      icon: '⚡',
      claimed: false,
    },
  ]);

  const fireSingleConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
    } catch (err) {
      console.log('Confetti error:', err);
    }
  };

  const fireMilestoneCannon = () => {
    try {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 8,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#fbbf24', '#34d399', '#f59e0b', '#38bdf8'],
        });
        confetti({
          particleCount: 8,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#fbbf24', '#34d399', '#f59e0b', '#38bdf8'],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (err) {
      console.log('Confetti error:', err);
    }
  };

  const handleRedeemVoucherWithConfetti = (voucher: RewardVoucher) => {
    onRedeemVoucher(voucher.id);
    setRedeemedVoucherCode(voucher.code);
    fireSingleConfetti();

    setCelebrationModal({
      isOpen: true,
      title: 'Voucher Unlocked!',
      description: `Congratulations! You successfully unlocked "${voucher.title}" from ${voucher.sponsorName}.`,
      code: voucher.code,
      badgeIcon: '🎁',
      rewardText: `Redeemable at checkout on ${voucher.sponsorName}`,
    });
  };

  const handleClaimMilestone = (m: MilestoneTier) => {
    if (m.claimed) return;

    setMilestones((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, claimed: true } : item))
    );

    fireMilestoneCannon();

    setCelebrationModal({
      isOpen: true,
      title: `Milestone Unlocked: ${m.title}`,
      description: `You reached ${m.points} Eco Reward Points! ${m.reward} has been added to your profile balance.`,
      badgeIcon: m.icon,
      rewardText: m.reward,
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userProfile.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > userProfile.walletBalance) return;
    onWithdrawFunds(withdrawAmount, upiIdInput);
    setWithdrawModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Eco Wallet Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                {t.walletBalance}
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Instant Bank Payout
            </span>
          </div>

          <div className="mb-6">
            <div className="text-3xl sm:text-4xl font-black text-white font-display">
              ₹{userProfile.walletBalance}
            </div>
            <p className="text-xs text-emerald-300/80 mt-1">
              Earned from doorstep recycling pickups
            </p>
          </div>

          <button
            onClick={() => setWithdrawModalOpen(true)}
            disabled={userProfile.walletBalance <= 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t.withdrawToUpi}</span>
          </button>
        </div>

        {/* Eco Reward Points & Tree Counter */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/20 text-white border border-white/30">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                {t.ecoPoints}
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
              Green Citizen
            </span>
          </div>

          <div className="mb-6">
            <div className="text-3xl sm:text-4xl font-black text-white font-display">
              {userProfile.ecoRewardPoints} <span className="text-lg font-semibold">pts</span>
            </div>
            <p className="text-xs text-amber-100 mt-1">
              Equivalent to <strong className="font-extrabold">12 Trees Planted</strong> 🌱 & {userProfile.totalCo2SavedKg} kg CO₂ Offset!
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-amber-50 flex items-center justify-between">
            <span>Redeem points for Eco Vouchers & Saplings below</span>
            <Sprout className="w-4 h-4 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Live Milestone Targets Tracker: Total Kg Recycled & Wallet Balance */}
      {(() => {
        const kgProgress = getMilestoneProgress('recycled_kg', userProfile.totalRecycledKg);
        const walletProgress = getMilestoneProgress('wallet_balance', userProfile.walletBalance);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Kg Recycled Target Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Total Kg Recycled Milestones
                    </h4>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      Current: <strong className="text-emerald-700">{Number(userProfile.totalRecycledKg.toFixed(1))} kg</strong>
                      {kgProgress.nextMilestone
                        ? ` · ${kgProgress.remaining} kg to ${kgProgress.nextMilestone.threshold} kg`
                        : ' · All tiers unlocked'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-700 tabular-nums">
                  {kgProgress.unlocked.length}/{kgProgress.milestones.length}
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${kgProgress.progressPercent}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-bold tabular-nums">
                {kgProgress.milestones.map((m) => {
                  const done = userProfile.totalRecycledKg >= m.threshold;
                  return (
                    <span
                      key={m.id}
                      className={`px-2 py-0.5 rounded-md border ${
                        done
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {done ? '✓ ' : ''}{m.threshold} kg
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Wallet Balance Target Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Wallet Balance Milestones
                    </h4>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      Current: <strong className="text-amber-700">₹{userProfile.walletBalance.toLocaleString('en-IN')}</strong>
                      {walletProgress.nextMilestone
                        ? ` · ₹${walletProgress.remaining.toLocaleString('en-IN')} to ₹${walletProgress.nextMilestone.threshold.toLocaleString('en-IN')}`
                        : ' · All tiers unlocked'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-700 tabular-nums">
                  {walletProgress.unlocked.length}/{walletProgress.milestones.length}
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${walletProgress.progressPercent}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-bold tabular-nums">
                {walletProgress.milestones.map((m) => {
                  const done = userProfile.walletBalance >= m.threshold;
                  return (
                    <span
                      key={m.id}
                      className={`px-2 py-0.5 rounded-md border ${
                        done
                          ? 'bg-amber-100 text-amber-950 border-amber-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {done ? '✓ ' : ''}₹{m.threshold.toLocaleString('en-IN')}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Carbon Saved Calculator, Recharts Impact Timeline & Smart Eco Pledge */}
      <CarbonSavedCalculator
        orders={orders}
        userProfile={userProfile}
        onPledgeSigned={onPledgeSigned}
      />

      {/* D3 Chart for CO2 Emissions Over Time */}
      <Co2EmissionsChart orders={orders} />

      {/* Referral Program Card */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl border border-emerald-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Gift className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                Eco Network Bonus
              </span>
              <h3 className="font-black text-white text-base sm:text-lg font-display mt-0.5">
                {t.referAndEarn} — Give 100 Pts + ₹50, Get 100 Pts + ₹50
              </h3>
              <p className="text-xs text-emerald-100/90 max-w-xl mt-1">
                Share your unique link with friends across Karnataka. When they complete their 1st doorstep scrap pickup, both of you earn instant rewards!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="p-2.5 bg-slate-900/80 border border-emerald-500/40 rounded-xl text-xs font-mono font-extrabold text-emerald-300 tracking-wider">
              {userProfile.referralCode}
            </div>
            <button
              onClick={() => setReferModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span>Open Referral Hub & Invite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Refer A Friend Interactive Modal */}
      <ReferAFriendModal
        isOpen={referModalOpen}
        onClose={() => setReferModalOpen(false)}
        userProfile={userProfile}
        language={language}
      />

      {/* Redeemable Green Vouchers Grid */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>{t.redeemPoints}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {vouchers.map((voucher) => {
            const canAfford = userProfile.ecoRewardPoints >= voucher.pointsRequired;
            return (
              <div
                key={voucher.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {voucher.category}
                    </span>
                    <span className="text-xs font-extrabold text-amber-700">
                      {voucher.pointsRequired} pts
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1">{voucher.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{voucher.sponsorName}</p>
                </div>

                <div>
                  {redeemedVoucherCode === voucher.code ? (
                    <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs font-mono font-extrabold text-emerald-900">
                      Code: {voucher.code}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRedeemVoucherWithConfetti(voucher)}
                      disabled={!canAfford}
                      className="w-full py-2 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40"
                    >
                      {canAfford ? 'Redeem Coupon' : 'Need More Points'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Eco Milestone Point Badges & Bonus Perks */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Eco Points Milestones & Badges</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click to claim unlocked tier perks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {milestones.map((m) => {
            const isUnlocked = userProfile.ecoRewardPoints >= m.points;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  m.claimed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isUnlocked
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{m.icon}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        m.claimed
                          ? 'bg-emerald-200 text-emerald-900'
                          : isUnlocked
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {m.claimed ? 'Claimed ✓' : isUnlocked ? 'Unlocked 🎉' : `${m.points} Pts Target`}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm font-display mb-0.5">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">{m.reward}</p>
                </div>

                <div className="mt-3">
                  {m.claimed ? (
                    <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bonus perks active on your account</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleClaimMilestone(m)}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim Bonus + Burst Confetti</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Earn {m.points - userProfile.ecoRewardPoints} more points to unlock
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebratory Milestone & Voucher Unlock Popup Modal */}
      {celebrationModal.isOpen && (
        <div className="fixed inset-0 z-[700] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCelebrationModal({ ...celebrationModal, isOpen: false })}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30 border border-emerald-300">
              {celebrationModal.badgeIcon || '🎉'}
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Celebration Unlock
            </span>

            <h3 className="text-xl font-black text-slate-900 font-display mb-1">
              {celebrationModal.title}
            </h3>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {celebrationModal.description}
            </p>

            {celebrationModal.code && (
              <div className="mb-4 p-3 bg-slate-900 rounded-2xl text-emerald-300 font-mono text-sm font-black tracking-widest border border-slate-800 flex items-center justify-between">
                <span>{celebrationModal.code}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(celebrationModal.code || '');
                    fireSingleConfetti();
                  }}
                  className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg hover:bg-emerald-400"
                >
                  Copy
                </button>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={fireMilestoneCannon}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Re-trigger Confetti Cannon 🎉</span>
              </button>

              <button
                onClick={() => setCelebrationModal({ ...celebrationModal, isOpen: false })}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Awesome! Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Wallet Transactions */}
      <div className="space-y-3 pt-2">
        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          <span>Wallet Transaction History</span>
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold ${
                    tx.type === 'credit' || tx.type === 'reward_cashback'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tx.type === 'credit' ? '➕ Payout' : tx.type === 'withdrawal' ? '↗️ Bank' : '🎁 Bonus'}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">{tx.description}</h5>
                  <p className="text-[10px] text-slate-400">{tx.timestamp} • Ref: {tx.referenceId}</p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-black text-sm font-display ${
                    tx.type === 'credit' || tx.type === 'reward_cashback'
                      ? 'text-emerald-700'
                      : 'text-slate-900'
                  }`}
                >
                  {tx.type === 'credit' || tx.type === 'reward_cashback' ? '+' : '-'}₹{tx.amount}
                </span>
                <span className="block text-[10px] font-extrabold text-emerald-600">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instant Bank Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 font-display mb-1">
              Instant Bank Withdrawal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Funds will be instantly transferred via IMPS / UPI.
            </p>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  UPI ID / VPA (e.g. mobile@gpay, name@okaxis)
                </label>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Withdrawal Amount (Max ₹{userProfile.walletBalance})
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  max={userProfile.walletBalance}
                  min={1}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-extrabold font-display focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                Confirm Instant Transfer ₹{withdrawAmount}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
