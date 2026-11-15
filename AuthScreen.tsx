import React, { useState } from 'react';
import {
  Recycle,
  Truck,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  KeyRound,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  HardDrive,
  Info,
  Building2,
  Factory,
  Leaf,
  Globe,
  Award,
  Users,
  Scale,
  DollarSign,
  TrendingUp,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { UserRole, BusinessProfile } from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_EXECUTIVES,
  INITIAL_BUSINESSES,
} from '../data/mockData';
import { signInWithGoogleWorkspace } from '../services/googleWorkspace';
import { WhatsAppChatWidget } from './WhatsAppChatWidget';
import { PunarChakraLogo } from './PunarChakraLogo';
import customerCarbonHeroImg from '../assets/images/customer_carbon_hero_1794691630511.jpg';
import smartEcoPledgeEmblemImg from '../assets/images/smart_eco_pledge_emblem_1794691629693.jpg';
import businessCircularFacilityImg from '../assets/images/business_circular_facility_1794691631257.jpg';
import fleetEvOperationsImg from '../assets/images/fleet_ev_operations_1794691631469.jpg';

interface AuthScreenProps {
  onLogin: (
    role: UserRole,
    details?: {
      name: string;
      phone?: string;
      email?: string;
      customerId?: string;
      executiveId?: string;
      businessProfile?: BusinessProfile;
    }
  ) => void;
  defaultCategory?: UserRole | null;
}

export function AuthScreen({ onLogin, defaultCategory = null }: AuthScreenProps) {
  // Currently active portal view: null = Portal Gateway Selector (with About Us), or 'customer' | 'business' | 'executive' | 'admin'
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(defaultCategory);

  // Customer Login State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerOtpSent, setCustomerOtpSent] = useState(false);
  const [customerOtp, setCustomerOtp] = useState('');
  const [isCustomerSignUp, setIsCustomerSignUp] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Business Login State
  const [businessGstin, setBusinessGstin] = useState('29AABCI1234F1Z8');
  const [businessEmail, setBusinessEmail] = useState('procurement@infosys-eco.in');
  const [businessPin, setBusinessPin] = useState('2026');
  const [businessError, setBusinessError] = useState('');

  // Executive Login State
  const [executiveId, setExecutiveId] = useState('EXEC-4820');
  const [executivePin, setExecutivePin] = useState('');
  const [executiveError, setExecutiveError] = useState('');

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('admin@punarchakra.gov.in');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSecurityKey, setAdminSecurityKey] = useState('SEC-2026-HQ');
  const [adminError, setAdminError] = useState('');

  // Customer OTP handlers
  const handleSendCustomerOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerPhone.length >= 10) {
      setCustomerOtpSent(true);
    }
  };

  const handleVerifyCustomerOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerOtp.length === 4) {
      const existing = INITIAL_CUSTOMERS.find((c) => c.phone.includes(customerPhone));
      onLogin('customer', {
        name: existing ? existing.name : customerName || 'Eco Citizen',
        phone: customerPhone,
        email: existing?.email || 'user@punarchakra.in',
        customerId: existing?.id || 'usr_new',
      });
    }
  };

  const handleQuickCustomerDemo = (customer = INITIAL_CUSTOMERS[0]) => {
    onLogin('customer', {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      customerId: customer.id,
    });
  };

  // Google Sign In (Google Workspace OAuth)
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await signInWithGoogleWorkspace();
      if (res?.user) {
        onLogin('customer', {
          name: res.user.displayName || 'Google Eco Recycler',
          email: res.user.email || 'user@gmail.com',
          phone: res.user.phoneNumber || '+91 98860 12345',
          customerId: `usr_g_${res.user.uid.slice(0, 6)}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setGoogleError(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Business Login Handler
  const handleBusinessLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessGstin || businessGstin.length < 5) {
      setBusinessError('Please enter valid Corporate GSTIN or Company ID');
      return;
    }
    const matchedBiz =
      INITIAL_BUSINESSES.find(
        (b) =>
          b.gstin.toLowerCase().includes(businessGstin.toLowerCase()) ||
          b.email.toLowerCase().includes(businessEmail.toLowerCase())
      ) || INITIAL_BUSINESSES[0];

    onLogin('business', {
      name: matchedBiz.companyName,
      phone: matchedBiz.phone,
      email: matchedBiz.email,
      businessProfile: matchedBiz,
    });
  };

  const handleQuickBusinessDemo = (biz = INITIAL_BUSINESSES[0]) => {
    onLogin('business', {
      name: biz.companyName,
      phone: biz.phone,
      email: biz.email,
      businessProfile: biz,
    });
  };

  // Executive Login Handler
  const handleExecutiveLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!executivePin || executivePin.length < 4) {
      setExecutiveError('Please enter valid 4-digit driver PIN (demo: 4820)');
      return;
    }
    const matchedExec =
      INITIAL_EXECUTIVES.find(
        (ex) =>
          ex.vehicleNumber.includes('4820') ||
          ex.id.toLowerCase().includes(executiveId.toLowerCase())
      ) || INITIAL_EXECUTIVES[0];

    onLogin('executive', {
      name: matchedExec.name,
      phone: matchedExec.phone,
      executiveId: matchedExec.id,
    });
  };

  const handleQuickExecutiveDemo = (exec = INITIAL_EXECUTIVES[0]) => {
    onLogin('executive', {
      name: exec.name,
      phone: exec.phone,
      executiveId: exec.id,
    });
  };

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      setAdminError('Please enter admin security passcode (demo: admin123)');
      return;
    }
    onLogin('admin', {
      name: 'Super Admin Officer',
      email: adminEmail,
    });
  };

  const handleQuickAdminDemo = () => {
    onLogin('admin', {
      name: 'Super Admin Officer',
      email: 'admin@punarchakra.gov.in',
    });
  };

  // =========================================================================
  // VIEW 1: PORTAL SELECTION GATEWAY WITH RICH "ABOUT US" SECTION
  // =========================================================================
  if (!selectedPortal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans">
        {/* Navigation Bar */}
        <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
          <PunarChakraLogo size="lg" variant="dark" />

          <div className="flex items-center gap-3">
            <a
              href="#about-section"
              className="text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors hidden sm:block"
            >
              About Us & Mission
            </a>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Portals</span>
            </div>
          </div>
        </header>

        {/* Hero & About Us Section */}
        <div className="max-w-6xl w-full mx-auto my-6 space-y-12">
          {/* ABOUT US BANNER */}
          <section id="about-section" className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  About PunarChakra • Giving Waste A New Life
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-tight">
                  Transforming India’s Waste into Green Wealth
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  PunarChakra is Karnataka’s leading autonomous recycling ecosystem uniting 
                  <strong className="text-emerald-400 font-bold"> citizens, industries, and electric vehicle fleet partners</strong>. 
                  We eliminate informal middlemen with IoT-calibrated digital scales, transparent live dynamic scrap rates, doorstep electric vehicle pickups, and instant UPI & NEFT payouts.
                </p>

                {/* 3 Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-900/60 border border-slate-700 rounded-2xl">
                    <span className="text-emerald-400 font-black text-lg block">100% EV Fleet</span>
                    <span className="text-[11px] text-slate-400">Zero-emission doorstep collection autos & tippers</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-700 rounded-2xl">
                    <span className="text-emerald-400 font-black text-lg block">150+ MT CO₂</span>
                    <span className="text-[11px] text-slate-400">Audited carbon offsets & verified tree credits</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-700 rounded-2xl">
                    <span className="text-emerald-400 font-black text-lg block">EPR Certified</span>
                    <span className="text-[11px] text-slate-400">State Pollution Control Board statutory compliance</span>
                  </div>
                </div>
              </div>

              {/* How it works card */}
              <div className="lg:col-span-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-700/80 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  How PunarChakra Works
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-white block">Schedule Pickup or Request Quote</span>
                      <span className="text-slate-400">Book in 30 seconds via Citizen App, Industrial Portal, or WhatsApp.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-white block">EV Partner Arrives & Weighs</span>
                      <span className="text-slate-400">Certified Bluetooth IoT scale connects in real-time. Zero weight tampering.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-white block">Instant Payout & Green Certificate</span>
                      <span className="text-slate-400">Direct UPI or NEFT credit with EPR compliance and carbon offset score.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PORTAL SELECTION TITLE */}
          <div className="text-center space-y-2 pt-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
              Select Your Designated Login Portal
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
              Choose your department or stakeholder role to access its isolated, dedicated portal.
            </p>
          </div>

          {/* 4 CATEGORY PORTAL CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Customer Recycling Portal */}
            <div
              onClick={() => setSelectedPortal('customer')}
              className="group cursor-pointer rounded-3xl bg-slate-800/60 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1.5 relative overflow-hidden"
            >
              <div>
                <div className="h-24 -mx-6 -mt-6 mb-4 overflow-hidden relative border-b border-emerald-500/20">
                  <img
                    src={customerCarbonHeroImg}
                    alt="Citizen Recycling & Impact Portal"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/25 to-transparent" />
                  <div className="absolute bottom-2.5 left-4 w-9 h-9 rounded-xl bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-md">
                    <Recycle className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 inline-block mb-1">
                  Citizens & Homes
                </span>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                  Customer Portal
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Sell household scrap, book doorstep EV pickups, earn Eco-Coins, and track your carbon savings.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live dynamic scrap rates index</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant UPI doorstep payment</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Enter Customer</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Business & Industrial Portal */}
            <div
              onClick={() => setSelectedPortal('business')}
              className="group cursor-pointer rounded-3xl bg-slate-800/60 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1.5 relative overflow-hidden"
            >
              <div>
                <div className="h-24 -mx-6 -mt-6 mb-4 overflow-hidden relative border-b border-amber-500/20">
                  <img
                    src={businessCircularFacilityImg}
                    alt="Industrial B2B Circular Recovery Facility"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/25 to-transparent" />
                  <div className="absolute bottom-2.5 left-4 w-9 h-9 rounded-xl bg-amber-400/95 text-slate-950 flex items-center justify-center shadow-md">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 inline-block mb-1">
                  Industries & Factories
                </span>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  Business Portal
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Bulk industrial scrap management, multi-ton container trucks, EPR compliance, and GST invoicing.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Bulk volume tiered rate cards</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Certified EPR & ESG reports</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Enter Business</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Pickup Executive Partner Portal */}
            <div
              onClick={() => setSelectedPortal('executive')}
              className="group cursor-pointer rounded-3xl bg-slate-800/60 hover:bg-slate-800/90 border border-sky-500/30 hover:border-sky-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-1.5 relative overflow-hidden"
            >
              <div>
                <div className="h-24 -mx-6 -mt-6 mb-4 overflow-hidden relative border-b border-sky-500/20">
                  <img
                    src={fleetEvOperationsImg}
                    alt="EV Fleet Driver Operations Terminal"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/25 to-transparent" />
                  <div className="absolute bottom-2.5 left-4 w-9 h-9 rounded-xl bg-sky-400/95 text-slate-950 flex items-center justify-center shadow-md">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 inline-block mb-1">
                  Field Drivers & Fleet
                </span>
                <h3 className="text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                  Executive Portal
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Field driver terminal with route navigation, Bluetooth IoT scale calibration, and job completion.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Automated route dispatch</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Bluetooth digital scale sync</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-sky-400">
                <span>Enter Executive</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. Master Admin Operations Console */}
            <div
              onClick={() => setSelectedPortal('admin')}
              className="group cursor-pointer rounded-3xl bg-slate-800/60 hover:bg-slate-800/90 border border-violet-500/30 hover:border-violet-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-1.5 relative overflow-hidden"
            >
              <div>
                <div className="h-24 -mx-6 -mt-6 mb-4 overflow-hidden relative border-b border-violet-500/20 bg-emerald-950">
                  <img
                    src={smartEcoPledgeEmblemImg}
                    alt="PunarChakra Operations Command Crest"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/35 to-transparent" />
                  <div className="absolute bottom-2.5 left-4 w-9 h-9 rounded-xl bg-violet-400/95 text-slate-950 flex items-center justify-center shadow-md">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-300 inline-block mb-1">
                  Operations Console
                </span>
                <h3 className="text-lg font-black text-white group-hover:text-violet-300 transition-colors">
                  Admin Console
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Customer & executive CRUD, manual CSV exports to Google Drive 'PunarChakra-Backups', and rate control.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>User & Order manual Drive backup</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>Google Sheets 2-way sync</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-violet-400">
                <span>Enter Admin</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-6xl w-full mx-auto text-center py-4 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PunarChakra Clean Earth Initiative • Government ESG Partner</span>
          <div className="flex items-center gap-3">
            <span>Official WhatsApp Support Active</span>
            <span>• Google Drive & Sheets Sync</span>
          </div>
        </footer>

        {/* Floating WhatsApp Support Widget */}
        <WhatsAppChatWidget />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: BUSINESS & INDUSTRIAL LOGIN PORTAL (Amber/Industrial Theme)
  // =========================================================================
  if (selectedPortal === 'business') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100 relative">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 p-8 text-center relative overflow-hidden text-white">
            <button
              onClick={() => setSelectedPortal(null)}
              className="absolute top-4 left-4 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-xl text-xs flex items-center gap-1 transition-all border border-amber-500/30"
              title="Return to Portal Selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portals</span>
            </button>

            <div className="flex flex-col items-center justify-center mb-3">
              <PunarChakraLogo size="xl" variant="dark" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] uppercase font-black tracking-widest mx-auto mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B & Industrial Waste Division</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight mt-0.5">
              Industrial Business Portal
            </h1>
            <p className="text-amber-100 text-xs font-medium mt-1">
              Factories • IT Tech Parks • Bulk Scrap Logistics
            </p>
          </div>

          {/* Form */}
          <div className="p-7 space-y-5">
            {businessError && (
              <div className="p-3 bg-rose-900/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{businessError}</span>
              </div>
            )}

            <form onSubmit={handleBusinessLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Corporate GSTIN / Registration No.
                </label>
                <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30">
                  <span className="flex items-center justify-center px-3.5 bg-slate-800 text-slate-400 text-xs font-bold border-r border-slate-700">
                    <Factory className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={businessGstin}
                    onChange={(e) => setBusinessGstin(e.target.value)}
                    placeholder="e.g. 29AABCI1234F1Z8"
                    className="w-full px-3 py-2.5 bg-transparent text-white text-xs font-mono font-bold focus:outline-none uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Authorized Work Email
                </label>
                <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30">
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full px-3.5 py-2.5 bg-transparent text-white text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Business Security PIN
                </label>
                <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30">
                  <span className="flex items-center justify-center px-3.5 bg-slate-800 text-slate-400 text-xs font-bold border-r border-slate-700">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={businessPin}
                    onChange={(e) => setBusinessPin(e.target.value)}
                    placeholder="Enter PIN (demo: 2026)"
                    className="w-full px-3 py-2.5 bg-transparent text-white text-xs font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/30 active:scale-95"
              >
                <Building2 className="w-4 h-4" />
                <span>Authenticate & Open Industrial Portal</span>
              </button>
            </form>

            {/* Quick Demo Business Accounts */}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                1-Click Industrial Demo Login
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickBusinessDemo(INITIAL_BUSINESSES[0])}
                  className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-amber-500/40 rounded-xl text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-amber-300 block">Infosys Eco Tech Hub</span>
                    <span className="text-[10px] text-slate-400">Electronics City • IT Park Sector</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickBusinessDemo(INITIAL_BUSINESSES[1])}
                  className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-amber-500/40 rounded-xl text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-amber-300 block">Tata AutoComp Industrial</span>
                    <span className="text-[10px] text-slate-400">Peenya Industrial Area • Automobile Bay</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <WhatsAppChatWidget />
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: CUSTOMER LOGIN PORTAL (Green Eco Theme)
  // =========================================================================
  if (selectedPortal === 'customer') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 p-8 text-center relative overflow-hidden text-white">
            <button
              onClick={() => setSelectedPortal(null)}
              className="absolute top-4 left-4 p-2 bg-emerald-700/50 hover:bg-emerald-700 text-white rounded-xl text-xs flex items-center gap-1 transition-all"
              title="Return to Portal Selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portals</span>
            </button>

            <div className="flex flex-col items-center justify-center mb-3">
              <PunarChakraLogo size="xl" variant="dark" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] uppercase font-black tracking-widest mx-auto mb-2">
              <Recycle className="w-3.5 h-3.5" />
              <span>Citizen Scrap Recycling Portal</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight mt-0.5">
              PunarChakra Customer
            </h1>
            <p className="text-emerald-100 text-xs font-medium mt-1">
              {isCustomerSignUp ? 'Create your green recycling account' : 'Sign in to schedule doorstep scrap pickup'}
            </p>
          </div>

          {/* Form */}
          <div className="p-7 space-y-5">
            {googleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{googleError}</span>
              </div>
            )}

            {/* Google Sign-in Button with official styling */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm disabled:opacity-60"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with Google (Drive & Sheets)'}</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase">Or mobile OTP</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </div>

            {!customerOtpSent ? (
              <form onSubmit={handleSendCustomerOtp} className="space-y-4">
                {isCustomerSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ananya Rao"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200">
                    <span className="flex items-center justify-center px-3.5 bg-slate-100 border-r border-slate-200 text-slate-600 font-bold text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10 digit number"
                      className="w-full px-3 py-2.5 bg-transparent text-slate-800 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={customerPhone.length < 10}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCustomerOtp} className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Enter 4-digit code sent to</p>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <span className="font-extrabold text-slate-900 text-xs">+91 {customerPhone}</span>
                    <button
                      type="button"
                      onClick={() => setCustomerOtpSent(false)}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={customerOtp}
                  onChange={(e) => setCustomerOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-black tracking-[0.8em] text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={customerOtp.length !== 4}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Enter Customer Portal</span>
                </button>
              </form>
            )}

            {/* Quick Demo Customer Sign-in */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Fast Demo Customer Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickCustomerDemo(INITIAL_CUSTOMERS[0])}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all"
                >
                  <span className="font-bold text-xs text-emerald-900 block">Ananya Rao</span>
                  <span className="text-[10px] text-emerald-700">Indiranagar (Active)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCustomerDemo(INITIAL_CUSTOMERS[1])}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all"
                >
                  <span className="font-bold text-xs text-emerald-900 block">Rahul Sharma</span>
                  <span className="text-[10px] text-emerald-700">Koramangala (Active)</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsCustomerSignUp(!isCustomerSignUp)}
                className="text-xs text-slate-500 hover:text-emerald-700 font-semibold"
              >
                {isCustomerSignUp ? 'Already registered? Login here' : 'New citizen? Create Account'}
              </button>
            </div>
          </div>
        </div>
        <WhatsAppChatWidget />
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: PICKUP EXECUTIVE PORTAL LOGIN (Sky/Navy EV Fleet Theme)
  // =========================================================================
  if (selectedPortal === 'executive') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100 relative">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-2xl border border-sky-500/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-8 text-center relative overflow-hidden text-white">
            <button
              onClick={() => setSelectedPortal(null)}
              className="absolute top-4 left-4 p-2 bg-sky-800/60 hover:bg-sky-800 text-white rounded-xl text-xs flex items-center gap-1 transition-all"
              title="Return to Portal Selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portals</span>
            </button>

            <div className="flex flex-col items-center justify-center mb-3">
              <PunarChakraLogo size="xl" variant="dark" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] uppercase font-black tracking-widest mx-auto mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>Field Fleet Operations</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight mt-0.5">
              Pickup Executive Portal
            </h1>
            <p className="text-sky-100 text-xs font-medium mt-1">
              Driver Authentication • Daily Route & IoT Scale Terminal
            </p>
          </div>

          {/* Form */}
          <div className="p-7 space-y-5">
            {executiveError && (
              <div className="p-3 bg-rose-900/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{executiveError}</span>
              </div>
            )}

            <form onSubmit={handleExecutiveLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Partner / Driver Badge ID
                </label>
                <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
                  <span className="flex items-center justify-center px-3.5 bg-slate-800 text-slate-400 text-xs font-bold border-r border-slate-700">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={executiveId}
                    onChange={(e) => setExecutiveId(e.target.value)}
                    placeholder="e.g. EXEC-4820"
                    className="w-full px-3 py-2.5 bg-transparent text-white text-xs font-bold focus:outline-none uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  4-Digit Driver Security PIN
                </label>
                <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
                  <span className="flex items-center justify-center px-3.5 bg-slate-800 text-slate-400 text-xs font-bold border-r border-slate-700">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    maxLength={4}
                    value={executivePin}
                    onChange={(e) => setExecutivePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4 digit PIN (demo: 4820)"
                    className="w-full px-3 py-2.5 bg-transparent text-white text-xs font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/30 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Start Daily Field Shift</span>
              </button>
            </form>

            {/* Quick Demo Executive Accounts */}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                1-Click Demo Executive Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickExecutiveDemo(INITIAL_EXECUTIVES[0])}
                  className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-sky-500/40 rounded-xl text-left transition-all"
                >
                  <span className="font-bold text-xs text-sky-300 block">Manjunath Gowda</span>
                  <span className="text-[10px] text-slate-400">KA-01-EV-4820 (Auto)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickExecutiveDemo(INITIAL_EXECUTIVES[1])}
                  className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-sky-500/40 rounded-xl text-left transition-all"
                >
                  <span className="font-bold text-xs text-sky-300 block">Ramesh Kumar</span>
                  <span className="text-[10px] text-slate-400">KA-03-MC-9012 (Van)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <WhatsAppChatWidget />
      </div>
    );
  }

  // =========================================================================
  // VIEW 5: SUPER ADMIN OPERATIONS CONSOLE LOGIN (Slate/Violet Theme)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 relative">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl shadow-2xl border border-violet-500/40 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-8 text-center relative overflow-hidden text-white border-b border-violet-500/20">
          <button
            onClick={() => setSelectedPortal(null)}
            className="absolute top-4 left-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs flex items-center gap-1 transition-all border border-slate-700"
            title="Return to Portal Selection"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portals</span>
          </button>

            <div className="flex flex-col items-center justify-center mb-3">
              <PunarChakraLogo size="xl" variant="dark" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 text-[10px] uppercase font-black tracking-widest mx-auto mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Government & Operations Control</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight mt-0.5">
              Master Admin Console
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-1">
              Manual Backups to 'PunarChakra-Backups', User & Order CRUD, Google Sheets Sync
            </p>
          </div>

        {/* Form */}
        <div className="p-7 space-y-5">
          {adminError && (
            <div className="p-3 bg-rose-900/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{adminError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Official Email
              </label>
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/30">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@punarchakra.gov.in"
                  className="w-full px-3.5 py-2.5 bg-transparent text-white text-xs font-semibold focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Master Passcode
              </label>
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/30">
                <span className="flex items-center justify-center px-3 bg-slate-800/80 text-slate-400 text-xs font-bold border-r border-slate-800">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin passcode (demo: admin123)"
                  className="w-full px-3.5 py-2.5 bg-transparent text-white text-xs font-semibold focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Security Node Key
              </label>
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <input
                  type="text"
                  value={adminSecurityKey}
                  onChange={(e) => setAdminSecurityKey(e.target.value)}
                  className="w-full px-3.5 py-2 bg-transparent text-violet-300 text-xs font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/30 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate & Open Admin Console</span>
            </button>
          </form>

          {/* Quick Demo Admin Login */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleQuickAdminDemo}
              className="w-full p-3 bg-violet-950/60 hover:bg-violet-900/60 border border-violet-500/40 rounded-xl text-center text-xs font-extrabold text-violet-200 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>1-Click Super Admin Login (Demo)</span>
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-violet-300 font-bold">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Admin Export & Google Drive Sync Ready</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Direct upload to shared 'PunarChakra-Backups' Google Drive folder.
            </p>
          </div>
        </div>
      </div>
      <WhatsAppChatWidget />
    </div>
  );
}
