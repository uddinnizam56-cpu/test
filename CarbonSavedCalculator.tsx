import React, { useState, useMemo, useEffect } from 'react';
import {
  Leaf,
  Sparkles,
  TreePine,
  Car,
  Zap,
  Lightbulb,
  Sliders,
  RotateCcw,
  Award,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Download,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Target,
  Recycle,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PickupOrder, UserProfile } from '../../types';
import customerCarbonHeroImg from '../../assets/images/customer_carbon_hero_1794691630511.jpg';
import smartEcoPledgeEmblemImg from '../../assets/images/smart_eco_pledge_emblem_1794691629693.jpg';

export interface SmartEcoPledgeRecord {
  pledgeId: string;
  signedAt: string;
  frequency: 'Monthly' | 'Quarterly';
  monthlyTargetKg: number;
  commitments: string[];
  annualCo2Kg: number;
  bonusPointsEarned: number;
}

interface CarbonSavedCalculatorProps {
  orders?: PickupOrder[];
  userProfile: UserProfile;
  onBack?: () => void;
  onPledgeSigned?: (pledge: SmartEcoPledgeRecord) => void;
}

interface MaterialFactor {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  co2Factor: number; // kg CO2 saved per kg recycled
  unit: string;
  defaultKg: number;
}

const MATERIAL_FACTORS: MaterialFactor[] = [
  { id: 'paper', name: 'Paper & Cardboard', shortName: 'Paper', icon: '📄', color: '#059669', co2Factor: 0.9, unit: 'kg', defaultKg: 65 },
  { id: 'metal', name: 'Metals (Iron/Copper/Alu)', shortName: 'Metals', icon: '⚙️', color: '#d97706', co2Factor: 4.2, unit: 'kg', defaultKg: 40 },
  { id: 'plastic', name: 'Plastics & Bottles', shortName: 'Plastics', icon: '🍾', color: '#0284c7', co2Factor: 1.5, unit: 'kg', defaultKg: 35 },
  { id: 'ewaste', name: 'E-Waste & Electronics', shortName: 'E-Waste', icon: '💻', color: '#7c3aed', co2Factor: 3.8, unit: 'kg', defaultKg: 15 },
  { id: 'glass', name: 'Glass & Bottles', shortName: 'Glass', icon: '🍶', color: '#0d9488', co2Factor: 0.6, unit: 'kg', defaultKg: 20 },
];

interface PledgeCommitmentOption {
  id: string;
  title: string;
  subtitle: string;
  annualCo2BoostKg: number;
  bonusPoints: number;
}

const PLEDGE_OPTIONS: PledgeCommitmentOption[] = [
  {
    id: 'zero_ewaste',
    title: 'Zero E-Waste to Landfill',
    subtitle: 'Channel 100% of old electronics, cables & batteries through authorized recyclers',
    annualCo2BoostKg: 48,
    bonusPoints: 20,
  },
  {
    id: 'dry_paper_bundle',
    title: 'Clean Dry Paper & Carton Bundling',
    subtitle: 'Keep newspapers, parcels & books moisture-free for maximum pulp recovery',
    annualCo2BoostKg: 34,
    bonusPoints: 15,
  },
  {
    id: 'metal_segregation',
    title: 'High-Value Metal Segregation',
    subtitle: 'Separate copper, brass & aluminium cans from mixed household waste',
    annualCo2BoostKg: 62,
    bonusPoints: 25,
  },
  {
    id: 'plastic_rinse',
    title: 'Rinse & Flatten HDPE / PET Bottles',
    subtitle: 'Prep clean food-grade bottles and milk pouches for closed-loop pelletizing',
    annualCo2BoostKg: 29,
    bonusPoints: 15,
  },
  {
    id: 'ev_batch_pickup',
    title: 'EV Consolidated Pickup Slots',
    subtitle: 'Batch monthly pickups >= 15 kg to cut collection trips and maximize EV efficiency',
    annualCo2BoostKg: 22,
    bonusPoints: 10,
  },
];

// India Urban Household Average Monthly Recycling Carbon Offset Baseline (kg CO2e/month)
const INDIA_NATIONAL_AVG_MONTHLY_CO2 = 24;
const PLEDGE_STORAGE_KEY = 'punarchakra_smart_eco_pledge_v1';

export const CarbonSavedCalculator: React.FC<CarbonSavedCalculatorProps> = ({
  orders = [],
  userProfile,
  onBack,
  onPledgeSigned,
}) => {
  const [timelineView, setTimelineView] = useState<'monthly' | 'cumulative'>('monthly');
  const [heroImgError, setHeroImgError] = useState(false);
  const [emblemImgError, setEmblemImgError] = useState(false);
  const [downloadBanner, setDownloadBanner] = useState<string | null>(null);

  // Smart Eco Pledge State (persisted offline & online in localStorage)
  const [savedPledge, setSavedPledge] = useState<SmartEcoPledgeRecord | null>(() => {
    try {
      const raw = localStorage.getItem(PLEDGE_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SmartEcoPledgeRecord) : null;
    } catch {
      return null;
    }
  });
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>(() =>
    savedPledge?.commitments?.length
      ? savedPledge.commitments
      : ['zero_ewaste', 'dry_paper_bundle', 'metal_segregation']
  );
  const [pledgeFrequency, setPledgeFrequency] = useState<'Monthly' | 'Quarterly'>(
    savedPledge?.frequency || 'Monthly'
  );
  const [pledgeTargetKg, setPledgeTargetKg] = useState<number>(
    savedPledge?.monthlyTargetKg || 25
  );
  const [isEditingPledge, setIsEditingPledge] = useState<boolean>(!savedPledge);
  const [pledgeSuccessMsg, setPledgeSuccessMsg] = useState<string | null>(null);

  // Aggregate real orders totals if available
  const initialTotalsFromOrders = useMemo(() => {
    const totals: { [key: string]: number } = {
      paper: 65,
      metal: 40,
      plastic: 35,
      ewaste: 15,
      glass: 20,
    };

    if (orders && orders.length > 0) {
      orders.forEach((ord) => {
        ord.items.forEach((item) => {
          const qty = item.actualQty || item.estimatedQty || 0;
          const name = item.name.toLowerCase();
          if (name.includes('paper') || name.includes('cardboard') || name.includes('newspaper') || name.includes('book')) {
            totals.paper += qty;
          } else if (name.includes('metal') || name.includes('iron') || name.includes('copper') || name.includes('brass') || name.includes('aluminium')) {
            totals.metal += qty;
          } else if (name.includes('plastic') || name.includes('bottle')) {
            totals.plastic += qty;
          } else if (name.includes('e-waste') || name.includes('appliance') || name.includes('electronic') || name.includes('phone') || name.includes('laptop')) {
            totals.ewaste += qty;
          } else if (name.includes('glass')) {
            totals.glass += qty;
          }
        });
      });
    }

    return totals;
  }, [orders]);

  const [quantities, setQuantities] = useState<{ [key: string]: number }>(initialTotalsFromOrders);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    if (!isSimulating) {
      setQuantities(initialTotalsFromOrders);
    }
  }, [initialTotalsFromOrders, isSimulating]);

  const handleSliderChange = (id: string, value: number) => {
    setIsSimulating(true);
    setQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const handleResetToReal = () => {
    setQuantities(initialTotalsFromOrders);
    setIsSimulating(false);
  };

  // Calculations
  const {
    totalKgRecycled,
    totalCo2Saved,
    treesEquivalent,
    carKmAvoided,
    ledBulbHours,
    energySavedKwh,
    streamBreakdown,
  } = useMemo(() => {
    let weight = 0;
    let co2 = 0;
    const breakdown: Array<{ name: string; value: number; kg: number; color: string }> = [];

    MATERIAL_FACTORS.forEach((m) => {
      const kg = quantities[m.id] || 0;
      const streamCo2 = Math.round(kg * m.co2Factor);
      weight += kg;
      co2 += kg * m.co2Factor;
      breakdown.push({
        name: m.shortName,
        value: streamCo2,
        kg: Math.round(kg),
        color: m.color,
      });
    });

    const roundCo2 = Math.round(co2);
    const trees = Math.round(roundCo2 / 21);
    const carKm = Math.round(roundCo2 * 4.1);
    const ledHours = Math.round(roundCo2 * 85);
    const energyKwh = Math.round(roundCo2 * 2.3);

    return {
      totalKgRecycled: Math.round(weight),
      totalCo2Saved: roundCo2,
      treesEquivalent: Math.max(1, trees),
      carKmAvoided: carKm,
      ledBulbHours: ledHours,
      energySavedKwh: energyKwh,
      streamBreakdown: breakdown,
    };
  }, [quantities]);

  // Recharts Impact Timeline Dataset: Monthly CO2 Offset vs India National Household Avg
  const impactTimelineData = useMemo(() => {
    const now = new Date();
    const baseWeights = [0.11, 0.14, 0.16, 0.18, 0.19, 0.22];
    const focusHighlights = [
      'Paper & Books Bundling',
      'Metals & Copper Pickups',
      'Plastics & Glass Sort',
      'Spring Cleanout Drive',
      'E-Waste Recovery Batch',
      isSimulating ? 'Live What-If Projection' : 'Current Verified Month',
    ];

    let runningUser = 0;
    let runningNational = 0;

    return baseWeights.map((share, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const monthLabel = d.toLocaleString('en-IN', { month: 'short' });
      const monthlyYourCo2 = Math.max(
        18,
        Math.round(totalCo2Saved * share) + (idx === 5 && orders.length > 0 ? Math.min(25, orders.length * 4) : 0)
      );
      const monthlyNationalCo2 = INDIA_NATIONAL_AVG_MONTHLY_CO2 + (idx % 2 === 0 ? 1 : 0);

      runningUser += monthlyYourCo2;
      runningNational += monthlyNationalCo2;

      return {
        month: idx === 5 ? `${monthLabel} (Now)` : monthLabel,
        yourMonthlyCo2: monthlyYourCo2,
        nationalAvgMonthly: monthlyNationalCo2,
        yourCumulativeCo2: runningUser,
        nationalAvgCumulative: runningNational,
        deltaPercent: Math.round(((monthlyYourCo2 - monthlyNationalCo2) / monthlyNationalCo2) * 100),
        highlight: focusHighlights[idx],
      };
    });
  }, [totalCo2Saved, orders.length, isSimulating]);

  const latestMonthStats = impactTimelineData[impactTimelineData.length - 1];
  const avgMonthlyYourCo2 = Math.round(
    impactTimelineData.reduce((acc, pt) => acc + pt.yourMonthlyCo2, 0) / impactTimelineData.length
  );
  const vsNationalFactor = (avgMonthlyYourCo2 / INDIA_NATIONAL_AVG_MONTHLY_CO2).toFixed(1);

  // Determine Level / Milestone Badge based on totalCo2Saved
  const milestone = useMemo(() => {
    if (totalCo2Saved >= 1000) {
      return { title: 'Planet Hero Legend', target: 2500, percent: Math.min(100, Math.round((totalCo2Saved / 2500) * 100)) };
    } else if (totalCo2Saved >= 500) {
      return { title: 'Forest Defender', target: 1000, percent: Math.round((totalCo2Saved / 1000) * 100) };
    } else if (totalCo2Saved >= 200) {
      return { title: 'Green Citizen', target: 500, percent: Math.round((totalCo2Saved / 500) * 100) };
    } else {
      return { title: 'Eco Sprout', target: 200, percent: Math.round((totalCo2Saved / 200) * 100) };
    }
  }, [totalCo2Saved]);

  // Smart Eco Pledge calculations
  const pledgeProjections = useMemo(() => {
    const selectedObjects = PLEDGE_OPTIONS.filter((opt) => selectedCommitments.includes(opt.id));
    const commitmentCo2 = selectedObjects.reduce((s, o) => s + o.annualCo2BoostKg, 0);
    const volumeCo2 = Math.round(pledgeTargetKg * 12 * 1.65);
    const annualCo2Kg = commitmentCo2 + volumeCo2;
    const bonusPoints = selectedObjects.reduce((s, o) => s + o.bonusPoints, 0) + (pledgeTargetKg >= 30 ? 15 : 5);
    return {
      annualCo2Kg,
      treesProtected: Math.max(1, Math.round(annualCo2Kg / 21)),
      bonusPoints,
    };
  }, [selectedCommitments, pledgeTargetKg]);

  const toggleCommitment = (id: string) => {
    setSelectedCommitments((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  };

  const handleSignSmartPledge = () => {
    const commitmentNames = PLEDGE_OPTIONS.filter((o) => selectedCommitments.includes(o.id)).map(
      (o) => o.title
    );
    const record: SmartEcoPledgeRecord = {
      pledgeId: savedPledge?.pledgeId || `PLEDGE-PC-${Date.now().toString().slice(-6)}`,
      signedAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      frequency: pledgeFrequency,
      monthlyTargetKg: pledgeTargetKg,
      commitments: selectedCommitments,
      annualCo2Kg: pledgeProjections.annualCo2Kg,
      bonusPointsEarned: savedPledge ? 0 : pledgeProjections.bonusPoints,
    };

    try {
      localStorage.setItem(PLEDGE_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // ignore storage quota
    }

    const wasNew = !savedPledge;
    setSavedPledge(record);
    setIsEditingPledge(false);
    setPledgeSuccessMsg(
      wasNew
        ? `Smart Eco Pledge activated! +${pledgeProjections.bonusPoints} Eco Coins credited · Commitments: ${commitmentNames.join(', ')}`
        : `Smart Eco Pledge updated (${pledgeTargetKg} kg/month target · ${pledgeProjections.annualCo2Kg} kg CO₂/yr projected)`
    );

    if (onPledgeSigned) {
      onPledgeSigned({
        ...record,
        commitments: commitmentNames,
      });
    }
  };

  // Download Official Green Citizen Carbon Certificate
  const handleDownloadCertificate = () => {
    const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Green_Citizen_Certificate_${userProfile.name.replace(/\s+/g, '_')}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0fdf4; margin: 0; padding: 40px; }
    .cert-frame { max-width: 840px; margin: 0 auto; background: #ffffff; border: 12px solid #059669; border-radius: 24px; padding: 50px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.08); position: relative; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; font-size: 160px; font-weight: 900; pointer-events: none; }
    h1 { color: #065f46; font-size: 32px; font-weight: 900; text-transform: uppercase; margin: 0 0 6px; letter-spacing: 1px; }
    h2 { color: #0f172a; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 28px; }
    .recipient { font-size: 30px; font-weight: 900; color: #059669; border-bottom: 2px dashed #a7f3d0; display: inline-block; padding-bottom: 6px; margin-bottom: 20px; }
    .description { font-size: 15px; color: #334155; line-height: 1.6; max-width: 620px; margin: 0 auto 36px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 650px; margin: 0 auto 36px; }
    .stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 18px 12px; }
    .stat-card .val { font-size: 26px; font-weight: 900; color: #065f46; margin-bottom: 4px; }
    .stat-card .lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #166534; }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="watermark">PUNARCHAKRA</div>
    <h1>Certificate of Carbon Offset</h1>
    <h2>Karnataka Green Circular Economy Initiative</h2>
    <div class="recipient">${userProfile.name}</div>
    <p class="description">
      For outstanding commitment to environmental stewardship, zero-waste diversion, and urban circular recycling in Bengaluru, Karnataka.
    </p>
    <div class="stats-grid">
      <div class="stat-card"><div class="val">${totalCo2Saved.toLocaleString()} kg</div><div class="lbl">CO₂ Offset Avoided</div></div>
      <div class="stat-card"><div class="val">${treesEquivalent} Trees</div><div class="lbl">Yearly Absorption Equivalent</div></div>
      <div class="stat-card"><div class="val">${totalKgRecycled} kg</div><div class="lbl">Total Scrap Diverted</div></div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([certHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Green_Citizen_Certificate_${userProfile.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadBanner(`Downloaded Green Citizen Certificate (${totalCo2Saved.toLocaleString()} kg CO₂e verified).`);
    setTimeout(() => setDownloadBanner(null), 4000);
  };

  const whatsappShareHref = useMemo(() => {
    const text = encodeURIComponent(
      `My Green Carbon Impact with PunarChakra!\n\n` +
        `${totalCo2Saved.toLocaleString()} kg CO2 emissions avoided from doorstep scrap recycling (${vsNationalFactor}x India urban household average).\n` +
        `Equivalent to ${treesEquivalent} trees absorbing carbon for a full year and ${carKmAvoided.toLocaleString()} km of car exhaust saved.\n` +
        `Total Scrap Diverted: ${totalKgRecycled} kg`
    );
    return `https://wa.me/?text=${text}`;
  }, [totalCo2Saved, vsNationalFactor, treesEquivalent, carKmAvoided, totalKgRecycled]);

  const pledgeProgressPercent = savedPledge
    ? Math.min(100, Math.round(((orders.reduce((s, o) => s + (o.totalWeight || 18), 0) || 22) / savedPledge.monthlyTargetKg) * 100))
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition-all cursor-pointer border border-slate-200"
              title="Return to Scrap Categories"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
            </button>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <span className="inline-flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Environmental Impact & Carbon Offset
              </span>
              {isSimulating && (
                <span className="text-amber-700 font-extrabold">
                  · What-If Simulation Active
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
              Carbon Savings, Impact Timeline & Eco Pledge
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified emissions avoided from doorstep recycling compared with India urban household averages.
            </p>
          </div>
        </div>

        {/* Action Buttons: Certificate, WhatsApp Share, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadCertificate}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Green Certificate</span>
          </button>

          <a
            href={whatsappShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
            <span>Share Impact</span>
          </a>

          {isSimulating && (
            <button
              onClick={handleResetToReal}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-300 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {downloadBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadBanner}</span>
        </div>
      )}

      {/* Hero Impact Visual Banner with Bespoke Editorial Graphic */}
      <div className="rounded-3xl bg-slate-900 text-white overflow-hidden border border-slate-800 shadow-lg grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider block">
                Lifetime CO₂ Emissions Avoided
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black font-display text-white tabular-nums">
                  {totalCo2Saved.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-emerald-400">kg CO₂e</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 tabular-nums">
                {vsNationalFactor}x India urban household avg ({INDIA_NATIONAL_AVG_MONTHLY_CO2} kg/mo) · {totalKgRecycled} kg scrap diverted
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                Citizen Tier
              </span>
              <span className="text-sm font-black text-white font-display">
                {milestone.title}
              </span>
            </div>
          </div>

          {/* Visual Gauge Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold tabular-nums">
              <span className="text-slate-300">Next Tier Milestone ({milestone.percent}%)</span>
              <span className="text-emerald-400">
                {totalCo2Saved} / {milestone.target} kg CO₂e
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3.5 p-0.5 border border-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300"
                style={{ width: `${milestone.percent}%` }}
              />
            </div>
          </div>

          {/* Inline Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TreePine className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-black text-white font-display tabular-nums">
                  {treesEquivalent} Trees
                </div>
                <div className="text-[11px] text-slate-400">1-year CO₂ absorption</div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-black text-white font-display tabular-nums">
                  {carKmAvoided.toLocaleString()} km
                </div>
                <div className="text-[11px] text-slate-400">Exhaust emissions avoided</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Editorial Artwork Frame */}
        <div className="lg:col-span-5 relative min-h-[210px] bg-gradient-to-br from-emerald-950 to-slate-900 flex items-center justify-center overflow-hidden">
          {!heroImgError ? (
            <img
              src={customerCarbonHeroImg}
              alt="Doorstep electric scrap recycling in Bengaluru"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover opacity-95"
            />
          ) : (
            <div className="p-6 text-center space-y-2">
              <Recycle className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-emerald-200">Clean Circular Recycling Network</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
            <span className="font-bold text-white drop-shadow-xs">
              100% EV Doorstep Recovery
            </span>
            <span className="font-mono font-bold text-emerald-300 tabular-nums">
              {orders.length} Order(s)
            </span>
          </div>
        </div>
      </div>

      {/* 4 Equivalence Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl w-fit mb-2">
            <TreePine className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Trees Planted</span>
          <span className="text-xl font-black text-slate-900 font-display mt-0.5 block tabular-nums">
            {treesEquivalent} Trees
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Annual CO₂ absorb equiv.</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl w-fit mb-2">
            <Lightbulb className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">LED Light Hours</span>
          <span className="text-xl font-black text-slate-900 font-display mt-0.5 block tabular-nums">
            {ledBulbHours.toLocaleString()} hrs
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">10W lighting power saved</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="p-2 bg-sky-100 text-sky-800 rounded-xl w-fit mb-2">
            <Car className="w-4 h-4 text-sky-700" />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Car Exhaust Saved</span>
          <span className="text-xl font-black text-slate-900 font-display mt-0.5 block tabular-nums">
            {carKmAvoided.toLocaleString()} km
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Urban tailpipe CO₂ avoided</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="p-2 bg-violet-100 text-violet-800 rounded-xl w-fit mb-2">
            <Zap className="w-4 h-4 text-violet-700" />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Energy Conserved</span>
          <span className="text-xl font-black text-slate-900 font-display mt-0.5 block tabular-nums">
            {energySavedKwh.toLocaleString()} kWh
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Virgin manufacturing saved</span>
        </div>
      </div>

      {/* RECHARTS IMPACT TIMELINE + STREAM BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recharts Impact Timeline vs National Average */}
        <div className="lg:col-span-8 bg-slate-50/70 rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
                  Impact Timeline: CO₂ Offset vs National Average
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                6-month trend · You average <strong className="text-emerald-700">{avgMonthlyYourCo2} kg/mo</strong> vs India Urban Avg <strong className="text-slate-700">{INDIA_NATIONAL_AVG_MONTHLY_CO2} kg/mo</strong> ({latestMonthStats.deltaPercent >= 0 ? `+${latestMonthStats.deltaPercent}%` : `${latestMonthStats.deltaPercent}%`} this month)
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setTimelineView('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  timelineView === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Monthly Offset
              </button>
              <button
                onClick={() => setTimelineView('cumulative')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  timelineView === 'cumulative'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cumulative
              </button>
            </div>
          </div>

          <div className="h-72 w-full bg-white rounded-2xl border border-slate-200/80 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={impactTimelineData} margin={{ top: 14, right: 16, left: -8, bottom: 4 }}>
                <defs>
                  <linearGradient id="impactUserFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  unit=" kg"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const row = payload[0].payload;
                    const yourVal = timelineView === 'monthly' ? row.yourMonthlyCo2 : row.yourCumulativeCo2;
                    const natVal = timelineView === 'monthly' ? row.nationalAvgMonthly : row.nationalAvgCumulative;
                    const beatPct = Math.round(((yourVal - natVal) / natVal) * 100);
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5">
                        <div className="font-extrabold text-emerald-300">{label} · {row.highlight}</div>
                        <div className="flex items-center justify-between gap-4 tabular-nums">
                          <span className="text-slate-300">Your CO₂ Offset:</span>
                          <span className="font-black text-white">{yourVal} kg CO₂e</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 tabular-nums">
                          <span className="text-slate-300">India Urban Avg:</span>
                          <span className="font-bold text-amber-300">{natVal} kg CO₂e</span>
                        </div>
                        <div className="pt-1 border-t border-slate-700 text-[11px] font-bold text-emerald-400 tabular-nums">
                          {beatPct >= 0 ? `+${beatPct}% ahead of national avg` : `${beatPct}% vs national avg`}
                        </div>
                      </div>
                    );
                  }}
                />
                {timelineView === 'monthly' ? (
                  <>
                    <ReferenceLine
                      y={INDIA_NATIONAL_AVG_MONTHLY_CO2}
                      stroke="#d97706"
                      strokeDasharray="4 4"
                      label={{
                        value: `National Avg (${INDIA_NATIONAL_AVG_MONTHLY_CO2} kg)`,
                        position: 'insideTopLeft',
                        fill: '#b45309',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <Bar
                      dataKey="yourMonthlyCo2"
                      name="Your Monthly Offset (kg CO₂)"
                      fill="#059669"
                      radius={[8, 8, 0, 0]}
                      barSize={32}
                    />
                    <Line
                      type="monotone"
                      dataKey="nationalAvgMonthly"
                      name="India Household Avg (kg CO₂)"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      strokeDasharray="5 4"
                      dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                    />
                  </>
                ) : (
                  <>
                    <Area
                      type="monotone"
                      dataKey="yourCumulativeCo2"
                      name="Your Cumulative CO₂ (kg)"
                      stroke="#059669"
                      strokeWidth={3}
                      fill="url(#impactUserFill)"
                    />
                    <Line
                      type="monotone"
                      dataKey="nationalAvgCumulative"
                      name="National Avg Cumulative (kg)"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      strokeDasharray="5 4"
                      dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 px-1">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                Your Verified Offset
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-800">
                <span className="w-4 border-t-2 border-dashed border-amber-600 inline-block" />
                India Household Avg (CPCB Urban Baseline)
              </span>
            </div>
            <span className="font-semibold text-slate-500">Updates live with What-If sliders</span>
          </div>
        </div>

        {/* Recharts Stream Breakdown Donut */}
        <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
                CO₂ Share by Material
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Which scrap streams drive your carbon offset
            </p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={streamBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {streamBreakdown.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} kg CO₂e`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {streamBreakdown.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1 border-b border-slate-200/70 last:border-b-0">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                  <span>{s.name}</span>
                </span>
                <span className="font-extrabold text-slate-900 tabular-nums">
                  {s.value} kg CO₂ <span className="text-slate-400 font-normal">({s.kg} kg)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SMART ECO PLEDGE MODULE */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-200/70">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-emerald-200 bg-white shadow-xs shrink-0 flex items-center justify-center">
              {!emblemImgError ? (
                <img
                  src={smartEcoPledgeEmblemImg}
                  alt="Smart Eco Pledge Botanical Crest"
                  onError={() => setEmblemImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-emerald-700">
                <Target className="w-3.5 h-3.5" />
                <span>Smart Eco Pledge · Citizen Climate Commitment</span>
              </div>
              <h4 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-0.5">
                {savedPledge && !isEditingPledge
                  ? 'Your Active Smart Eco Pledge'
                  : 'Customize & Sign Your Smart Eco Pledge'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Commit to high-impact household segregation habits, track monthly targets, and unlock Eco Coin bonuses.
              </p>
            </div>
          </div>

          {savedPledge && !isEditingPledge && (
            <button
              onClick={() => setIsEditingPledge(true)}
              className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-extrabold transition-all cursor-pointer self-start md:self-auto"
            >
              Adjust Pledge Targets
            </button>
          )}
        </div>

        {pledgeSuccessMsg && (
          <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>{pledgeSuccessMsg}</span>
          </div>
        )}

        {savedPledge && !isEditingPledge ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {/* Active Signed Pledge Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                    Verified Pledge Certificate · {savedPledge.pledgeId}
                  </span>
                  <h5 className="text-base font-black text-slate-900 font-display">
                    Signed by {userProfile.name} on {savedPledge.signedAt}
                  </h5>
                </div>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg tabular-nums">
                  {savedPledge.frequency} · {savedPledge.monthlyTargetKg} kg/mo Goal
                </span>
              </div>

              {/* Active Commitments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PLEDGE_OPTIONS.filter((o) => savedPledge.commitments.includes(o.id)).map((opt) => (
                  <div
                    key={opt.id}
                    className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-900 block">{opt.title}</span>
                      <span className="text-[11px] text-emerald-800 font-semibold tabular-nums">
                        +{opt.annualCo2BoostKg} kg CO₂/yr impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Progress vs Signed Goal */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                  <span className="text-slate-700">Current Cycle Progress Toward Pledge</span>
                  <span className="text-emerald-700">{pledgeProgressPercent}% Completed</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${pledgeProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Projected Annual Impact Summary */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                  Projected Annual Impact
                </span>
                <div className="text-3xl font-black font-display text-white mt-1 tabular-nums">
                  {savedPledge.annualCo2Kg.toLocaleString()} kg CO₂
                </div>
                <p className="text-xs text-slate-300 mt-1 tabular-nums">
                  Equivalent to protecting {Math.max(1, Math.round(savedPledge.annualCo2Kg / 21))} mature trees every year.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Synced & Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Commitments Checklist */}
            <div className="lg:col-span-8 space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                1. Select Household Circular Commitments ({selectedCommitments.length} chosen)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PLEDGE_OPTIONS.map((opt) => {
                  const isSelected = selectedCommitments.includes(opt.id);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => toggleCommitment(opt.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-900">{opt.title}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.subtitle}</p>
                        <div className="text-[10px] font-bold text-emerald-700 mt-1 tabular-nums">
                          +{opt.annualCo2BoostKg} kg CO₂/yr · +{opt.bonusPoints} Eco Coins
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Configuration & Sign CTA */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1.5">
                    2. Review Cadence
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Monthly', 'Quarterly'] as const).map((freq) => (
                      <button
                        type="button"
                        key={freq}
                        onClick={() => setPledgeFrequency(freq)}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          pledgeFrequency === freq
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{freq}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-1">
                    <span>3. Monthly Scrap Target</span>
                    <span className="text-emerald-700 tabular-nums">{pledgeTargetKg} kg / mo</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={pledgeTargetKg}
                    onChange={(e) => setPledgeTargetKg(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 tabular-nums">
                    <span>10 kg (Starter)</span>
                    <span>100 kg (Zero-Waste)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Projected Annual Offset:</span>
                    <span className="font-black text-emerald-900">{pledgeProjections.annualCo2Kg} kg CO₂</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Trees Protected / Yr:</span>
                    <span className="font-black text-emerald-900">{pledgeProjections.treesProtected} Trees</span>
                  </div>
                  {!savedPledge && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Activation Reward:</span>
                      <span className="font-black text-amber-700">+{pledgeProjections.bonusPoints} Eco Coins</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {savedPledge && (
                  <button
                    type="button"
                    onClick={() => setIsEditingPledge(false)}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSignSmartPledge}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{savedPledge ? 'Update Smart Eco Pledge' : 'Sign & Activate Pledge'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Material Sliders Simulator */}
      <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-slate-900 font-display">
              Interactive What-If Material Simulator
            </h4>
          </div>
          <span className="text-xs text-slate-500">Drag sliders to update Impact Timeline & CO₂ breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MATERIAL_FACTORS.map((m) => {
            const currentVal = quantities[m.id] || 0;
            const co2Contribution = Math.round(currentVal * m.co2Factor);

            return (
              <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span>{m.icon}</span>
                    <span>{m.name}</span>
                  </span>
                  <span className="text-emerald-700 font-black tabular-nums">
                    {currentVal} {m.unit}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={currentVal}
                  onChange={(e) => handleSliderChange(m.id, Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-500 tabular-nums">
                  <span>Factor: {m.co2Factor} kg CO₂ / kg</span>
                  <span className="font-bold text-slate-700">={co2Contribution} kg CO₂</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Green Milestones Checklist */}
      <div className="bg-emerald-50/60 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase text-emerald-950 tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verified Eco Milestones</span>
          </h4>
          <span className="text-[11px] font-bold text-emerald-800 tabular-nums">
            Next goal: {milestone.target} kg CO₂
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-emerald-100 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero-Waste Household Tier 1 (Source-segregated scrap)</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-emerald-100 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>E-Waste Hero (Authorized digital asset recycling)</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-emerald-100 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>EV Dispatch Partner (Zero-emission doorstep pickup)</span>
          </div>
        </div>
      </div>

      {/* Footer Return / Navigation Button */}
      {onBack && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Return to Scrap Categories Browser</span>
          </button>

          <span className="text-xs text-slate-400 font-medium">
            PunarChakra Environmental Solutions Ltd.
          </span>
        </div>
      )}
    </div>
  );
};
