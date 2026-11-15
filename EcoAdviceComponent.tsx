import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Leaf,
  RotateCw,
  CheckCircle2,
  Share2,
  Award,
  TreePine,
  Zap,
  TrendingDown,
  Info,
  ChevronRight,
  ShieldCheck,
  Globe2,
  Flame,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PickupOrder } from '../../types';

interface MaterialHack {
  material: string;
  upcyclingIdea: string;
  wasteReductionHabit: string;
  co2Savings: string;
}

interface EcoAdviceData {
  headline: string;
  summary: string;
  primaryTip: {
    title: string;
    action: string;
    impact: string;
    category: string;
  };
  materialHacks: MaterialHack[];
  dailyGreenChallenge: {
    title: string;
    description: string;
    rewardCoins: number;
    difficulty: 'Easy' | 'Medium' | 'Pro';
  };
  circularFact: string;
  naturePreserveFact: string;
}

interface EcoAdviceComponentProps {
  orders?: PickupOrder[];
  userName?: string;
  onRewardCoins?: (coins: number) => void;
  onOpenEcoQuiz?: () => void;
}

const COMMON_RECYCLABLES = [
  'Corrugated Cardboard',
  'Heavy Copper Wire',
  'PET Water Bottles',
  'Aluminum Cans',
  'E-Waste & Laptops',
  'Old Newspapers',
  'Brass Utensils',
];

export const EcoAdviceComponent: React.FC<EcoAdviceComponentProps> = ({
  orders = [],
  userName = 'Eco Citizen',
  onRewardCoins,
  onOpenEcoQuiz,
}) => {
  // Extract most recycled materials from user orders if available
  const detectedMaterials = React.useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      });
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    if (sorted.length > 0) return sorted.slice(0, 4);
    return ['Corrugated Cardboard', 'Heavy Copper Wire', 'PET Water Bottles'];
  }, [orders]);

  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(detectedMaterials);
  const [advice, setAdvice] = useState<EcoAdviceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tips' | 'hacks' | 'challenge'>('tips');

  const fetchAdvice = async (materials: string[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/eco-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recycledMaterials: materials,
          userName,
          city: 'Bengaluru',
          language: 'en',
        }),
      });
      const data = await res.json();
      if (data.success && data.advice) {
        setAdvice(data.advice);
      }
    } catch (err) {
      console.error('Failed to fetch eco advice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice(selectedMaterials);
  }, []);

  const handleToggleMaterial = (mat: string) => {
    let updated: string[];
    if (selectedMaterials.includes(mat)) {
      if (selectedMaterials.length === 1) return; // Keep at least one
      updated = selectedMaterials.filter((m) => m !== mat);
    } else {
      updated = [...selectedMaterials, mat];
    }
    setSelectedMaterials(updated);
    fetchAdvice(updated);
  };

  const handleCompleteChallenge = () => {
    if (challengeCompleted || !advice) return;
    setChallengeCompleted(true);
    const coins = advice.dailyGreenChallenge.rewardCoins || 25;
    if (onRewardCoins) {
      onRewardCoins(coins);
    }
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#f59e0b', '#3b82f6'],
    });
  };

  const handleShareAdvice = () => {
    if (!advice) return;
    const shareText = `🌿 PunarChakra Green Living Tip:\n"${advice.primaryTip.title}"\n${advice.primaryTip.action}\nImpact: ${advice.primaryTip.impact}\nRecycle smart with PunarChakra!`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/5 overflow-hidden">
      {/* Top Gradient Header with Gemini AI branding */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Gemini 3.8 Flash AI Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                Daily Eco-Advice
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              {advice?.headline || 'Personalized Green Living Suggestions'}
            </h2>
            <p className="text-emerald-100/90 text-sm mt-2 max-w-2xl leading-relaxed">
              {advice?.summary ||
                'Context-aware sustainability practices tailored to your most frequently recycled materials and household scrap.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchAdvice(selectedMaterials)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all active:scale-95 disabled:opacity-50"
              title="Generate fresh tips with Gemini API"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Consulting Gemini...' : 'Refresh Tips'}</span>
            </button>

            <button
              onClick={handleShareAdvice}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-extrabold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              title="Copy green tip"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Share Tip'}</span>
            </button>
          </div>
        </div>

        {/* Material Selection Chips */}
        <div className="mt-6 pt-5 border-t border-emerald-700/40">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Recycling Profile Focus:</span>
              <span className="text-[10px] text-emerald-300/70 font-normal">
                (Tap to toggle materials for AI analysis)
              </span>
            </span>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {selectedMaterials.length} materials selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_RECYCLABLES.map((mat) => {
              const isSelected = selectedMaterials.includes(mat);
              return (
                <button
                  key={mat}
                  onClick={() => handleToggleMaterial(mat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-400 text-slate-950 shadow-xs scale-102 ring-2 ring-emerald-300'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                  <span>{mat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Bar inside Eco-Advice Component */}
      <div className="px-6 sm:px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'tips'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Daily Spotlight & Tips
          </button>
          <button
            onClick={() => setActiveTab('hacks')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'hacks'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Upcycling & Material Hacks ({advice?.materialHacks.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'challenge'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Daily Challenge</span>
            {challengeCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
        </div>

        {onOpenEcoQuiz && (
          <button
            onClick={onOpenEcoQuiz}
            className="shrink-0 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Take Eco Quiz (+15 Coins)</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8 space-y-6">
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center animate-spin mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="font-extrabold text-slate-800 text-base">
              Synthesizing Daily Eco-Advice via Gemini 3.8 Flash...
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Analyzing lifecycle emissions, material purity factors, and Karnataka recycling metrics.
            </p>
          </div>
        )}

        {!loading && advice && activeTab === 'tips' && (
          <div className="space-y-6">
            {/* Primary Spotlight Tip Card */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                      {advice.primaryTip.category || 'Waste Segregation Spotlight'}
                    </span>
                    <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      Highest Impact Action
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 font-display">
                    {advice.primaryTip.title}
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed max-w-3xl">
                    {advice.primaryTip.action}
                  </p>
                </div>

                <div className="sm:self-stretch flex sm:flex-col justify-center items-end bg-emerald-100/70 p-4 rounded-2xl border border-emerald-200 shrink-0 min-w-[200px]">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Measurable Result
                  </span>
                  <p className="text-xs font-black text-emerald-950 mt-1 text-right">
                    {advice.primaryTip.impact}
                  </p>
                </div>
              </div>
            </div>

            {/* Circular Economy & Nature Preserve Facts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-teal-700 tracking-wider block mb-1">
                    Circular Economy Insight
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {advice.circularFact}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <TreePine className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider block mb-1">
                    Nature & Biodiversity Preservation
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {advice.naturePreserveFact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && advice && activeTab === 'hacks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {advice.materialHacks.map((hack, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-sm text-slate-900 font-display">
                      {hack.material}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-black text-[10px]">
                      Hack #{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                      <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider block mb-1">
                        💡 Zero-Cost Upcycling Idea:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {hack.upcyclingIdea}
                      </p>
                    </div>

                    <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100">
                      <span className="text-[10px] uppercase font-bold text-teal-900 tracking-wider block mb-1">
                        🔄 Prevention at Source:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {hack.wasteReductionHabit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    CO₂ Offsets:
                  </span>
                  <span className="text-right text-[10px] text-slate-600 font-medium">
                    {hack.co2Savings}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && advice && activeTab === 'challenge' && (
          <div className="bg-gradient-to-br from-amber-50 via-orange-50/30 to-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Daily Eco Challenge • {advice.dailyGreenChallenge.difficulty} Mode
                </span>
                <h3 className="text-2xl font-black text-slate-950 mt-2 font-display">
                  {advice.dailyGreenChallenge.title}
                </h3>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                  {advice.dailyGreenChallenge.description}
                </p>
              </div>

              <div className="pt-2">
                {challengeCompleted ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-md">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span>Challenge Completed! +{advice.dailyGreenChallenge.rewardCoins} Eco Coins Added</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCompleteChallenge}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Complete & Claim +{advice.dailyGreenChallenge.rewardCoins} Coins</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                Eco Coins can be redeemed for electricity bill discounts, tree plantation certificates, or green compost kits.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
