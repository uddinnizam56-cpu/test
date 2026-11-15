import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Scale,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Trophy,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  ProfileMilestone,
  getMilestoneProgress,
} from '../utils/milestones';

interface MilestoneCelebrationModalProps {
  milestone: ProfileMilestone | null;
  remainingInQueue?: number;
  userProfile: UserProfile;
  onClose: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToImpact?: () => void;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  milestone,
  remainingInQueue = 0,
  userProfile,
  onClose,
  onNavigateToWallet,
  onNavigateToImpact,
}) => {
  const rafRef = useRef<number | null>(null);

  const fireConfettiShow = () => {
    try {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      confetti({
        particleCount: 100,
        spread: 85,
        origin: { y: 0.58 },
        colors: ['#10b981', '#059669', '#f59e0b', '#0284c7', '#fbbf24'],
      });

      const end = Date.now() + 1800;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: ['#10b981', '#fbbf24', '#34d399', '#38bdf8'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ['#10b981', '#fbbf24', '#34d399', '#38bdf8'],
        });

        if (Date.now() < end) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(frame);
    } catch {
      // Gracefully skip confetti in headless/restricted canvas environments
    }
  };

  useEffect(() => {
    if (!milestone) return;
    fireConfettiShow();
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [milestone?.id]);

  if (!milestone) return null;

  const isRecycledKg = milestone.category === 'recycled_kg';
  const currentMetricValue = isRecycledKg
    ? userProfile.totalRecycledKg
    : userProfile.walletBalance;
  const progressSummary = getMilestoneProgress(milestone.category, currentMetricValue);

  const formattedCurrent = isRecycledKg
    ? `${Number(userProfile.totalRecycledKg.toFixed(1))} kg`
    : `₹${userProfile.walletBalance.toLocaleString('en-IN')}`;
  const formattedTarget = isRecycledKg
    ? `${milestone.threshold} kg`
    : `₹${milestone.threshold.toLocaleString('en-IN')}`;
  const formattedNextTarget = progressSummary.nextMilestone
    ? isRecycledKg
      ? `${progressSummary.nextMilestone.threshold} kg`
      : `₹${progressSummary.nextMilestone.threshold.toLocaleString('en-IN')}`
    : null;

  return (
    <div
      className="fixed inset-0 z-[800] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-200 relative animate-in zoom-in-95 duration-200">
        {/* Top Accent Banner */}
        <div
          className={`px-6 pt-7 pb-6 text-center relative ${
            isRecycledKg
              ? 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white'
              : 'bg-gradient-to-br from-slate-900 via-emerald-950 to-amber-950 text-white'
          }`}
        >
          <button
            onClick={onClose}
            aria-label="Close milestone celebration"
            className="absolute top-4 right-4 p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 mx-auto mb-3 rounded-3xl bg-white/15 border border-white/25 backdrop-blur-xs flex items-center justify-center text-4xl shadow-lg">
            {milestone.badge}
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-300 mb-1">
            {isRecycledKg ? (
              <Scale className="w-3.5 h-3.5" />
            ) : (
              <Wallet className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>
              {isRecycledKg ? 'Total Kg Recycled Target Reached' : 'Eco Wallet Balance Target Reached'}
            </span>
          </div>

          <h3
            id="milestone-modal-title"
            className="text-2xl font-black font-display tracking-tight text-white"
          >
            {milestone.title}
          </h3>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed">
            {milestone.subtitle}
          </p>

          {/* Achieved Metric & Target Box */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
            <div className="border-r border-slate-200 pr-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Your Profile Metric
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 font-display tabular-nums mt-0.5 block">
                {formattedCurrent}
              </span>
            </div>

            <div className="pl-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Milestone Crossed
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-display tabular-nums mt-0.5 block">
                {formattedTarget}
              </span>
            </div>
          </div>

          {/* Unlock Status & Next Milestone Progress */}
          <div className="space-y-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{milestone.rewardLabel}</span>
              </span>
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            </div>

            {formattedNextTarget ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 tabular-nums">
                  <span>Next Target: {formattedNextTarget}</span>
                  <span className="text-emerald-700">{progressSummary.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-emerald-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressSummary.progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-bold text-emerald-800 pt-1">
                Maximum milestone tier unlocked in this category!
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fireConfettiShow}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Replay Confetti</span>
              </button>

              {isRecycledKg && onNavigateToImpact ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToImpact();
                  }}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Carbon Savings</span>
                </button>
              ) : onNavigateToWallet ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToWallet();
                  }}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-300" />
                  <span>Eco Wallet</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Close</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>
                {remainingInQueue > 0
                  ? `Continue to Next Milestone (${remainingInQueue} more)`
                  : 'Awesome, Keep Recycling'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
