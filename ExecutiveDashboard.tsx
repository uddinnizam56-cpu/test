import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Scale,
  CheckCircle2,
  Phone,
  DollarSign,
  QrCode,
  Navigation,
  Star,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle,
  Map as MapIcon,
  ListTodo,
  BatteryCharging,
  BarChart3,
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
} from 'recharts';
import { PickupOrder, Language } from '../../types';
import { translations } from '../../utils/translations';
import { ExecutiveMapTab } from './ExecutiveMapTab';
import { ArrowLeft, X } from 'lucide-react';
import fleetEvOperationsImg from '../../assets/images/fleet_ev_operations_1794691631469.jpg';

interface ExecutiveDashboardProps {
  orders: PickupOrder[];
  language: Language;
  onUpdateOrderStatus: (
    orderId: string,
    newStatus: PickupOrder['status'],
    finalAmount?: number,
    totalWeight?: number
  ) => void;
  onBack?: () => void;
  onClose?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  orders,
  language,
  onUpdateOrderStatus,
  onBack,
  onClose,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'workspace' | 'map'>('workspace');
  const [activeJob, setActiveJob] = useState<PickupOrder | null>(
    orders.find((o) => o.status === 'en_route' || o.status === 'assigned') || orders[0] || null
  );

  // Digital Scale State
  const [itemWeights, setItemWeights] = useState<{ [itemId: string]: number }>({});
  const [scaleConnected, setScaleConnected] = useState<boolean>(true);
  const [showUpiQr, setShowUpiQr] = useState<boolean>(false);
  const [fleetImgError, setFleetImgError] = useState<boolean>(false);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  if (!activeJob) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
        <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-500">No assigned pickups right now</p>
      </div>
    );
  }

  const handleWeightChange = (itemId: string, val: number) => {
    setItemWeights((prev) => ({ ...prev, [itemId]: val }));
  };

  const calculateFinalPayout = () => {
    return activeJob.items.reduce((total, item) => {
      const actualQty = itemWeights[item.scrapItemId] ?? item.estimatedQty;
      return total + actualQty * item.ratePerUnit;
    }, 0);
  };

  const calculateTotalWeightKg = () => {
    return activeJob.items.reduce((total, item) => {
      const actualQty = itemWeights[item.scrapItemId] ?? item.estimatedQty;
      return total + (item.unit === 'kg' ? actualQty : 1);
    }, 0);
  };

  const handleCompletePickup = () => {
    const finalAmount = calculateFinalPayout();
    const totalWeight = calculateTotalWeightKg();
    onUpdateOrderStatus(activeJob.id, 'completed', finalAmount, totalWeight);
    setCompletionNotice(
      `Pickup Order #${activeJob.orderNumber} completed (${totalWeight} kg). Instant payout of ₹${finalAmount} credited via UPI.`
    );
    setShowUpiQr(false);
    setTimeout(() => setCompletionNotice(null), 5000);
  };

  const zoneShiftData = (() => {
    const baseZones: Array<{ zone: string; kgCollected: number; payoutInr: number }> = [
      { zone: 'Indiranagar', kgCollected: 68, payoutInr: 3420 },
      { zone: 'Koramangala', kgCollected: 54, payoutInr: 2890 },
      { zone: 'HSR Layout', kgCollected: 46, payoutInr: 2150 },
      { zone: 'Jayanagar', kgCollected: 39, payoutInr: 1740 },
      { zone: 'Whitefield', kgCollected: 61, payoutInr: 3180 },
    ];
    orders.forEach((o) => {
      const target = baseZones.find((z) =>
        o.address.area.toLowerCase().includes(z.zone.split(' ')[0].toLowerCase())
      );
      if (target) {
        target.kgCollected += o.totalWeight || 14;
        target.payoutInr += o.finalAmount || o.totalEstimatedAmount || 420;
      }
    });
    return baseZones;
  })();

  const totalShiftWeightKg = zoneShiftData.reduce((s, z) => s + z.kgCollected, 0);
  const payloadLoadPct = Math.min(95, Math.max(28, Math.round((totalShiftWeightKg / 450) * 100)));

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
            Active: Field Fleet Driver Terminal
          </span>
          <button
            onClick={onClose || onBack}
            className="p-1.5 px-2.5 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all flex items-center gap-1.5 text-xs font-extrabold"
            title="Close Driver Terminal"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Executive Driver Stats Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white font-display">
                Executive Manjunath Gowda
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                KA-01-EV-4820
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Electric Auto • Active Field Shift
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Today Pickups</span>
            <span className="font-extrabold text-emerald-400 font-display text-base">
              6 Completed
            </span>
          </div>

          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Driver Rating</span>
            <span className="font-extrabold text-amber-400 font-display text-base flex items-center gap-1 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              4.9
            </span>
          </div>
        </div>
      </div>

      {completionNotice && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>{completionNotice}</span>
        </div>
      )}

      {/* EV Fleet Visual Readiness + Recharts Shift Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* EV Auto Visual Showcase */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="relative h-40 bg-slate-900 overflow-hidden">
            {!fleetImgError ? (
              <img
                src={fleetEvOperationsImg}
                alt="PunarChakra EV Fleet collection route"
                onError={() => setFleetImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Truck className="w-10 h-10 text-emerald-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="font-extrabold">Zero-Emission EV Shift</span>
              <span className="font-mono font-bold text-emerald-300 tabular-nums">86% Battery · 74 km</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-600" />
                <span>EV Cargo Bay Utilization</span>
              </span>
              <span className="font-black text-emerald-700 tabular-nums">{totalShiftWeightKg} / 450 kg</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${payloadLoadPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
              <span>Payload Load: {payloadLoadPct}%</span>
              <span>Shift CO₂ Avoided: {Math.round(totalShiftWeightKg * 1.9)} kg</span>
            </div>
          </div>
        </div>

        {/* Recharts Shift Throughput by Bengaluru Zone */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Shift Collection & Payouts by Zone</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scrap weight verified (kg) and UPI payouts disbursed across active route sectors
              </p>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
              {orders.length} Active Jobs
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={zoneShiftData} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#0284c7' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="kgCollected" name="Weight Collected (kg)" fill="#059669" radius={[6, 6, 0, 0]} barSize={26} />
                <Line yAxisId="right" type="monotone" dataKey="payoutInr" name="UPI Disbursed (₹)" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4, fill: '#d97706' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs (Job Workspace vs Interactive GPS Map) */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'workspace'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Active Job Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'map'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapIcon className="w-4 h-4 text-emerald-300" />
            <span>Interactive Fleet GPS Map</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[9px] font-black">
              LIVE
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-semibold hidden md:inline pr-2">
          Target: Order #{activeJob.orderNumber} ({activeJob.customerName})
        </span>
      </div>

      {activeTab === 'map' ? (
        <ExecutiveMapTab
          orders={orders}
          activeJob={activeJob}
          onSelectJob={(job) => {
            setActiveJob(job);
            setActiveTab('workspace');
          }}
          language={language}
        />
      ) : (
        /* Main Job Workspace Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Job Selector */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            Assigned Field Jobs ({orders.length})
          </h3>

          <div className="space-y-2">
            {orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setActiveJob(ord)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  activeJob.id === ord.id
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 font-display">
                    #{ord.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      ord.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{ord.customerName}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{ord.address.street}, {ord.address.area}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Job Detail & Bluetooth Scale Verification */}
        <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Job Target
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 font-display mt-1">
                Order #{activeJob.orderNumber} - {activeJob.customerName}
              </h2>
              <p className="text-xs text-slate-500">
                {activeJob.address.street}, {activeJob.address.area}, {activeJob.address.city}
              </p>
            </div>

            <a
              href={`tel:${activeJob.customerPhone}`}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Customer</span>
            </a>
          </div>

          {/* Bluetooth Scale Sync Status */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>PunarChakra Bluetooth Scale #EV-SCALE-901</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
              CONNECTED & CALIBRATED
            </span>
          </div>

          {/* Itemized Weight Verification Form */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Verify Scrap Weights & Rates:
            </h4>

            <div className="space-y-2">
              {activeJob.items.map((item) => {
                const verifiedQty = itemWeights[item.scrapItemId] ?? item.estimatedQty;
                return (
                  <div
                    key={item.scrapItemId}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-slate-500 block">
                        Rate: ₹{item.ratePerUnit}/{item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Actual Weight:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={verifiedQty}
                        onChange={(e) =>
                          handleWeightChange(item.scrapItemId, Number(e.target.value))
                        }
                        className="w-24 p-2 bg-white border border-slate-300 rounded-xl font-extrabold text-slate-900 text-center font-display focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <span className="font-bold text-slate-700">{item.unit}</span>
                      <span className="font-black text-emerald-700 font-display ml-2">
                        = ₹{verifiedQty * item.ratePerUnit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payout & UPI QR Collection Trigger */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Calculated Payout:</span>
                <span className="text-3xl font-black text-emerald-400 font-display">
                  ₹{calculateFinalPayout()}
                </span>
              </div>

              <button
                onClick={() => setShowUpiQr(!showUpiQr)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>Customer UPI QR Code</span>
              </button>
            </div>

            {showUpiQr && (
              <div className="p-4 bg-white rounded-2xl text-slate-900 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <span className="text-xs font-bold text-slate-600 block">
                  Scan & Pay ₹{calculateFinalPayout()} to {activeJob.customerName}
                </span>
                <div className="w-36 h-36 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center font-mono text-xs font-extrabold p-2 shadow-inner border-4 border-emerald-500">
                  [UPI QR SIMULATOR]
                  <br />
                  GPay/PhonePe
                </div>
                <span className="text-[10px] text-emerald-700 font-extrabold block">
                  Verified Payment Gateway (Razorpay/BHIM)
                </span>
              </div>
            )}
          </div>

          {/* Complete Job Action */}
          <button
            onClick={handleCompletePickup}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Complete Pickup & Issue Digital Receipt</span>
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
