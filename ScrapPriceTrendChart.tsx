import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Zap,
  Info,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';
import { ScrapCategory, ScrapItem } from '../../types';

interface ScrapPriceTrendChartProps {
  items: ScrapItem[];
  categories: ScrapCategory[];
  onSelectItemToCart?: (itemId: string) => void;
  externalSelectedItemId?: string | null;
}

// Generate 30 days of realistic trend data
const generate30DayTrendData = (baseRate: number, volatility: number) => {
  const data = [];
  const now = new Date();
  
  // Deterministic pseudo-random sequence for smooth, realistic curves
  let currentRate = baseRate * 0.88;
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Simulate market movements with slight upward momentum toward today
    const randomFactor = Math.sin(i * 0.4) * volatility + (30 - i) * (baseRate * 0.004);
    const rate = Math.round(currentRate + randomFactor);
    
    data.push({
      date: dateStr,
      rate: Math.max(1, rate),
      avg: Math.round(baseRate * 0.94),
    });
  }
  
  // Ensure the last day matches current base rate exactly
  if (data.length > 0) {
    data[data.length - 1].rate = baseRate;
  }
  
  return data;
};

export const ScrapPriceTrendChart: React.FC<ScrapPriceTrendChartProps> = ({
  items,
  categories,
  onSelectItemToCart,
  externalSelectedItemId,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '1');
  const [timeRange, setTimeRange] = useState<7 | 15 | 30>(30);

  useEffect(() => {
    if (externalSelectedItemId && items.some((i) => i.id === externalSelectedItemId)) {
      setSelectedItemId(externalSelectedItemId);
    }
  }, [externalSelectedItemId, items]);

  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedItemId) || items[0];
  }, [items, selectedItemId]);

  const full30DayData = useMemo(() => {
    if (!selectedItem) return [];
    // Adjust volatility based on rate magnitude
    const vol = Math.max(2, selectedItem.rate * 0.05);
    return generate30DayTrendData(selectedItem.rate, vol);
  }, [selectedItem]);

  const filteredTrendData = useMemo(() => {
    return full30DayData.slice(-timeRange);
  }, [full30DayData, timeRange]);

  const { minRate, maxRate, avgRate, percentChange, isPeak } = useMemo(() => {
    if (filteredTrendData.length === 0) {
      return { minRate: 0, maxRate: 0, avgRate: 0, percentChange: 0, isPeak: false };
    }
    const rates = filteredTrendData.map((d) => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    const startRate = rates[0];
    const endRate = rates[rates.length - 1];
    const pct = Number((((endRate - startRate) / startRate) * 100).toFixed(1));
    const peak = endRate >= max * 0.97;

    return { minRate: min, maxRate: max, avgRate: avg, percentChange: pct, isPeak: peak };
  }, [filteredTrendData]);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const diffFromAvg = val - avgRate;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <p className="font-bold text-slate-300 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>{label}</span>
          </p>
          <div className="text-base font-black text-emerald-400 font-display">
            ₹{val} <span className="text-[10px] text-slate-400 font-normal">/ {selectedItem?.unit}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1">
            30-Day Avg: ₹{avgRate} ({diffFromAvg >= 0 ? `+₹${diffFromAvg}` : `-₹${Math.abs(diffFromAvg)}`})
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="scrap-price-trends-section" className="bg-white rounded-3xl border border-emerald-100/80 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Smart Pricing Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">Updated Daily</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display tracking-tight">
            30-Day Scrap Price Trends & Market Forecast
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyze historical price movements to maximize your doorstep recycling returns.
          </p>
        </div>

        {/* Controls: Select Scrap Item + Time Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Select Item Dropdown */}
          <div className="relative">
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} (₹{it.rate}/{it.unit})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 7 ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange(15)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 15 ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              15 Days
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 30 ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {selectedItem && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Spot Rate
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 font-display">
                ₹{selectedItem.rate}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/ {selectedItem.unit}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {timeRange}-Day Trend Change
            </span>
            <div className="flex items-center gap-1 mt-1">
              {percentChange >= 0 ? (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  +{percentChange}%
                </span>
              ) : (
                <span className="text-xs font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3 text-rose-600" />
                  {percentChange}%
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Period High / Low
            </span>
            <div className="text-xs font-bold text-slate-800 mt-1">
              <span className="text-emerald-700">₹{maxRate}</span> / <span className="text-slate-500">₹{minRate}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Market Advice Signal
            </span>
            <div className="mt-1">
              {isPeak ? (
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-300">
                  <Zap className="w-3 h-3 text-emerald-700 fill-emerald-700" />
                  Peak Price (Sell Now)
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Info className="w-3 h-3 text-amber-600" />
                  Stable Market Rate
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recharts Line Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgRate}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{
                value: `Avg: ₹${avgRate}`,
                fill: '#64748b',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 3, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
              name="Rate (₹)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendation Footer Banner */}
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900">
              Optimal Timing Recommendation for {selectedItem?.name}:
            </span>
            <span className="text-slate-600 ml-1">
              Current market index is <strong className="text-emerald-700">{percentChange >= 0 ? `up +${percentChange}%` : `${percentChange}%`}</strong> over {timeRange} days. Recycling today guarantees instant payout at high rates!
            </span>
          </div>
        </div>

        {onSelectItemToCart && selectedItem && (
          <button
            onClick={() => onSelectItemToCart(selectedItem.id)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Add {selectedItem.name} to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
};
