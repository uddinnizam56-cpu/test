import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Mic,
  Camera,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Zap,
  Leaf,
  Clock,
  ArrowRight,
  CheckCircle2,
  Recycle,
  MapPin,
  Bell,
  Box,
} from 'lucide-react';
import { ScrapItem, ScrapCategory, Language, PickupOrder, UserProfile, SidebarTipSuggestion } from '../../types';
import { translations } from '../../utils/translations';
import { ScrapPriceTrendChart } from './ScrapPriceTrendChart';
import { RecyclingTipsGuide } from './RecyclingTipsGuide';
import { RecyclingTipsSidebar } from './RecyclingTipsSidebar';
import customerCarbonHeroImg from '../../assets/images/customer_carbon_hero_1794691630511.jpg';
import smartEcoPledgeEmblemImg from '../../assets/images/smart_eco_pledge_emblem_1794691629693.jpg';

interface ScrapCategoryBrowserProps {
  categories: ScrapCategory[];
  items: ScrapItem[];
  orders: PickupOrder[];
  userProfile: UserProfile;
  language: Language;
  cart: { [itemId: string]: number };
  onUpdateCartQty: (itemId: string, qty: number) => void;
  onOpenAiScanner: () => void;
  onOpenArAssistant: (presetItemId?: string) => void;
  onOpenVoiceBooking: () => void;
  onOpenScheduleModal: () => void;
  activeOrderCount: number;
  onOpenActiveOrderTracking: () => void;
  onNavigateToImpact?: () => void;
  onNavigateToMap?: () => void;
  focusedChartItemId?: string | null;
  onTipAdded?: (tip: SidebarTipSuggestion) => void;
}

export const ScrapCategoryBrowser: React.FC<ScrapCategoryBrowserProps> = ({
  categories,
  items,
  orders,
  userProfile,
  language,
  cart,
  onUpdateCartQty,
  onOpenAiScanner,
  onOpenArAssistant,
  onOpenVoiceBooking,
  onOpenScheduleModal,
  activeOrderCount,
  onOpenActiveOrderTracking,
  onNavigateToImpact,
  onNavigateToMap,
  focusedChartItemId,
  onTipAdded,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = items.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const cartTotalItemsCount = Object.values(cart).reduce<number>((sum, q) => sum + Number(q || 0), 0);

  const calculateCartTotalValue = () => {
    return Object.entries(cart).reduce<number>((total, [itemId, qty]) => {
      const found = items.find((i) => i.id === itemId);
      return total + (found ? found.rate * Number(qty || 0) : 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Bento Grid Featured Widgets Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Bento Box 1: Gemini AI Scan (Featured Gradient Card) */}
        <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-2xl shadow-sm p-6 relative overflow-hidden flex flex-col justify-between border border-emerald-500/20">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>AI Photo Classifier</span>
              </div>
              <span className="text-xs text-emerald-100 font-semibold bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-white/10">
                Powered by Gemini
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 font-display">
              Scan & Identify Scrap Instantly
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm mb-4 max-w-lg leading-relaxed">
              Snap a picture of your old appliances, copper wire, newspaper stacks, or metal items. Gemini calculates weight & instant UPI payout rate!
            </p>
          </div>

          <div className="border-2 border-dashed border-white/30 rounded-xl p-4 bg-white/5 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center font-bold shadow-md shrink-0">
                <Camera className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Upload or Capture Image</div>
                <div className="text-[11px] text-emerald-200">Auto-detect material & CO₂ offset</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenAiScanner}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>{t.aiClassifyButton}</span>
              </button>
              <button
                onClick={() => onOpenArAssistant()}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>AR Measure</span>
              </button>
              <button
                onClick={onOpenVoiceBooking}
                className="flex-1 sm:flex-initial px-3 py-2.5 bg-emerald-900/50 hover:bg-emerald-900/80 text-white font-bold rounded-xl text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Mic className="w-4 h-4 text-emerald-300" />
                <span>{t.voiceBookingButton}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bento Box 2: Live GPS Tracking Executive Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Recycle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Pickup Status</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700">
                Active Dispatch
              </span>
            </div>

            {activeOrderCount > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Order #PC-2026-8801</span>
                    <span className="text-emerald-700 font-black">ETA: 4 Mins</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Manjunath Gowda (EV Rickshaw)</span>
                  </div>
                </div>

                <div className="relative h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  {/* Subtle map simulation graphic */}
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                  <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 bg-white/90 rounded-full shadow-xs border border-emerald-200 text-xs text-slate-800 font-bold">
                    <Recycle className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                    <span>1.2 km away from Indiranagar</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">No active pickup in progress</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Select items below to schedule doorstep collection</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            {activeOrderCount > 0 ? (
              <button
                onClick={onOpenActiveOrderTracking}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Track Executive GPS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenScheduleModal}
                className="w-full py-2 bg-slate-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Schedule New Pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bento Box 3: Market Rate Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Scrap Rates Index</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                Updated Today
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-800">Copper Wire</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-700">₹720 / kg</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-800">Paper & Books</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-700">₹14 / kg</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-xs font-bold text-slate-800">Iron Heavy Scrap</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-700">₹32 / kg</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Verified spot pricing</span>
            <span className="text-emerald-700 font-extrabold flex items-center gap-1">
              <span>{filteredItems.length} items listed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Map & Carbon Savings Quick Access Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interactive Map Highlight Card */}
        <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-sky-800/60 flex items-center justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center gap-3.5 relative z-10 min-w-0">
            <img
              src={customerCarbonHeroImg}
              alt="Bengaluru EV scrap pickup network"
              className="w-16 h-16 rounded-xl object-cover border border-sky-400/30 shrink-0 hidden sm:block"
            />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-sky-300">
                <span>Bengaluru Green Network</span>
                <span className="text-emerald-400">· Live GPS</span>
              </div>
              <h3 className="text-base font-extrabold text-white font-display truncate">
                Interactive Scrap Hubs & EV Map
              </h3>
              <p className="text-xs text-slate-300 max-w-sm line-clamp-2">
                Discover nearby BBMP material recovery centers, drop kiosks, and live electric pickup autos.
              </p>
            </div>
          </div>

          {onNavigateToMap && (
            <button
              onClick={onNavigateToMap}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 relative z-10 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Explore Map</span>
            </button>
          )}
        </div>

        {/* Carbon Savings & Smart Eco Pledge Highlight Card */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-800/60 flex items-center justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center gap-3.5 relative z-10 min-w-0">
            <img
              src={smartEcoPledgeEmblemImg}
              alt="Smart Eco Pledge and Carbon Savings crest"
              className="w-16 h-16 rounded-xl object-cover border border-emerald-400/30 shrink-0 hidden sm:block bg-white"
            />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                <span>Impact Timeline & Smart Pledge</span>
                <span className="text-amber-300">· Verified CO₂</span>
              </div>
              <h3 className="text-base font-extrabold text-white font-display truncate">
                Carbon Savings & Smart Eco Pledge
              </h3>
              <p className="text-xs text-emerald-100/80 max-w-sm line-clamp-2">
                Compare CO₂ offset against national averages, sign your Eco Pledge, and download your certificate.
              </p>
            </div>
          </div>

          {onNavigateToImpact && (
            <button
              onClick={onNavigateToImpact}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 relative z-10 cursor-pointer"
            >
              <Leaf className="w-4 h-4 text-emerald-900" />
              <span>View Carbon</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Browse Workspace + Recycling Tips Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Browse Catalog & Market Trends */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {/* 30-Day Scrap Price Trend Recharts Visualization */}
          <ScrapPriceTrendChart
            items={items}
            categories={categories}
            externalSelectedItemId={focusedChartItemId}
            onSelectItemToCart={(itemId) => {
              const currentQty = cart[itemId] || 0;
              onUpdateCartQty(itemId, currentQty > 0 ? currentQty + 1 : 1);
            }}
          />

          {/* Search & Category Filter Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scrap item (e.g., copper, cardboard, laptop, bottle)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 font-medium self-start sm:self-auto">
                Showing <span className="font-bold text-slate-900 tabular-nums">{filteredItems.length}</span> scrap rates
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Scrap Types
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold">
                    {cat.itemCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrap Item Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
          const qty = cart[item.id] || 0;
          return (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {item.category}
                  </span>
                  {item.trend && (
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        item.trend === 'up'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.trend === 'up' ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-emerald-600" /> Rate Up
                        </>
                      ) : (
                        'Stable'
                      )}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-700 transition-colors">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Price Rate & Unit */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900 font-display">
                      ₹{item.rate}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 ml-1">
                      / {item.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {t.minQuantity}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {item.minQty}
                    </span>
                  </div>
                </div>

                {/* Environmental Offset */}
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg mb-4">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Saves <strong className="font-bold">{item.co2Offset} kg</strong> CO₂ / {item.unit}</span>
                </div>
              </div>

              {/* Cart Counter Controls */}
              <div className="pt-2 border-t border-slate-100">
                {qty === 0 ? (
                  <button
                    onClick={() => onUpdateCartQty(item.id, 1)}
                    className="w-full py-2 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addToPickupList}</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                    <button
                      onClick={() => onUpdateCartQty(item.id, qty - 1)}
                      className="p-1.5 text-emerald-800 hover:bg-emerald-200/60 rounded-lg transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-center px-2">
                      <span className="text-xs font-extrabold text-emerald-950">
                        {qty} {item.unit}
                      </span>
                      <span className="block text-[10px] text-emerald-700 font-medium">
                        (≈ ₹{qty * item.rate})
                      </span>
                    </div>
                    <button
                      onClick={() => onUpdateCartQty(item.id, qty + 1)}
                      className="p-1.5 text-emerald-800 hover:bg-emerald-200/60 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
            })}
          </div>

          {/* AI Recycling Tips & Best Practices Guide */}
          <RecyclingTipsGuide cart={cart} items={items} language={language} />
        </div>

        {/* Right Sidebar: Dynamic Recycling Tips (History + Seasonal Trends + AI/AR) */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <RecyclingTipsSidebar
            items={items}
            orders={orders}
            userProfile={userProfile}
            cart={cart}
            language={language}
            onUpdateCartQty={onUpdateCartQty}
            onOpenAiScanner={onOpenAiScanner}
            onOpenArAssistant={onOpenArAssistant}
            onTipAdded={onTipAdded}
          />
        </div>
      </div>

      {/* Floating Pickup Cart Bar if items selected */}
      {cartTotalItemsCount > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-11/12 max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-800 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold border border-emerald-500/30">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">
                {cartTotalItemsCount} scrap item(s) selected
              </div>
              <div className="text-sm font-extrabold text-emerald-400 font-display">
                Est. Earnings: ₹{calculateCartTotalValue()}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenScheduleModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <span>{t.proceedToSchedule}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
