import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ShieldAlert,
  Layers,
  Sparkle,
  Leaf,
  ChevronDown,
  ChevronUp,
  Flame,
} from 'lucide-react';
import { ScrapItem, Language } from '../../types';

interface RecyclingTipsGuideProps {
  cart: { [itemId: string]: number };
  items: ScrapItem[];
  language: Language;
}

interface ItemTip {
  itemName: string;
  category: string;
  cleaningStep: string;
  sortingTip: string;
  payoutBooster: string;
  safetyWarning?: string | null;
}

interface AiTipsData {
  generalAdvice: string;
  estimatedValueBoost: string;
  itemTips: ItemTip[];
  actionChecklist: string[];
  ecoFact: string;
}

const DEFAULT_TIPS: AiTipsData = {
  generalAdvice:
    'Separate metallic scrap by purity and strip rubber insulation from copper wire to qualify for Grade-A spot rates during pickup.',
  estimatedValueBoost: '+15% Higher Payout',
  itemTips: [
    {
      itemName: 'Heavy Copper Wire',
      category: 'Metals',
      cleaningStep: 'Strip outer PVC insulation and remove oil or dirt coat using dry cloth.',
      sortingTip: 'Keep shiny bare copper wire separate from tarnished or burnt wires.',
      payoutBooster: 'Bare uninsulated copper fetches ₹720/kg (Grade-A) vs ₹450/kg for insulated wire.',
      safetyWarning: 'Use proper wire stripping tools. Never burn PVC coating to avoid toxic emissions.',
    },
    {
      itemName: 'Corrugated Cardboard',
      category: 'Paper',
      cleaningStep: 'Remove plastic tape, styrofoam inserts, and heavy metal staples from boxes.',
      sortingTip: 'Flatten boxes completely and tie in dry bundles of 5-10 kg.',
      payoutBooster: 'Clean, dry flattened cardboard saves storage space and earns maximum weight payout.',
      safetyWarning: null,
    },
    {
      itemName: 'PET Water & Soda Bottles',
      category: 'Plastics',
      cleaningStep: 'Rinse out liquid residue, remove caps, and flatten bottle body.',
      sortingTip: 'Separate clear transparent PET bottles from dark colored plastics.',
      payoutBooster: 'Uncapped flattened bottles weigh less in bulk volume and process 2x faster.',
      safetyWarning: null,
    },
    {
      itemName: 'Laptops & Smartphones',
      category: 'E-Waste',
      cleaningStep: 'Wipe external casing and ensure all personal accounts/passcodes are removed.',
      sortingTip: 'Keep power adapters, charging cables, and lithium batteries alongside the main unit.',
      payoutBooster: 'Intact circuit motherboards qualify for top tier electronic salvage valuation.',
      safetyWarning: 'Do not puncture lithium-ion batteries. Keep away from water or extreme heat.',
    },
  ],
  actionChecklist: [
    'Drain all liquids from bottles and metal containers before weighing.',
    'Remove plastic wrapping and metallic tape from cardboard boxes.',
    'Keep copper, brass, and aluminum in separate bags or crates.',
    'Bundle wires and stack paper neatly near your doorstep for quick pickup.',
  ],
  ecoFact: 'Recycling 1 ton of scrap copper saves up to 85% of the energy needed for primary mining!',
};

export const RecyclingTipsGuide: React.FC<RecyclingTipsGuideProps> = ({
  cart,
  items,
  language,
}) => {
  const [tipsData, setTipsData] = useState<AiTipsData>(DEFAULT_TIPS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedChecks, setCompletedChecks] = useState<{ [key: number]: boolean }>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const cartItemDetails = Object.entries(cart)
    .filter(([_, qty]) => Number(qty || 0) > 0)
    .map(([id, qty]) => {
      const found = items.find((i) => i.id === id);
      return {
        name: found?.name || id,
        qty: Number(qty),
        unit: found?.unit || 'kg',
        category: found?.category || 'General',
      };
    });

  const fetchAiTips = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/recycling-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cartItemDetails,
          language,
        }),
      });
      const data = await res.json();
      if (data.success && data.tips) {
        setTipsData(data.tips);
      }
    } catch (err) {
      console.error('Error fetching AI tips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cartItemDetails.length > 0) {
      fetchAiTips();
    }
  }, [Object.keys(cart).length]);

  const toggleCheck = (idx: number) => {
    setCompletedChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(completedChecks).filter(Boolean).length;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-black tracking-wider flex items-center gap-1 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              AI Prep & Value Booster
            </span>
            {cartItemDetails.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Customized for {cartItemDetails.length} selected scrap item(s)
              </span>
            )}
          </div>
          <h3 className="text-xl font-black font-display text-white tracking-tight">
            Recycling Best Practices & Cleaning Guide
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Learn how to clean, sort, and bundle your scrap to unlock Grade-A spot rates & maximize cash payout.
          </p>
        </div>

        <button
          onClick={fetchAiTips}
          disabled={isLoading}
          className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl transition-all border border-emerald-500/30 flex items-center gap-2 shrink-0 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isLoading ? 'AI Analyzing Scrap...' : 'Refresh AI Tips'}</span>
        </button>
      </div>

      {/* Main General Strategy Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
              AI Smart Maximizer Strategy
            </div>
            <p className="text-xs text-slate-200 font-medium mt-0.5 leading-relaxed">
              "{tipsData.generalAdvice}"
            </p>
          </div>
        </div>

        <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-center shrink-0">
          <span className="text-[10px] uppercase font-black text-amber-300 block">Est. Rate Boost</span>
          <span className="text-lg font-black text-amber-300 font-display">
            {tipsData.estimatedValueBoost || '+15% Payout'}
          </span>
        </div>
      </div>

      {/* Item-by-Item AI Cleaning & Sorting Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Item-by-Item Preparation Instructions ({tipsData.itemTips.length})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tipsData.itemTips.map((tip, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-4 transition-all hover:border-emerald-500/50 space-y-3"
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      #{idx + 1}
                    </span>
                    <div>
                      <h5 className="font-extrabold text-sm text-white font-display">
                        {tip.itemName}
                      </h5>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">
                        {tip.category}
                      </span>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-700/60 text-xs animate-in fade-in duration-200">
                    {/* Cleaning instruction */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        Cleaning & Degreasing
                      </span>
                      <p className="text-slate-300">{tip.cleaningStep}</p>
                    </div>

                    {/* Sorting instruction */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-teal-400" />
                        Sorting & Segregation
                      </span>
                      <p className="text-slate-300">{tip.sortingTip}</p>
                    </div>

                    {/* Value booster */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        Price Maximizer Explanation
                      </span>
                      <p className="text-emerald-200 font-medium">{tip.payoutBooster}</p>
                    </div>

                    {/* Safety warning if available */}
                    {tip.safetyWarning && (
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Safety Alert
                        </span>
                        <p className="text-amber-200 text-[11px]">{tip.safetyWarning}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Pickup Checklist */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Pre-Pickup Checklist ({completedCount} / {tipsData.actionChecklist.length} Done)
            </h4>
          </div>
          {completedCount === tipsData.actionChecklist.length && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1">
              Ready for Pickup 🚀
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tipsData.actionChecklist.map((check, idx) => {
            const isChecked = !!completedChecks[idx];
            return (
              <label
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 text-xs font-medium ${
                  isChecked
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span className={isChecked ? 'line-through text-slate-400' : ''}>{check}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Environmental Offset Fact Pill */}
      {tipsData.ecoFact && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Did you know? {tipsData.ecoFact}</span>
        </div>
      )}
    </div>
  );
};
