import React, { useState } from 'react';
import {
  Building2,
  Truck,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Scale,
  Award,
  DollarSign,
  Plus,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Factory,
  Boxes,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BusinessProfile, Language, ScrapItem } from '../../types';
import { translations } from '../../utils/translations';
import { ArrowLeft, X } from 'lucide-react';
import businessCircularFacilityImg from '../../assets/images/business_circular_facility_1794691631257.jpg';

interface BusinessDashboardProps {
  business: BusinessProfile;
  items: ScrapItem[];
  language: Language;
  onBack?: () => void;
  onClose?: () => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  business,
  items,
  language,
  onBack,
  onClose,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'epr' | 'invoices'>('overview');

  // Bulk Pickup Form State
  const [pickupCategory, setPickupCategory] = useState('Heavy Machinery & Iron Scrap');
  const [estimatedTonnage, setEstimatedTonnage] = useState('3.5');
  const [truckType, setTruckType] = useState('5-Ton Hydraulic EV Tipper');
  const [scheduledDate, setScheduledDate] = useState('2026-11-15');
  const [manifestNotes, setManifestNotes] = useState('');
  const [pickupScheduledSuccess, setPickupScheduledSuccess] = useState(false);
  const [facilityImgError, setFacilityImgError] = useState(false);
  const [downloadBanner, setDownloadBanner] = useState<string | null>(null);

  const quarterlyCircularData = [
    {
      quarter: 'Q1 2026',
      tonnes: Number((business.tonnageCollected * 0.19).toFixed(1)),
      co2Tonnes: Number((business.co2OffsetTonnes * 0.18).toFixed(1)),
      targetTonnes: Number((business.tonnageCollected * 0.2).toFixed(1)),
    },
    {
      quarter: 'Q2 2026',
      tonnes: Number((business.tonnageCollected * 0.24).toFixed(1)),
      co2Tonnes: Number((business.co2OffsetTonnes * 0.23).toFixed(1)),
      targetTonnes: Number((business.tonnageCollected * 0.23).toFixed(1)),
    },
    {
      quarter: 'Q3 2026',
      tonnes: Number((business.tonnageCollected * 0.27).toFixed(1)),
      co2Tonnes: Number((business.co2OffsetTonnes * 0.28).toFixed(1)),
      targetTonnes: Number((business.tonnageCollected * 0.26).toFixed(1)),
    },
    {
      quarter: 'Q4 2026',
      tonnes: Number((business.tonnageCollected * 0.3).toFixed(1)),
      co2Tonnes: Number((business.co2OffsetTonnes * 0.31).toFixed(1)),
      targetTonnes: Number((business.tonnageCollected * 0.28).toFixed(1)),
    },
  ];

  const industrialStreamMix = [
    { name: 'Copper & Non-Ferrous', share: 32, color: '#d97706' },
    { name: 'Heavy Steel & Alloys', share: 28, color: '#059669' },
    { name: 'Corrugated Packaging', share: 21, color: '#0284c7' },
    { name: 'HDPE / PP Polymers', share: 11, color: '#0d9488' },
    { name: 'Server & IT E-Waste', share: 8, color: '#7c3aed' },
  ];

  const triggerDocDownloadNotice = (label: string) => {
    setDownloadBanner(label);
    setTimeout(() => setDownloadBanner(null), 4000);
  };

  const handleScheduleBulkPickup = (e: React.FormEvent) => {
    e.preventDefault();
    setPickupScheduledSuccess(true);
    setTimeout(() => {
      setPickupScheduledSuccess(false);
      setActiveTab('overview');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Portal Navigation Bar with Back & Close */}
      <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <button
          onClick={onBack || onClose}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-all group"
          title="Return to Portal Gateway Selection"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Portals</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
            Active: Industrial Enterprise Portal
          </span>
          <button
            onClick={onClose || onBack}
            className="p-1.5 px-2.5 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all flex items-center gap-1.5 text-xs font-extrabold"
            title="Close Industrial Portal"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Enterprise Corporate Header */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl border border-emerald-800/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                Industrial B2B Portal
              </span>
              <span className="text-xs text-emerald-200/80 font-mono font-bold">
                GSTIN: {business.gstin}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-display mt-1">
              {business.companyName}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Sector: {business.industryCategory} • Contact: {business.contactPerson} ({business.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className="flex-1 lg:flex-none px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all border border-emerald-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Bulk Truck Dispatch</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Industrial Overview & Rates</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'schedule'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Container Truck Dispatch</span>
        </button>

        <button
          onClick={() => setActiveTab('epr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'epr'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>EPR Compliance & Certificates</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-mono">
            {business.eprCertificatesCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'invoices'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>B2B Tax Invoices</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & INDUSTRIAL METRICS
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Total Factory Scrap</span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                {business.tonnageCollected} Tonnes
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Processed via automated segregation
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Scope 3 CO₂ Offset</span>
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                {business.co2OffsetTonnes} MT CO₂e
              </div>
              <p className="text-[11px] text-teal-700 font-semibold mt-1">
                ESG Audited & Verified
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">EPR Green Credits</span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                {business.eprCertificatesCount * 250} Credits
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                CPCB & KSPCB compliant
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Annual Waste Contract</span>
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                Active (Tier 1)
              </div>
              <p className="text-[11px] text-indigo-700 font-semibold mt-1">
                Zero Landfill Guarantee
              </p>
            </div>
          </div>

          {downloadBanner && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadBanner}</span>
            </div>
          )}

          {/* Circular Facility Visual Showcase */}
          <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-md">
            <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Zero-Landfill Recovery Facility · Bengaluru
                </div>
                <h3 className="text-xl font-black text-white font-display mt-1">
                  Automated Material Recovery & Scope 3 Tracking
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Every industrial bay load is weighed on calibrated digital weighbridges, sorted into verified secondary raw material streams, and logged for CPCB/KSPCB EPR audits.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Diversion Rate</span>
                  <span className="text-lg font-black text-emerald-400 font-display tabular-nums">98.4%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">EV Heavy Fleet</span>
                  <span className="text-lg font-black text-white font-display tabular-nums">100% EV</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">EPR Audits</span>
                  <span className="text-lg font-black text-amber-300 font-display tabular-nums">{business.eprCertificatesCount} Filed</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative min-h-[200px] bg-slate-800 flex items-center justify-center overflow-hidden">
              {!facilityImgError ? (
                <img
                  src={businessCircularFacilityImg}
                  alt="Solar-powered industrial circular material recovery facility"
                  onError={() => setFacilityImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Factory className="w-12 h-12 text-emerald-400" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                <span className="font-bold text-white">Peenya & Electronic City Hubs</span>
                <span className="font-mono font-bold text-emerald-300">ISO 14001</span>
              </div>
            </div>
          </div>

          {/* Industrial Recharts Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Quarterly Tonnage & Scope 3 CO2 Chart */}
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Quarterly Diversion (Tonnes) vs Scope 3 CO₂ Offset</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Measured facility scrap output against quarterly ESG benchmark
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={quarterlyCircularData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="tonnes" name="Scrap Diverted (Tonnes)" fill="#059669" radius={[8, 8, 0, 0]} barSize={28} />
                    <Bar dataKey="co2Tonnes" name="Scope 3 CO₂ Offset (MT)" fill="#0284c7" radius={[8, 8, 0, 0]} barSize={28} />
                    <Line type="monotone" dataKey="targetTonnes" name="Contract Target (T)" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4, fill: '#d97706' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Industrial Waste Stream Breakdown Donut */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-600" />
                  <span>Industrial Stream Composition</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Share of recovered feedstock across facility bays
                </p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industrialStreamMix}
                      dataKey="share"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {industrialStreamMix.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [`${val}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {industrialStreamMix.map((stream) => (
                  <div key={stream.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: stream.color }} />
                      <span>{stream.name}</span>
                    </span>
                    <span className="font-black text-slate-900 tabular-nums">{stream.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Industrial Scrap Bulk Rate Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  <span>Industrial Bulk Tonnage Rates (With Tiered Volume Incentives)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-volume industrial scrap generators receive higher index rates + full GST Reverse Charge Mechanism (RCM) documentation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{item.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-slate-500">Base Rate:</span>
                    <span className="font-bold text-slate-800">₹{item.rate}/{item.unit}</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 font-bold">
                    <span className="text-emerald-700">Bulk &gt; 1 Ton Rate:</span>
                    <span className="font-black text-emerald-700 text-sm">₹{Math.round(item.rate * 1.08)}/{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SCHEDULE BULK CONTAINER PICKUP
          ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Schedule Industrial Container Truck Dispatch</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Book our heavy electric transport fleet for factory bays, manufacturing scrap, and multi-ton corporate cleanups.
            </p>
          </div>

          {pickupScheduledSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Container Truck Dispatch Confirmed!</span>
                <span>Job reference #IND-2026-9042 created. Dispatch coordinator Manjunath assigned.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleScheduleBulkPickup} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Scrap Material Category
                </label>
                <select
                  value={pickupCategory}
                  onChange={(e) => setPickupCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Heavy Machinery & Iron Scrap">Heavy Machinery & Iron Scrap</option>
                  <option value="Copper Busbars & Industrial Cables">Copper Busbars & Industrial Cables</option>
                  <option value="Aluminum Turnings & Extrusions">Aluminum Turnings & Extrusions</option>
                  <option value="Packaging Corrugated Cartons (Bulk)">Packaging Corrugated Cartons (Bulk)</option>
                  <option value="Server Racks & E-Waste Electronics">Server Racks & E-Waste Electronics</option>
                  <option value="Industrial Plastic Polymers (HDPE/PP)">Industrial Plastic Polymers (HDPE/PP)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Scrap Weight (Tonnes)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={estimatedTonnage}
                  onChange={(e) => setEstimatedTonnage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Required Transport Vehicle Type
                </label>
                <select
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="5-Ton Hydraulic EV Tipper">5-Ton Hydraulic EV Tipper (Heavy Metal)</option>
                  <option value="10-Ton Heavy Container Truck">10-Ton Heavy Container Truck (Multi-Bay)</option>
                  <option value="3-Ton Covered EV Cargo Van">3-Ton Covered EV Cargo Van (E-Waste / Clean Scrap)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Requested Pickup Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Facility Pickup Gate & Loading Instructions
              </label>
              <textarea
                value={manifestNotes}
                onChange={(e) => setManifestNotes(e.target.value)}
                placeholder="e.g. Loading dock 4 near fabrication plant. Forklift available on site. Driver must wear safety shoes & vest."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Confirm & Dispatch Industrial Fleet</span>
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 3: EPR COMPLIANCE & GREEN CERTIFICATES
          ========================================================================= */}
      {activeTab === 'epr' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <span>Extended Producer Responsibility (EPR) & ESG Vault</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official statutory recycling compliance certificates compliant with Ministry of Environment, Forest and Climate Change (MoEFCC).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                certNo: 'PUNAR-EPR-2026-0941',
                period: 'Q3 2026 Audited Recycled Compliance',
                wasteType: 'Non-Ferrous Metals & E-Waste',
                volume: '14.8 Tonnes',
                issueDate: 'October 28, 2026',
              },
              {
                certNo: 'PUNAR-EPR-2026-0812',
                period: 'Q2 2026 Circular Material Recovery',
                wasteType: 'Corrugated Paperboard & Polymers',
                volume: '18.2 Tonnes',
                issueDate: 'July 15, 2026',
              },
              {
                certNo: 'PUNAR-EPR-2026-0604',
                period: 'Q1 2026 Zero-Landfill Waste Diversion',
                wasteType: 'Industrial Copper & Heavy Alloys',
                volume: '9.8 Tonnes',
                issueDate: 'April 10, 2026',
              },
            ].map((cert, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">{cert.period}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Certificate No: {cert.certNo} • Waste: {cert.wasteType} ({cert.volume})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => triggerDocDownloadNotice(`Prepared verified EPR Certificate ${cert.certNo} (${cert.volume}).`)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all text-[11px] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Certificate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: B2B TAX INVOICES
          ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>B2B Commercial Tax Invoices & Payout Receipts</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              GST compliant invoices with Reverse Charge Mechanism details for industrial accounting.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              { inv: 'INV-2026-PC-4410', date: '02 Nov 2026', items: 'Copper Scrap (2.2 Tonnes)', amount: '₹15,84,000', status: 'Settled via NEFT' },
              { inv: 'INV-2026-PC-3891', date: '18 Oct 2026', items: 'Cast Iron & Steel Machinery (5.8 Tonnes)', amount: '₹2,20,400', status: 'Settled via NEFT' },
              { inv: 'INV-2026-PC-3102', date: '29 Sep 2026', items: 'Industrial Cardboard & Packaging (4.1 Tonnes)', amount: '₹65,600', status: 'Settled via NEFT' },
            ].map((inv, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block font-mono">{inv.inv}</span>
                  <span className="text-[10px] text-slate-500">{inv.items} • {inv.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm block">{inv.amount}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{inv.status}</span>
                  </div>
                  <button
                    onClick={() => triggerDocDownloadNotice(`Prepared GST Tax Invoice ${inv.inv} (${inv.amount}).`)}
                    className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                    title="Download Tax Invoice"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
