import React, { useState } from 'react';
import {
  Recycle,
  Leaf,
  Globe,
  Wallet,
  Bell,
  ShieldAlert,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Truck,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Award,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';
import { UserRole, Language, UserProfile, NotificationItem } from '../types';
import { translations } from '../utils/translations';
import { PunarChakraLogo } from './PunarChakraLogo';

interface HeaderNavbarProps {
  currentRole: UserRole;
  language: Language;
  setLanguage: (lang: Language) => void;
  userProfile: UserProfile;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenEcoQuiz?: () => void;
  onOpenEcoAdvice?: () => void;
  cartCount: number;
  onOpenCartModal: () => void;
  onLogout: () => void;
  isGoogleConnected?: boolean;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentRole,
  language,
  setLanguage,
  userProfile,
  notifications,
  onOpenNotifications,
  onOpenEcoQuiz,
  onOpenEcoAdvice,
  cartCount,
  onOpenCartModal,
  onLogout,
  isGoogleConnected = false,
}) => {
  const t = translations[language];
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Portal Identification */}
          <div className="flex items-center gap-3 py-1">
            <PunarChakraLogo size="md" showSubtitle={false} />

            {/* Portal Badge for Current Category */}
            {currentRole === 'customer' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <Leaf className="w-3 h-3 text-emerald-600" />
                <span>Customer Portal</span>
              </span>
            )}

            {currentRole === 'business' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                <Building2 className="w-3 h-3 text-amber-600" />
                <span>Industrial B2B Portal • Enterprise</span>
              </span>
            )}

            {currentRole === 'executive' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200">
                <Truck className="w-3 h-3 text-sky-600" />
                <span>Field Fleet Driver Terminal</span>
                <span className="px-1.5 py-0.2 bg-sky-200 text-sky-950 rounded text-[9px] font-mono font-bold">
                  KA-01-EV-4820
                </span>
              </span>
            )}

            {currentRole === 'admin' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 text-[11px] font-bold border border-violet-200">
                <ShieldAlert className="w-3 h-3 text-violet-600" />
                <span>Operations Master Admin Console</span>
              </span>
            )}

            {/* Back to Portal Gateway / Close Portal Action Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-xs font-extrabold text-slate-700 transition-all shadow-2xs group ml-1"
              title="Return to Portal Selection / Close Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-600 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden md:inline">Back to Portals</span>
              <span className="md:hidden">Back</span>
              <span className="p-0.5 rounded-md bg-slate-200 group-hover:bg-rose-100 text-slate-500 group-hover:text-rose-600">
                <X className="w-3 h-3" />
              </span>
            </button>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets / Drive Sync Indicator in Admin Mode */}
            {currentRole === 'admin' && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Drive & Sheets</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                title="Change Language"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-emerald-50 ${
                      language === 'en' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="text-emerald-600">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('kn');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-emerald-50 ${
                      language === 'kn' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>ಕನ್ನಡ (Kannada)</span>
                    {language === 'kn' && <span className="text-emerald-600">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-emerald-50 ${
                      language === 'hi' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {language === 'hi' && <span className="text-emerald-600">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Wallet Quick Summary (Customer Role) */}
            {currentRole === 'customer' && (
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>₹{userProfile.walletBalance}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{userProfile.ecoRewardPoints} pts</span>
                </div>
              </div>
            )}

            {/* Pickup Cart Icon (Customer Role) */}
            {currentRole === 'customer' && (
              <button
                onClick={onOpenCartModal}
                className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-200"
                title="View Scrap Cart"
              >
                <Recycle className="w-5 h-5 text-emerald-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-extrabold text-white bg-emerald-600 rounded-full shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-ping" />
              )}
            </button>

            {/* Eco Quiz Quick Access Button */}
            {onOpenEcoQuiz && (
              <button
                onClick={onOpenEcoQuiz}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-emerald-950 bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 border border-emerald-300 rounded-xl shadow-2xs transition-all active:scale-95"
                title="Play Quick Eco Quiz to test waste segregation knowledge & earn Eco Coins"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Eco Quiz</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                  +15
                </span>
              </button>
            )}

            {/* Profile Dropdown & Logout Button */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-all"
                title="User Profile & Sign Out"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                  {userProfile.name ? userProfile.name.charAt(0) : 'U'}
                </div>
                <span className="hidden md:inline max-w-[110px] truncate">
                  {userProfile.name || 'User'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{userProfile.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{userProfile.phone || userProfile.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {currentRole === 'customer'
                        ? 'Citizen Recycler'
                        : currentRole === 'business'
                        ? 'Industrial Enterprise'
                        : currentRole === 'executive'
                        ? 'Field Executive'
                        : 'Super Admin'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out & Switch Portal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Sign Out to Portal Selection"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
