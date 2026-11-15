import React, { useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  History,
  CloudSun,
  Plus,
  Minus,
  Box,
  Camera,
  Leaf,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  ScrapItem,
  PickupOrder,
  UserProfile,
  Language,
  RecyclingSidebarData,
  SidebarTipSuggestion,
} from '../../types';

interface RecyclingTipsSidebarProps {
  items: ScrapItem[];
  orders: PickupOrder[];
  userProfile: UserProfile;
  cart: { [itemId: string]: number };
  language: Language;
  onUpdateCartQty: (itemId: string, qty: number) => void;
  onOpenAiScanner: () => void;
  onOpenArAssistant: (presetItemId?: string) => void;
  onTipAdded?: (tip: SidebarTipSuggestion) => void;
}

type SeasonKey = 'auto' | 'festive_autumn' | 'summer' | 'monsoon' | 'winter_declutter';

const SEASON_OPTIONS: { key: SeasonKey; label: string }[] = [
  { key: 'auto', label: 'Current' },
  { key: 'festive_autumn', label: 'Festive' },
  { key: 'summer', label: 'Summer' },
  { key: 'monsoon', label: 'Monsoon' },
  { key: 'winter_declutter', label: 'Winter' },
];

export const RecyclingTipsSidebar: React.FC<RecyclingTipsSidebarProps> = ({
  items,
  orders,
  userProfile,
  cart,
  language,
  onUpdateCartQty,
  onOpenAiScanner,
  onOpenArAssistant,
  onTipAdded,
}) => {
  const [seasonKey, setSeasonKey] = useState<SeasonKey>('auto');
  const [sidebarData, setSidebarData] = useState<RecyclingSidebarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const primaryAddress = userProfile.savedAddresses?.[0];
  const locality = primaryAddress?.area || 'Indiranagar';
  const city = primaryAddress?.city || 'Bengaluru';

  const userOrders = useMemo(() => {
    const matched = orders.filter((o) => o.customerId === userProfile.id);
    return matched.length > 0 ? matched : orders.slice(0, 2);
  }, [orders, userProfile.id]);

  const pastMaterialsStats = useMemo(() => {
    const uniqueIds = new Set<string>();
    let totalWeight = 0;
    userOrders.forEach((o) => {
      totalWeight += Number(o.totalWeight || 0);
      o.items.forEach((it) => uniqueIds.add(it.scrapItemId));
    });
    return {
      orderCount: userOrders.length,
      materialCount: uniqueIds.size,
      totalWeight: Math.round(totalWeight || userProfile.totalRecycledKg || 0),
    };
  }, [userOrders, userProfile.totalRecycledKg]);

  const buildOfflineFallbackTips = (selectedSeason: SeasonKey): RecyclingSidebarData => {
    const pastIds = new Set<string>();
    userOrders.forEach((o) => o.items.forEach((it) => pastIds.add(it.scrapItemId)));
    const topItems = [...items]
      .sort((a, b) => (b.trend === 'up' ? 1 : 0) - (a.trend === 'up' ? 1 : 0))
      .slice(0, 3);
    const seasonNames: Record<SeasonKey, string> = {
      auto: 'Seasonal & History Picks',
      festive_autumn: 'Festive Cleaning & Packaging',
      summer: 'Summer Beverage & E-Waste',
      monsoon: 'Monsoon Dry-Waste Protection',
      winter_declutter: 'Year-End Declutter',
    };
    return {
      seasonName: seasonNames[selectedSeason] || 'Local Recycling Picks',
      seasonWindow: `${city} · Offline Cache`,
      localTrendHeadline: `Cached spot rates and ${locality} recycling priorities ready offline.`,
      historySummary: `Based on ${pastMaterialsStats.orderCount} past pickup(s) (${pastMaterialsStats.totalWeight} kg recycled).`,
      arScanPrompt: 'Use AR Spatial Scan or AI Photo Scan when ready to measure piles.',
      aiPowered: false,
      suggestedMaterials: topItems.map((it) => ({
        scrapItemId: it.id,
        itemName: it.name,
        category: it.category,
        reasonType: pastIds.has(it.id)
          ? 'history'
          : it.trend === 'up'
          ? 'price_surge'
          : 'seasonal',
        reasonTag: pastIds.has(it.id)
          ? 'Repeat Pickup'
          : it.trend === 'up'
          ? 'High Demand'
          : 'Seasonal Pick',
        reasonText: pastIds.has(it.id)
          ? `Frequently included in your ${locality} pickups.`
          : `Strong local demand in ${city} at ₹${it.rate}/${it.unit}.`,
        prepTip: `Keep dry and sorted (${it.minQty} min pickup).`,
        suggestedQty: it.unit === 'piece' ? 1 : 5,
        unit: it.unit,
        estimatedRate: it.rate,
        co2OffsetPerUnit: it.co2Offset,
      })),
    };
  };

  const fetchSidebarTips = async (selectedSeason: SeasonKey = seasonKey) => {
    setLoading(true);
    setError(null);
    const cacheKey = `punarchakra_tips_cache_${selectedSeason}_${locality}`;
    try {
      const response = await fetch('/api/recycling-tips/sidebar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pastOrders: userOrders,
          availableItems: items,
          city,
          locality,
          seasonOverride: selectedSeason === 'auto' ? undefined : selectedSeason,
          language,
        }),
      });
      const json = await response.json();
      if (json.success && json.data) {
        setSidebarData(json.data);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(json.data));
        } catch {
          // Ignore storage quota errors
        }
      } else {
        throw new Error('Unable to refresh seasonal tips');
      }
    } catch {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setSidebarData(JSON.parse(cached));
        } else {
          setSidebarData(buildOfflineFallbackTips(selectedSeason));
        }
      } catch {
        setSidebarData(buildOfflineFallbackTips(selectedSeason));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarTips(seasonKey);
  }, [seasonKey, userOrders.length, items.length, locality]);

  const renderReasonIcon = (type: SidebarTipSuggestion['reasonType']) => {
    if (type === 'price_surge') {
      return <TrendingUp className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
    }
    if (type === 'history') {
      return <History className="w-3.5 h-3.5 text-sky-700 shrink-0" />;
    }
    return <CloudSun className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
  };

  return (
    <aside
      aria-label="Recycling Tips Sidebar"
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{sidebarData?.aiPowered ? 'Gemini AI Advisory' : 'Smart Local Advisory'}</span>
            <span aria-hidden="true">·</span>
            <span>{locality}</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 font-display tracking-tight mt-0.5">
            Recycling Tips
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Dynamic picks from your pickup history &amp; {city} seasonal demand
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchSidebarTips(seasonKey)}
          disabled={loading}
          title="Refresh AI recycling recommendations"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/60 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Season Selector & Local Trend Context */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{sidebarData?.seasonName || 'Local Seasonal Trend'}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">
            {sidebarData?.seasonWindow || `${city}`}
          </span>
        </div>

        {/* Interactive Season Filter Bar */}
        <div
          role="tablist"
          aria-label="Seasonal trend preview"
          className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto"
        >
          {SEASON_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              role="tab"
              aria-selected={seasonKey === opt.key}
              onClick={() => setSeasonKey(opt.key)}
              className={`flex-1 px-2 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                seasonKey === opt.key
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {sidebarData?.localTrendHeadline ||
            `Tracking active material recovery trends across ${locality}, ${city}.`}
        </p>

        {/* Pickup History Summary Line */}
        <div className="pt-2 border-t border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium tabular-nums">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <History className="w-3.5 h-3.5 text-sky-600" />
              Past Pickup Signals
            </span>
            <span>
              {pastMaterialsStats.orderCount} pickups · {pastMaterialsStats.totalWeight} kg
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {sidebarData?.historySummary || 'Analyzing your past doorstep pickups...'}
          </p>
        </div>
      </div>

      {/* Suggested Materials Feed */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Recommended to Recycle Now</span>
          <span className="text-[11px] text-slate-500 tabular-nums">
            {sidebarData?.suggestedMaterials.length || 0} matches
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchSidebarTips(seasonKey)}
              className="font-bold underline shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !sidebarData ? (
          <div className="space-y-3">
            {[1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="h-28 rounded-xl bg-slate-100 animate-pulse border border-slate-200/60"
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
            {(sidebarData?.suggestedMaterials || []).map((tip) => {
              const currentQty = cart[tip.scrapItemId] || 0;
              const catalogMatch = items.find((i) => i.id === tip.scrapItemId);
              const liveRate = catalogMatch ? catalogMatch.rate : tip.estimatedRate;

              return (
                <div
                  key={tip.scrapItemId}
                  className="p-3.5 bg-white hover:bg-slate-50/80 transition-colors space-y-2"
                >
                  {/* Row 1: Material Title & Rate */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {tip.itemName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        {renderReasonIcon(tip.reasonType)}
                        <span className="font-semibold text-slate-700">{tip.reasonTag}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tip.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <span className="text-sm font-black text-emerald-700">₹{liveRate}</span>
                      <span className="text-[11px] text-slate-500">/{tip.unit}</span>
                    </div>
                  </div>

                  {/* Row 2: History / Seasonal Reason + Prep Tip */}
                  <p className="text-[11px] text-slate-600 leading-relaxed">{tip.reasonText}</p>

                  <div className="text-[11px] text-emerald-800 bg-emerald-50/70 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">Prep:</strong> {tip.prepTip}
                    </span>
                  </div>

                  {/* Row 3: Quick Cart + AR Measure Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {currentQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCartQty(tip.scrapItemId, tip.suggestedQty);
                          onTipAdded?.(tip);
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="tabular-nums">
                          Add {tip.suggestedQty} {tip.unit}
                        </span>
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(tip.scrapItemId, currentQty - 1)}
                          className="p-1 text-emerald-800 hover:bg-emerald-200/70 rounded cursor-pointer"
                          aria-label={`Decrease ${tip.itemName} quantity`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[11px] font-extrabold text-emerald-900 tabular-nums flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {currentQty} {tip.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(tip.scrapItemId, currentQty + 1)}
                          className="p-1 text-emerald-800 hover:bg-emerald-200/70 rounded cursor-pointer"
                          aria-label={`Increase ${tip.itemName} quantity`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenArAssistant(tip.scrapItemId)}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
                      title={`Measure & inspect ${tip.itemName} in AR`}
                    >
                      <Box className="w-3.5 h-3.5 text-emerald-700" />
                      <span>AR View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI & AR Action Footer */}
      <div className="p-4 bg-slate-900 text-white space-y-2.5 mt-auto">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Box className="w-4 h-4 text-emerald-400" />
              <span>AI + AR Spatial Assistant</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              {sidebarData?.arScanPrompt ||
                'Measure scrap volume in 3D AR, preview sorting bins, and detect purity via Gemini Vision.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenArAssistant(sidebarData?.suggestedMaterials?.[0]?.scrapItemId)}
            className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Box className="w-3.5 h-3.5" />
            <span>AR Scanner</span>
          </button>

          <button
            type="button"
            onClick={onOpenAiScanner}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Photo</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
