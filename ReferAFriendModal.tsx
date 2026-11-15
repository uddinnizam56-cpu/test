import React, { useState } from 'react';
import {
  X,
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
  Coins,
  CheckCircle2,
  Send,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { translations } from '../../utils/translations';

interface ReferAFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  language: Language;
  onGrantReferralBonus?: (points: number, amount: number, friendName: string) => void;
}

interface ReferredFriend {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'completed';
  date: string;
  pointsEarned: number;
}

export const ReferAFriendModal: React.FC<ReferAFriendModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  language,
  onGrantReferralBonus,
}) => {
  const t = translations[language];
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Simulated Friend Referrals List
  const [referrals, setReferrals] = useState<ReferredFriend[]>([
    {
      id: 'ref-1',
      name: 'Pooja Sundaram',
      phone: '+91 98860 *****',
      status: 'completed',
      date: '2026-08-01',
      pointsEarned: 100,
    },
    {
      id: 'ref-2',
      name: 'Rahul Varma',
      phone: '+91 94480 *****',
      status: 'pending',
      date: '2026-08-03',
      pointsEarned: 0,
    },
  ]);

  const [friendNameInput, setFriendNameInput] = useState('');
  const [friendPhoneInput, setFriendPhoneInput] = useState('');
  const [inviteSentToast, setInviteSentToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const referralCode = userProfile.referralCode || 'PUNAR-ECO-2026';
  const referralLink = `https://punarchakra.in/invite?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Use my referral code ${referralCode} on PunarChakra for doorstep scrap recycling in Karnataka. We both get 100 Eco Reward Points + ₹50 in Eco Wallet on your first pickup! Join here: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSendDirectInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendNameInput.trim() || !friendPhoneInput.trim()) return;

    const newRef: ReferredFriend = {
      id: `ref-${Date.now()}`,
      name: friendNameInput.trim(),
      phone: friendPhoneInput.trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      pointsEarned: 0,
    };

    setReferrals([newRef, ...referrals]);
    setInviteSentToast(`Invite sent successfully to ${friendNameInput}! They will receive an SMS referral link.`);
    setFriendNameInput('');
    setFriendPhoneInput('');

    setTimeout(() => {
      setInviteSentToast(null);
    }, 4000);
  };

  const handleSimulatePickupCompletion = (refId: string) => {
    const target = referrals.find((r) => r.id === refId);
    if (!target || target.status === 'completed') return;

    setReferrals((prev) =>
      prev.map((r) =>
        r.id === refId ? { ...r, status: 'completed', pointsEarned: 100 } : r
      )
    );

    if (onGrantReferralBonus) {
      onGrantReferralBonus(100, 50, target.name);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold shadow-inner">
              <Gift className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                Eco Network Bonus
              </span>
              <h3 className="text-xl font-black font-display text-white mt-0.5">
                Refer Friends, Win Eco Rewards
              </h3>
            </div>
          </div>

          <p className="text-xs text-emerald-100/90 leading-relaxed mt-2">
            Invite neighbors & friends to recycle doorstep scrap with PunarChakra. Both of you receive instant reward perks upon their 1st pickup completion!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Toast Notification */}
          {inviteSentToast && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{inviteSentToast}</span>
            </div>
          )}

          {/* Dual Reward Benefit Box */}
          <div className="grid grid-cols-2 gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
            <div className="text-center p-2">
              <span className="text-[10px] font-black uppercase text-emerald-800 block">YOU GET</span>
              <div className="text-base font-black text-slate-900 font-display mt-0.5">
                100 Points + ₹50
              </div>
              <span className="text-[10px] text-slate-500">Credited to Eco Wallet</span>
            </div>

            <div className="text-center p-2 border-l border-emerald-200">
              <span className="text-[10px] font-black uppercase text-emerald-800 block">YOUR FRIEND GETS</span>
              <div className="text-base font-black text-slate-900 font-display mt-0.5">
                100 Points + ₹50
              </div>
              <span className="text-[10px] text-slate-500">On 1st Pickup Done</span>
            </div>
          </div>

          {/* Unique Code & Referral Link Box */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Your Unique Referral Link & Code
            </label>

            {/* Code pill */}
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-slate-100 border border-slate-200 rounded-2xl font-mono text-sm font-black text-slate-900 text-center tracking-wider">
                {referralCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5 shrink-0"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Link & Social Share Buttons */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
              <div className="text-[11px] font-mono text-slate-600 truncate bg-white p-2 rounded-xl border border-slate-200">
                {referralLink}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Web Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Direct SMS Invite Form */}
          <form onSubmit={handleSendDirectInvite} className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send Direct SMS Invite</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Friend's Name"
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
              <input
                type="tel"
                placeholder="Mobile Number (+91)"
                value={friendPhoneInput}
                onChange={(e) => setFriendPhoneInput(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invite SMS</span>
            </button>
          </form>

          {/* Referral Status & Claim Tracker */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Invited Friends History ({referrals.length})</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-bold">100 Pts / Completed Pickup</span>
            </div>

            <div className="space-y-2">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 font-display">{ref.name}</div>
                    <div className="text-[10px] text-slate-500">{ref.phone} • Invited {ref.date}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ref.status === 'completed' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        +100 Pts Earned
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          Pending 1st Pickup
                        </span>
                        <button
                          onClick={() => handleSimulatePickupCompletion(ref.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all"
                          title="Simulate friend completing 1st pickup"
                        >
                          Simulate Completion
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
          >
            Close Referral Window
          </button>
        </div>
      </div>
    </div>
  );
};
