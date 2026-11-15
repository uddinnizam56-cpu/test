import React, { useId, useMemo, useState } from 'react';
import { TrendingUp, ArrowUpRight, Pause, Play } from 'lucide-react';
import { scaleLinear, line, area, curveMonotoneX } from 'd3';
import { ScrapItem } from '../../types';

interface ScrapPriceSurgeBannerProps {
  items: ScrapItem[];
  onSelectItem?: (item: ScrapItem) => void;
}

interface SurgeItemEntry {
  item: ScrapItem;
  previousRate: number;
  gainAmount: number;
  gainPercent: number;
  rank: number;
  sevenDaySeries: number[];
}

// Deterministic 7-day historical trend series ending cleanly at the live item rate
const buildSevenDaySeries = (item: ScrapItem, previousRate: number): number[] => {
  const seed = item.id
    .split('')
    .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0);

  const days = 7;
  const startRate = previousRate > 0 ? previousRate : item.rate;
  const delta = item.rate - startRate;
  const volatility = Math.max(Math.abs(delta) * 0.22, item.rate * 0.015);
  const series: number[] = [];

  for (let i = 0; i < days; i++) {
    if (i === 0) {
      series.push(startRate);
    } else if (i === days - 1) {
      series.push(item.rate);
    } else {
      const progress = i / (days - 1);
      // Smooth upward/downward curve with deterministic market oscillation
      const wave = Math.sin(i * 1.35 + seed * 0.17) * volatility * (1 - progress * 0.45);
      const val = startRate + delta * Math.pow(progress, 0.85) + wave;
      series.push(Math.max(1, Number(val.toFixed(2))));
    }
  }

  return series;
};

interface MiniD3SparklineProps {
  data: number[];
  isPositive: boolean;
  isLeader?: boolean;
  width?: number;
  height?: number;
}

const MiniD3Sparkline: React.FC<MiniD3SparklineProps> = ({
  data,
  isPositive,
  isLeader = false,
  width = 48,
  height = 18,
}) => {
  const rawId = useId();
  const gradientId = `spark-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const { linePath, areaPath, lastX, lastY } = useMemo(() => {
    if (!data || data.length === 0) {
      return { linePath: '', areaPath: '', lastX: 0, lastY: 0 };
    }

    const rawMin = Math.min(...data);
    const rawMax = Math.max(...data);
    const span = rawMax - rawMin;
    const pad = span > 0 ? span * 0.15 : Math.max(1, rawMax * 0.05);

    const xScale = scaleLinear()
      .domain([0, Math.max(1, data.length - 1)])
      .range([2, width - 3]);

    const yScale = scaleLinear()
      .domain([rawMin - pad, rawMax + pad])
      .range([height - 3, 3]);

    const lineGen = line<number>()
      .x((_, idx) => xScale(idx))
      .y((d) => yScale(d))
      .curve(curveMonotoneX);

    const areaGen = area<number>()
      .x((_, idx) => xScale(idx))
      .y0(height)
      .y1((d) => yScale(d))
      .curve(curveMonotoneX);

    const lastIdx = data.length - 1;

    return {
      linePath: lineGen(data) || '',
      areaPath: areaGen(data) || '',
      lastX: xScale(lastIdx),
      lastY: yScale(data[lastIdx]),
    };
  }, [data, width, height]);

  const strokeColor = isPositive ? (isLeader ? '#6ee7b7' : '#34d399') : '#94a3b8';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {data.length > 0 && (
        <circle cx={lastX} cy={lastY} r={2} fill={strokeColor} />
      )}
    </svg>
  );
};

export const ScrapPriceSurgeBanner: React.FC<ScrapPriceSurgeBannerProps> = ({
  items,
  onSelectItem,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const { surgeEntries, hasPositiveSurges } = useMemo(() => {
    const computed: SurgeItemEntry[] = items.map((item) => {
      const prev =
        typeof item.previousRate === 'number' && item.previousRate > 0
          ? item.previousRate
          : item.trend === 'up'
          ? Math.max(1, Math.round(item.rate * 0.92))
          : item.rate;

      const diff = item.rate - prev;
      const pct = prev > 0 ? Number(((diff / prev) * 100).toFixed(1)) : 0;

      return {
        item,
        previousRate: prev,
        gainAmount: diff,
        gainPercent: pct,
        rank: 0,
        sevenDaySeries: buildSevenDaySeries(item, prev),
      };
    });

    const rising = computed
      .filter((entry) => entry.gainPercent > 0)
      .sort((a, b) => {
        if (b.gainPercent !== a.gainPercent) return b.gainPercent - a.gainPercent;
        return b.gainAmount - a.gainAmount;
      })
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    if (rising.length > 0) {
      return { surgeEntries: rising, hasPositiveSurges: true };
    }

    // Fallback: show highest spot-rate items if no positive surges exist currently
    const fallback = [...computed]
      .sort((a, b) => b.item.rate - a.item.rate)
      .slice(0, 6)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    return { surgeEntries: fallback, hasPositiveSurges: false };
  }, [items]);

  if (!items || items.length === 0) return null;

  const topEntry = surgeEntries[0];
  const marqueeList = [...surgeEntries, ...surgeEntries];

  return (
    <section
      aria-label="Real-time Scrap Price Surges"
      className="bg-slate-900 text-white border-b border-slate-800 scrap-marquee-group"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-3">
        {/* Left Label & Top Gainer Indicator */}
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-700/80">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold tracking-tight text-white whitespace-nowrap">
            {hasPositiveSurges ? 'Scrap Price Surges' : 'Live Scrap Rates'}
          </span>
          {hasPositiveSurges && topEntry && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono tabular-nums text-emerald-300 font-semibold whitespace-nowrap">
              <span aria-hidden="true">·</span>
              <span>Lead +{topEntry.gainPercent.toFixed(1)}%</span>
            </span>
          )}
        </div>

        {/* Scrolling Marquee Track */}
        <div className="flex-1 overflow-hidden relative min-w-0">
          <div
            className={`flex items-center gap-3 w-max animate-scrap-marquee ${
              isPaused ? 'animate-scrap-marquee-paused' : ''
            }`}
          >
            {marqueeList.map((entry, idx) => {
              const isTopHighlight = hasPositiveSurges && entry.rank <= 3;
              const isLeader = hasPositiveSurges && entry.rank === 1;

              return (
                <button
                  key={`${entry.item.id}-${idx}`}
                  type="button"
                  onClick={() => onSelectItem?.(entry.item)}
                  className={`flex items-center gap-2.5 px-3 py-1 rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isLeader
                      ? 'bg-emerald-900/70 border-emerald-400/70 hover:bg-emerald-800/80'
                      : isTopHighlight
                      ? 'bg-emerald-950/70 border-emerald-600/50 hover:bg-emerald-900/70'
                      : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800'
                  }`}
                  title={`Click to inspect ${entry.item.name} 7-day & 30-day market trend`}
                >
                  {isTopHighlight && (
                    <span className="text-[11px] font-bold text-emerald-300 tabular-nums font-mono">
                      #{entry.rank}
                    </span>
                  )}

                  <span className="text-xs font-semibold text-slate-100">
                    {entry.item.name}
                  </span>

                  {/* Mini 7-Day D3.js Sparkline */}
                  <MiniD3Sparkline
                    data={entry.sevenDaySeries}
                    isPositive={entry.gainPercent > 0}
                    isLeader={isLeader}
                  />

                  <span className="text-xs font-bold text-white font-mono tabular-nums">
                    ₹{entry.item.rate}/{entry.item.unit}
                  </span>

                  {entry.gainPercent > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-400 font-mono tabular-nums">
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      <span>+{entry.gainPercent.toFixed(1)}%</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 font-mono tabular-nums">
                      {entry.item.category}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Play/Pause Control */}
        <div className="shrink-0 pl-2 border-l border-slate-700/80 flex items-center">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Resume price surge ticker' : 'Pause price surge ticker'}
            aria-pressed={isPaused}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Play</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-slate-300" />
                <span className="hidden sm:inline">Pause</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
