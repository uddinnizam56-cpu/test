import React, { useState, useEffect, useRef } from 'react';
import {
  UserRole,
  Language,
  ScrapItem,
  ScrapCategory,
  PickupOrder,
  UserProfile,
  NotificationItem,
  Address,
  TimeSlot,
  CustomerAccount,
  Executive,
  BusinessProfile,
  RewardVoucher,
  WalletTransaction,
  LeaderboardUser,
  CleanupDrive,
  WorkspaceActivityLog,
  ArScanAnalysis,
  SidebarTipSuggestion,
  GoogleFormSummary,
} from './types';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  syncUserProfileToFirestore,
  syncWalletBalanceToFirestore,
  syncPickupOrderToFirestore,
  updateOrderRatingInFirestore,
  syncActivityLogToFirestore,
  syncScrapRateToFirestore,
  seedScrapRatesIfAdmin,
  subscribeUserFirestoreData,
} from './services/firebase';
import {
  INITIAL_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_EXECUTIVES,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_VOUCHERS,
  INITIAL_USER_PROFILE,
  INITIAL_CUSTOMERS,
  INITIAL_BUSINESSES,
  INITIAL_LEADERBOARD_USERS,
  INITIAL_CLEANUP_DRIVES,
} from './data/mockData';
import { translations } from './utils/translations';
import { HeaderNavbar } from './components/HeaderNavbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ScrapCategoryBrowser } from './components/CustomerPortal/ScrapCategoryBrowser';
import { AiScrapCameraModal } from './components/CustomerPortal/AiScrapCameraModal';
import { VoiceBookingModal } from './components/CustomerPortal/VoiceBookingModal';
import { PickupScheduleModal } from './components/CustomerPortal/PickupScheduleModal';
import { LiveGpsTrackerModal } from './components/CustomerPortal/LiveGpsTrackerModal';
import { EcoWalletAndRewards } from './components/CustomerPortal/EcoWalletAndRewards';
import { OrderHistoryView } from './components/CustomerPortal/OrderHistoryView';
import { EcoLeaderboard } from './components/CustomerPortal/EcoLeaderboard';
import { CommunityCleanup } from './components/CustomerPortal/CommunityCleanup';
import { ExecutiveDashboard } from './components/ExecutivePortal/ExecutiveDashboard';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { BusinessDashboard } from './components/BusinessPortal/BusinessDashboard';
import { EcoAdviceComponent } from './components/CustomerPortal/EcoAdviceComponent';
import { EcoQuizModal } from './components/CustomerPortal/EcoQuizModal';
import { CarbonSavedCalculator } from './components/CustomerPortal/CarbonSavedCalculator';
import { InteractiveEcoMap } from './components/CustomerPortal/InteractiveEcoMap';
import { PickupReminderModal } from './components/CustomerPortal/PickupReminderModal';
import { ScrapPriceSurgeBanner } from './components/CustomerPortal/ScrapPriceSurgeBanner';
import { ArScrapAssistantModal } from './components/CustomerPortal/ArScrapAssistantModal';
import { WhatsAppChatWidget } from './components/WhatsAppChatWidget';
import { AuthScreen } from './components/AuthScreen';
import { MilestoneCelebrationModal } from './components/MilestoneCelebrationModal';
import {
  ProfileMilestone,
  RECYCLED_KG_MILESTONES,
  WALLET_BALANCE_MILESTONES,
} from './utils/milestones';
import {
  Recycle,
  Wallet,
  Clock,
  Sparkles,
  Camera,
  Mic,
  ShieldAlert,
  Award,
  Leaf,
  CheckCircle2,
  List,
  Trophy,
  Users,
  Truck,
  Zap,
  ArrowLeft,
  X,
  MapPin,
  Bell,
  Box,
} from 'lucide-react';

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App Core State
  const [currentRole, setRole] = useState<UserRole>('customer');
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(INITIAL_BUSINESSES);
  const [currentBusiness, setCurrentBusiness] = useState<BusinessProfile>(INITIAL_BUSINESSES[0]);

  const [categories, setCategories] = useState<ScrapCategory[]>(INITIAL_CATEGORIES);
  const [items, setItems] = useState<ScrapItem[]>(INITIAL_ITEMS);
  const [customers, setCustomers] = useState<CustomerAccount[]>(INITIAL_CUSTOMERS);
  const [executives, setExecutives] = useState<Executive[]>(INITIAL_EXECUTIVES);
  const [orders, setOrders] = useState<PickupOrder[]>(INITIAL_ORDERS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [vouchers, setVouchers] = useState<RewardVoucher[]>(INITIAL_VOUCHERS);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD_USERS);
  const [cleanupDrives, setCleanupDrives] = useState<CleanupDrive[]>(INITIAL_CLEANUP_DRIVES);
  const [activityLogs, setActivityLogs] = useState<WorkspaceActivityLog[]>([
    {
      id: 'log_init_1',
      timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      actorName: INITIAL_USER_PROFILE.name,
      actorRole: 'customer',
      actionType: 'PICKUP_SCHEDULED',
      summary: 'Scheduled Order #PC-2026-8801 (Indiranagar)',
      details: 'Newspaper & Corrugated Cardboard + Copper Wire pickup assigned to Manjunath Gowda.',
      estimatedValue: 1120,
    },
    {
      id: 'log_init_2',
      timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      actorName: INITIAL_USER_PROFILE.name,
      actorRole: 'customer',
      actionType: 'AR_SPATIAL_SCAN',
      summary: 'AR 3D Box Scan: Corrugated Cardboard (42x30x22 cm)',
      details: 'Estimated 3.9 kg · Sorted to Emerald Dry Paper Bale · CO2 Offset ~3.5 kg',
      materialId: 'paper_cardboard',
      quantity: 4,
      estimatedValue: 56,
    },
    {
      id: 'log_init_3',
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
      actorName: 'Platform Pricing Engine',
      actorRole: 'admin',
      actionType: 'RATE_UPDATED',
      summary: 'Market Surge Alert: Copper Wire rate updated to ₹720/kg',
      details: 'Up +₹20/kg across Bengaluru collection hubs.',
      materialId: 'copper',
      estimatedValue: 720,
    },
  ]);

  const recordActivityLog = (
    entry: Omit<WorkspaceActivityLog, 'id' | 'timestamp' | 'actorName' | 'actorRole'> & {
      actorName?: string;
      actorRole?: UserRole;
    }
  ) => {
    const newLog: WorkspaceActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorName: entry.actorName || userProfile.name,
      actorRole: entry.actorRole || currentRole,
      actionType: entry.actionType,
      summary: entry.summary,
      details: entry.details,
      materialId: entry.materialId,
      quantity: entry.quantity,
      estimatedValue: entry.estimatedValue,
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    if (auth.currentUser?.emailVerified) {
      syncActivityLogToFirestore(newLog).catch((err) =>
        console.error('Firestore activity log sync skipped:', err)
      );
    }
  };

  // Sync authenticated Google/Firebase user profile and Firestore offline-cached collections
  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }
      if (user && user.emailVerified) {
        syncUserProfileToFirestore(user, userProfile).catch((err) =>
          console.error('Firestore profile sync skipped:', err)
        );
        if (user.email === 'nizamaazuddin@gmail.com') {
          seedScrapRatesIfAdmin(INITIAL_ITEMS).catch((err) =>
            console.error('Firestore scrap rate seed skipped:', err)
          );
        }
        unsubFirestore = subscribeUserFirestoreData(user, (cloudData) => {
          if (cloudData.walletState) {
            const ws = cloudData.walletState;
            isHydratingFromFirestoreRef.current = true;
            setUserProfile((prev) => ({
              ...prev,
              name: ws.displayName || prev.name,
              walletBalance: ws.walletBalance,
              ecoRewardPoints: ws.ecoRewardPoints,
              totalRecycledKg: ws.totalRecycledKg,
            }));
          }

          if (cloudData.syncedRates.length > 0) {
            setItems((prev) => {
              const rateById = new Map(cloudData.syncedRates.map((r) => [r.id, r]));
              const updated = prev.map((it) => {
                const remote = rateById.get(it.id);
                if (!remote) return it;
                const nextTrend: 'up' | 'down' | 'stable' =
                  remote.rate > it.rate ? 'up' : remote.rate < it.rate ? 'down' : it.trend || 'stable';
                return {
                  ...it,
                  name: remote.name,
                  category: remote.category,
                  previousRate: remote.rate !== it.rate ? it.rate : it.previousRate,
                  rate: remote.rate,
                  unit: remote.unit,
                  co2Offset: remote.co2Offset,
                  minQty: remote.minQty,
                  trend: nextTrend,
                };
              });
              const existingIds = new Set(updated.map((it) => it.id));
              const extra = cloudData.syncedRates
                .filter((r) => !existingIds.has(r.id))
                .map((r) => ({
                  id: r.id,
                  category: r.category,
                  name: r.name,
                  rate: r.rate,
                  unit: r.unit,
                  icon: 'Recycle',
                  co2Offset: r.co2Offset,
                  minQty: r.minQty,
                  trend: 'stable' as const,
                }));
              return extra.length > 0 ? [...updated, ...extra] : updated;
            });
          }

          if (cloudData.syncedOrders.length > 0) {
            setOrders((prev) => {
              const byId = new Map<string, PickupOrder>(prev.map((o) => [o.id, o]));
              cloudData.syncedOrders.forEach((so) => {
                const existing = byId.get(so.id);
                if (existing) {
                  byId.set(so.id, {
                    ...existing,
                    status: so.status,
                    finalAmount: so.finalAmount || existing.finalAmount,
                    rating: so.rating > 0 ? so.rating : existing.rating,
                    paymentStatus: so.status === 'completed' ? 'Paid' : existing.paymentStatus,
                  });
                } else {
                  byId.set(so.id, {
                    id: so.id,
                    orderNumber: so.orderNumber,
                    customerId: user.uid,
                    customerName: so.customerName,
                    customerPhone: userProfile.phone,
                    address: {
                      id: `addr_fs_${so.id}`,
                      title: 'Saved Address',
                      street: so.area,
                      area: so.area,
                      city: so.city,
                      pincode: '560001',
                      lat: 12.9716,
                      lng: 77.5946,
                    },
                    items: [
                      {
                        scrapItemId: 'mixed_scrap',
                        name: so.itemsSummary,
                        estimatedQty: 1,
                        unit: 'kg',
                        ratePerUnit: so.totalEstimatedAmount,
                        estimatedAmount: so.totalEstimatedAmount,
                      },
                    ],
                    totalEstimatedAmount: so.totalEstimatedAmount,
                    finalAmount: so.finalAmount,
                    status: so.status,
                    scheduledDate: so.scheduledDate,
                    timeSlot: so.timeSlot,
                    assignedExecutiveName: 'Manjunath Gowda',
                    vehicleNo: 'KA-01-EV-4820',
                    createdAt: so.createdAt,
                    paymentMethod: so.paymentMethod,
                    paymentStatus: so.status === 'completed' ? 'Paid' : 'Pending',
                    co2SavedTotal: so.co2SavedTotal,
                    rating: so.rating > 0 ? so.rating : undefined,
                  });
                }
              });
              return Array.from(byId.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          }

          if (cloudData.latestLogs.length > 0) {
            setActivityLogs((prev) => {
              const existingIds = new Set(prev.map((l) => l.id));
              const incoming = cloudData.latestLogs.filter((l) => !existingIds.has(l.id));
              return incoming.length > 0 ? [...incoming, ...prev] : prev;
            });
          }
        });
      }
    });
    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  // Customer Navigation Tabs
  const [customerTab, setCustomerTab] = useState<
    'browse' | 'wallet' | 'orders' | 'leaderboard' | 'community' | 'advice' | 'impact' | 'map'
  >('browse');

  // Cart State: itemId -> quantity (persisted locally for offline pickup scheduling)
  const [cart, setCart] = useState<{ [itemId: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('punarchakra_offline_cart_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage errors
    }
    return {
      paper_cardboard: 10,
      copper: 2,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('punarchakra_offline_cart_v1', JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  // Modal Visibility Controls
  const [aiScannerOpen, setAiScannerOpen] = useState(false);
  const [arAssistantOpen, setArAssistantOpen] = useState(false);
  const [arPresetItemId, setArPresetItemId] = useState<string | null>(null);
  const [voiceBookingOpen, setVoiceBookingOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [gpsTrackerOpen, setGpsTrackerOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<PickupOrder | null>(
    INITIAL_ORDERS[0]
  );
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedReminderOrder, setSelectedReminderOrder] = useState<PickupOrder | null>(null);
  const [ecoQuizOpen, setEcoQuizOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [focusedChartItemId, setFocusedChartItemId] = useState<string | null>(null);

  // Profile Milestone Celebration Queue (Total Kg Recycled & Wallet Balance)
  const [celebrationQueue, setCelebrationQueue] = useState<ProfileMilestone[]>([]);
  const celebratedMilestonesRef = useRef<Set<string>>(new Set());
  const prevProfileMetricsRef = useRef<{
    userId: string;
    totalRecycledKg: number;
    walletBalance: number;
  } | null>(null);
  const isHydratingFromFirestoreRef = useRef<boolean>(false);

  // Watch UserProfile Total Kg Recycled & Wallet Balance for Newly Reached Milestones
  useEffect(() => {
    if (!isAuthenticated) {
      prevProfileMetricsRef.current = null;
      setCelebrationQueue([]);
      return;
    }

    const storageKey = `punarchakra_celebrated_milestones_v1_${userProfile.id}`;
    const loadStoredIds = (): Set<string> => {
      try {
        const raw = localStorage.getItem(storageKey);
        return new Set<string>(raw ? JSON.parse(raw) : []);
      } catch {
        return new Set<string>();
      }
    };

    const seedBaselineMilestones = (ids: Set<string>, kg: number, wallet: number) => {
      RECYCLED_KG_MILESTONES.forEach((m) => {
        if (kg >= m.threshold) ids.add(m.id);
      });
      WALLET_BALANCE_MILESTONES.forEach((m) => {
        if (wallet >= m.threshold) ids.add(m.id);
      });
    };

    // Baseline setup on first login, user switch, or initial Firestore cloud hydration
    if (
      !prevProfileMetricsRef.current ||
      prevProfileMetricsRef.current.userId !== userProfile.id ||
      isHydratingFromFirestoreRef.current
    ) {
      isHydratingFromFirestoreRef.current = false;
      const merged = loadStoredIds();
      seedBaselineMilestones(
        merged,
        userProfile.totalRecycledKg,
        userProfile.walletBalance
      );
      celebratedMilestonesRef.current = merged;
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(merged)));
      } catch {
        // Ignore storage errors
      }
      prevProfileMetricsRef.current = {
        userId: userProfile.id,
        totalRecycledKg: userProfile.totalRecycledKg,
        walletBalance: userProfile.walletBalance,
      };
      return;
    }

    const prev = prevProfileMetricsRef.current;
    const newlyUnlocked: ProfileMilestone[] = [];

    if (userProfile.totalRecycledKg > prev.totalRecycledKg) {
      RECYCLED_KG_MILESTONES.forEach((m) => {
        if (
          userProfile.totalRecycledKg >= m.threshold &&
          !celebratedMilestonesRef.current.has(m.id)
        ) {
          celebratedMilestonesRef.current.add(m.id);
          newlyUnlocked.push(m);
        }
      });
    }

    if (userProfile.walletBalance > prev.walletBalance) {
      WALLET_BALANCE_MILESTONES.forEach((m) => {
        if (
          userProfile.walletBalance >= m.threshold &&
          !celebratedMilestonesRef.current.has(m.id)
        ) {
          celebratedMilestonesRef.current.add(m.id);
          newlyUnlocked.push(m);
        }
      });
    }

    prevProfileMetricsRef.current = {
      userId: userProfile.id,
      totalRecycledKg: userProfile.totalRecycledKg,
      walletBalance: userProfile.walletBalance,
    };

    if (newlyUnlocked.length > 0) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify(Array.from(celebratedMilestonesRef.current))
        );
      } catch {
        // Ignore storage errors
      }

      setCelebrationQueue((q) => [...q, ...newlyUnlocked]);

      newlyUnlocked.forEach((m) => {
        setNotifications((prevNotifs) => [
          {
            id: `notif_milestone_${m.id}_${Date.now()}`,
            title: `Milestone Unlocked: ${m.title}`,
            message: m.subtitle,
            time: 'Just now',
            read: false,
            type: 'reward',
          },
          ...prevNotifs,
        ]);

        recordActivityLog({
          actionType: 'RECYCLING_TIP_ADDED',
          summary: `Milestone Unlocked: ${m.title}`,
          details: `${m.category === 'recycled_kg' ? 'Total Kg Recycled' : 'Wallet Balance'} reached ${m.threshold} (${m.rewardLabel})`,
          quantity: m.category === 'recycled_kg' ? m.threshold : undefined,
          estimatedValue: m.category === 'wallet_balance' ? m.threshold : undefined,
        });
      });
    }
  }, [
    isAuthenticated,
    userProfile.id,
    userProfile.totalRecycledKg,
    userProfile.walletBalance,
  ]);

  const handleOpenPickupReminder = (order: PickupOrder) => {
    setSelectedReminderOrder(order);
    setReminderModalOpen(true);
  };

  // Reward Coins Handler for Eco Advice Challenge & Eco Quiz
  const handleRewardCoins = (coins: number) => {
    const bonusWallet = Math.round(coins * 0.5);
    const nextWallet = userProfile.walletBalance + bonusWallet;
    const nextPoints = userProfile.ecoRewardPoints + coins;
    setUserProfile((prev) => ({
      ...prev,
      ecoRewardPoints: prev.ecoRewardPoints + coins,
      walletBalance: prev.walletBalance + bonusWallet,
    }));
    if (auth.currentUser?.emailVerified) {
      syncWalletBalanceToFirestore(nextWallet, nextPoints, userProfile.totalRecycledKg).catch((err) =>
        console.error('Firestore wallet sync skipped:', err)
      );
    }
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: 'Eco Coins Earned! 🪙',
        message: `You earned +${coins} Eco Coins from green actions! Wallet credited +₹${bonusWallet}.`,
        time: 'Just now',
        read: false,
        type: 'reward',
      },
      ...prev,
    ]);
  };

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Executive Assigned! 🛺',
      message: 'Manjunath Gowda (KA-01-EV-4820) is on the way for Order #PC-2026-8801 in Indiranagar.',
      time: '10 Mins ago',
      read: false,
      type: 'order',
    },
    {
      id: 'notif_2',
      title: 'Market Rate Alert 📈',
      message: 'Copper scrap prices rose by +₹20/kg today! Current rate: ₹720/kg.',
      time: '2 Hours ago',
      read: false,
      type: 'rate',
    },
    {
      id: 'notif_3',
      title: 'Referral Bonus Received 🎉',
      message: 'You earned 100 Reward Points + ₹50 cashback from your referral sign up!',
      time: '1 Day ago',
      read: true,
      type: 'reward',
    },
  ]);

  // Price Increase Notification Logic
  useEffect(() => {
    if (orders.length === 0 || items.length === 0) return;

    const newNotifications: NotificationItem[] = [];
    const pastItemsChecked = new Set<string>();

    // Sort orders by newest first to check the most recent price they sold at
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sortedOrders.forEach((order) => {
      // Check both past orders and pending orders for price context
      order.items.forEach((orderItem) => {
        if (pastItemsChecked.has(orderItem.scrapItemId)) return;
        
        const currentItem = items.find((i) => i.id === orderItem.scrapItemId);
        if (currentItem) {
          const priceIncrease = currentItem.rate - orderItem.ratePerUnit;
          // Calculate percentage increase
          const percentageIncrease = orderItem.ratePerUnit > 0 ? (priceIncrease / orderItem.ratePerUnit) * 100 : 0;

          // If price increased by 10% or more, notify the user
          if (percentageIncrease >= 10) {
            newNotifications.push({
              id: `notif_price_alert_${currentItem.id}_${Date.now()}`,
              title: 'Price Surge Alert 🚀',
              message: `The market rate for ${currentItem.name} has increased by ${percentageIncrease.toFixed(0)}% since your last order! Current rate: ₹${currentItem.rate}/${currentItem.unit}.`,
              time: 'Just now',
              read: false,
              type: 'rate',
            });
          }
        }
        pastItemsChecked.add(orderItem.scrapItemId);
      });
    });

    if (newNotifications.length > 0) {
      setNotifications((prev) => {
        // Prevent duplicate notifications for the same material
        const toAdd = newNotifications.filter(
          (nn) => !prev.some((p) => p.message.includes(nn.message))
        );
        if (toAdd.length > 0) {
          return [...toAdd, ...prev];
        }
        return prev;
      });
    }
  }, [orders, items]);

  const t = translations[language];

  // Cart Helper
  const handleUpdateCartQty = (itemId: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = qty;
      }
      return next;
    });
  };

  // AI Scanner detected item handler
  const handleAddDetectedItemToCart = (
    materialName: string,
    estimatedRate: number,
    estimatedQty: number
  ) => {
    // Add custom or match existing item
    const matched = items.find(
      (i) => i.name.toLowerCase().includes(materialName.toLowerCase()) || i.id === 'copper'
    );
    const targetId = matched ? matched.id : 'copper';
    handleUpdateCartQty(targetId, (cart[targetId] || 0) + estimatedQty);
    recordActivityLog({
      actionType: 'AI_PHOTO_SCAN',
      summary: `AI Photo Scan: ${materialName} (${estimatedQty} ${matched?.unit || 'kg'})`,
      details: `Added via Gemini AI photo classifier at ₹${estimatedRate}/${matched?.unit || 'kg'}`,
      materialId: targetId,
      quantity: estimatedQty,
      estimatedValue: Math.round(estimatedRate * estimatedQty),
    });
    alert(`Added ${estimatedQty} unit(s) of "${materialName}" to your pickup cart!`);
  };

  // Voice booking confirmation
  const handleConfirmVoiceBooking = (bookingData: any) => {
    handleUpdateCartQty('paper_cardboard', 10);
    handleUpdateCartQty('copper', 5);
    setScheduleModalOpen(true);
  };

  // Schedule pickup order creation
  const handleConfirmScheduleOrder = (orderData: {
    address: Address;
    scheduledDate: string;
    timeSlot: TimeSlot;
    paymentMethod: 'UPI' | 'Cash' | 'PunarChakra Wallet';
  }) => {
    const cartEntries = Object.entries(cart);
    const orderItems = cartEntries.map(([itemId, qty]) => {
      const found = items.find((i) => i.id === itemId);
      return {
        scrapItemId: itemId,
        name: found ? found.name : 'Recyclable Scrap',
        estimatedQty: Number(qty),
        ratePerUnit: found ? found.rate : 50,
        estimatedAmount: (found ? found.rate : 50) * Number(qty),
        unit: found ? found.unit : ('kg' as const),
      };
    });

    const totalEst = orderItems.reduce((s, i) => s + i.estimatedAmount, 0);

    const newOrder: PickupOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: `PC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: userProfile.id,
      customerName: userProfile.name,
      customerPhone: userProfile.phone,
      address: orderData.address,
      items: orderItems,
      totalEstimatedAmount: totalEst,
      status: 'en_route',
      scheduledDate: orderData.scheduledDate,
      timeSlot: orderData.timeSlot,
      assignedExecutiveId: 'exec_1',
      assignedExecutiveName: 'Manjunath Gowda',
      assignedExecutivePhone: '+91 98451 22301',
      assignedExecutiveRating: 4.9,
      vehicleNo: 'KA-01-EV-4820',
      executiveLat: orderData.address.lat - 0.006,
      executiveLng: orderData.address.lng - 0.005,
      createdAt: new Date().toISOString(),
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'Pending',
    };

    setOrders((prev) => [newOrder, ...prev]);
    if (auth.currentUser?.emailVerified) {
      syncPickupOrderToFirestore(newOrder).catch((err) =>
        console.error('Firestore order sync skipped:', err)
      );
    }
    recordActivityLog({
      actionType: 'PICKUP_SCHEDULED',
      summary: `Pickup Scheduled #${newOrder.orderNumber} (${orderData.address.area})`,
      details: `${orderItems.length} material line(s) for ${orderData.scheduledDate} ${orderData.timeSlot} via ${orderData.paymentMethod}`,
      quantity: orderItems.reduce((s, i) => s + i.estimatedQty, 0),
      estimatedValue: totalEst,
    });
    setCart({});
    setScheduleModalOpen(false);
    setSelectedTrackingOrder(newOrder);
    setGpsTrackerOpen(true);
  };

  // Withdraw Funds Handler
  const handleWithdrawFunds = (amount: number, upiId: string) => {
    const nextWallet = Math.max(0, userProfile.walletBalance - amount);
    setUserProfile((prev) => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance - amount),
    }));
    if (auth.currentUser?.emailVerified) {
      syncWalletBalanceToFirestore(
        nextWallet,
        userProfile.ecoRewardPoints,
        userProfile.totalRecycledKg
      ).catch((err) => console.error('Firestore wallet withdrawal sync skipped:', err));
    }

    setTransactions((prev) => [
      {
        id: `tx_${Date.now()}`,
        type: 'withdrawal',
        amount,
        description: `Instant Bank Withdrawal via UPI (${upiId})`,
        timestamp: 'Just now',
        status: 'Completed',
        referenceId: `BANK-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      ...prev,
    ]);

    recordActivityLog({
      actionType: 'WALLET_WITHDRAWAL',
      summary: `UPI Withdrawal ₹${amount} to ${upiId}`,
      details: `Instant bank payout processed from Eco Wallet.`,
      estimatedValue: amount,
    });

    setNotifications((prev) => [
      {
        id: `notif_withdraw_${Date.now()}`,
        title: 'UPI Withdrawal Initiated',
        message: `₹${amount} withdrawal to ${upiId} recorded in Eco Wallet.`,
        time: 'Just now',
        read: false,
        type: 'reward',
      },
      ...prev,
    ]);
  };

  // Redeem Voucher Handler
  const handleRedeemVoucher = (voucherId: string) => {
    const v = vouchers.find((v) => v.id === voucherId);
    if (!v) return;

    if (userProfile.ecoRewardPoints >= v.pointsRequired) {
      const nextPoints = userProfile.ecoRewardPoints - v.pointsRequired;
      setUserProfile((prev) => ({
        ...prev,
        ecoRewardPoints: prev.ecoRewardPoints - v.pointsRequired,
      }));
      if (auth.currentUser?.emailVerified) {
        syncWalletBalanceToFirestore(
          userProfile.walletBalance,
          nextPoints,
          userProfile.totalRecycledKg
        ).catch((err) => console.error('Firestore voucher sync skipped:', err));
      }
      recordActivityLog({
        actionType: 'VOUCHER_REDEEMED',
        summary: `Redeemed Voucher: ${v.title} (${v.code})`,
        details: `Used ${v.pointsRequired} eco points with sponsor ${v.sponsorName}.`,
        estimatedValue: v.pointsRequired,
      });
      setNotifications((prev) => [
        {
          id: `notif_voucher_${Date.now()}`,
          title: 'Voucher Redeemed',
          message: `Redeemed "${v.title}"! Code: ${v.code}`,
          time: 'Just now',
          read: false,
          type: 'reward',
        },
        ...prev,
      ]);
    }
  };

  // Rate Order Handler
  const handleRateOrder = (orderId: string, rating: number, reviewText: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const nextPoints = userProfile.ecoRewardPoints + 20;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating, reviewText } : o))
    );
    if (
      auth.currentUser?.emailVerified &&
      (targetOrder?.status === 'completed' || auth.currentUser.email === 'nizamaazuddin@gmail.com')
    ) {
      updateOrderRatingInFirestore(orderId, rating).catch((err) =>
        console.error('Firestore rating sync skipped:', err)
      );
    }
    setUserProfile((prev) => ({
      ...prev,
      ecoRewardPoints: prev.ecoRewardPoints + 20,
    }));
    if (auth.currentUser?.emailVerified) {
      syncWalletBalanceToFirestore(
        userProfile.walletBalance,
        nextPoints,
        userProfile.totalRecycledKg
      ).catch((err) => console.error('Firestore rating points sync skipped:', err));
    }
    setNotifications((prev) => [
      {
        id: `notif_rate_${Date.now()}`,
        title: 'Rating Submitted',
        message: 'Thank you for rating your pickup! Earned +20 Eco Reward Points.',
        time: 'Just now',
        read: false,
        type: 'reward',
      },
      ...prev,
    ]);
  };

  // Reorder past order handler
  const handleReorder = (order: PickupOrder) => {
    setCart((prev) => {
      const nextCart = { ...prev };
      order.items.forEach((item) => {
        const qtyToAdd = item.actualQty || item.estimatedQty;
        const currentQty = nextCart[item.scrapItemId] || 0;
        nextCart[item.scrapItemId] = currentQty + qtyToAdd;
      });
      return nextCart;
    });
  };

  // Executive update status handler
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: PickupOrder['status'],
    finalAmount?: number,
    totalWeight?: number
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              finalAmount: finalAmount ?? o.totalEstimatedAmount,
              totalWeight: totalWeight ?? 15,
              paymentStatus: newStatus === 'completed' ? 'Paid' : o.paymentStatus,
            }
          : o
      )
    );

    if (newStatus === 'completed' && finalAmount) {
      const nextWallet = userProfile.walletBalance + finalAmount;
      const nextPoints = userProfile.ecoRewardPoints + Math.round(finalAmount / 10);
      const nextKg = userProfile.totalRecycledKg + (totalWeight || 0);
      setUserProfile((prev) => ({
        ...prev,
        walletBalance: prev.walletBalance + finalAmount,
        ecoRewardPoints: prev.ecoRewardPoints + Math.round(finalAmount / 10),
        totalRecycledKg: prev.totalRecycledKg + (totalWeight || 0),
      }));
      if (auth.currentUser?.emailVerified) {
        syncWalletBalanceToFirestore(nextWallet, nextPoints, nextKg).catch((err) =>
          console.error('Firestore completion wallet sync skipped:', err)
        );
      }

      setTransactions((prev) => [
        {
          id: `tx_${Date.now()}`,
          type: 'credit',
          amount: finalAmount,
          description: `Scrap Pickup Payout - Order #${orderId}`,
          timestamp: 'Just now',
          status: 'Completed',
          referenceId: `UPI-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        },
        ...prev,
      ]);
    }
    recordActivityLog({
      actionType: 'ORDER_STATUS_UPDATED',
      summary: `Order ${orderId} status updated to ${newStatus}`,
      details: `Final amount: ₹${finalAmount ?? 'Pending'}, Total weight: ${totalWeight ?? 'TBD'} kg`,
      quantity: totalWeight,
      estimatedValue: finalAmount,
    });
  };

  // Admin Rate update handler (tracks previousRate for real-time surge marquee)
  const handleUpdateScrapRate = (itemId: string, newRate: number) => {
    const existingItem = items.find((i) => i.id === itemId);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        const nextTrend: 'up' | 'down' | 'stable' =
          newRate > i.rate ? 'up' : newRate < i.rate ? 'down' : 'stable';
        return {
          ...i,
          previousRate: newRate !== i.rate ? i.rate : i.previousRate,
          rate: newRate,
          trend: nextTrend,
        };
      })
    );
    if (
      existingItem &&
      auth.currentUser?.emailVerified &&
      auth.currentUser.email === 'nizamaazuddin@gmail.com'
    ) {
      syncScrapRateToFirestore({ ...existingItem, rate: newRate }).catch((err) =>
        console.error('Firestore scrap rate sync skipped:', err)
      );
    }
    recordActivityLog({
      actorRole: 'admin',
      actionType: 'RATE_UPDATED',
      summary: `Rate Updated: ${existingItem?.name || itemId} -> ₹${newRate}/${existingItem?.unit || 'kg'}`,
      details: `Previous rate: ₹${existingItem?.rate ?? 'N/A'}`,
      materialId: itemId,
      estimatedValue: newRate,
    });
    fetch('/api/rates/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, rate: newRate }),
    }).catch((err) => console.log('API rate sync', err));
  };

  // Auth Handlers with Role-based Portal Isolation
  const handleLogin = (
    role: UserRole,
    details?: {
      name: string;
      phone?: string;
      email?: string;
      customerId?: string;
      executiveId?: string;
      businessProfile?: BusinessProfile;
    }
  ) => {
    setRole(role);
    setIsAuthenticated(true);
    if (details?.businessProfile) {
      setCurrentBusiness(details.businessProfile);
    }
    if (details) {
      setUserProfile((prev) => ({
        ...prev,
        id: details.customerId || details.businessProfile?.id || prev.id,
        name: details.name || prev.name,
        phone: details.phone || prev.phone,
        email: details.email || prev.email,
        role: role,
      }));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Customer Admin CRUD Handlers
  const handleCreateCustomer = (newCust: CustomerAccount) => {
    setCustomers((prev) => [newCust, ...prev]);
  };

  const handleUpdateCustomer = (id: string, updated: Partial<CustomerAccount>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const handleBulkUploadCustomers = (newCusts: CustomerAccount[]) => {
    setCustomers((prev) => [...newCusts, ...prev]);
  };

  const handleCreateCustomerOrder = (newOrder: PickupOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Executive Admin CRUD Handlers
  const handleCreateExecutive = (newExec: Executive) => {
    setExecutives((prev) => [newExec, ...prev]);
  };

  const handleUpdateExecutive = (id: string, updated: Partial<Executive>) => {
    setExecutives((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const handleDeleteExecutive = (id: string) => {
    setExecutives((prev) => prev.filter((e) => e.id !== id));
  };

  const handleBulkUploadExecutives = (newExecs: Executive[]) => {
    setExecutives((prev) => [...newExecs, ...prev]);
  };

  // Order Admin Update/Delete Handlers
  const handleUpdateOrder = (orderId: string, updated: Partial<PickupOrder>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Vouchers Admin CRUD
  const handleCreateVoucher = (newVoucher: RewardVoucher) => {
    setVouchers((prev) => [newVoucher, ...prev]);
  };

  const handleUpdateVoucher = (voucherId: string, updated: Partial<RewardVoucher>) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, ...updated } : v))
    );
  };

  const handleDeleteVoucher = (voucherId: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== voucherId));
  };

  // Wallet & Transactions Admin CRUD
  const handleAddTransaction = (newTx: WalletTransaction, customerId?: string) => {
    setTransactions((prev) => [newTx, ...prev]);
    if (customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customerId) {
            const delta = newTx.type === 'credit' || newTx.type === 'reward_cashback' ? newTx.amount : -newTx.amount;
            return { ...c, walletBalance: Math.max(0, c.walletBalance + delta) };
          }
          return c;
        })
      );
    }
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  const handleAdjustCustomerBalance = (
    customerId: string,
    walletDelta: number,
    ecoPointsDelta: number,
    reason: string
  ) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            walletBalance: Math.max(0, c.walletBalance + walletDelta),
            ecoRewardPoints: Math.max(0, c.ecoRewardPoints + ecoPointsDelta),
          };
        }
        return c;
      })
    );
    if (userProfile.id === customerId) {
      setUserProfile((prev) => ({
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance + walletDelta),
        ecoRewardPoints: Math.max(0, prev.ecoRewardPoints + ecoPointsDelta),
      }));
    }
    if (walletDelta !== 0) {
      const tx: WalletTransaction = {
        id: `tx_admin_${Date.now()}`,
        type: walletDelta > 0 ? 'credit' : 'debit',
        amount: Math.abs(walletDelta),
        description: `Admin Adjustment: ${reason}`,
        timestamp: new Date().toLocaleString(),
        status: 'Completed',
        referenceId: `ADM-ADJ-${Date.now().toString().slice(-6)}`,
      };
      setTransactions((prev) => [tx, ...prev]);
    }
  };

  // Leaderboard Admin CRUD
  const handleCreateLeaderboardUser = (newUser: LeaderboardUser) => {
    setLeaderboardUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateLeaderboardUser = (userId: string, updated: Partial<LeaderboardUser>) => {
    setLeaderboardUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
    );
  };

  const handleDeleteLeaderboardUser = (userId: string) => {
    setLeaderboardUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Community Drives Admin CRUD
  const handleCreateCleanupDrive = (newDrive: CleanupDrive) => {
    setCleanupDrives((prev) => [newDrive, ...prev]);
  };

  const handleUpdateCleanupDrive = (driveId: string, updated: Partial<CleanupDrive>) => {
    setCleanupDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, ...updated } : d))
    );
  };

  const handleDeleteCleanupDrive = (driveId: string) => {
    setCleanupDrives((prev) => prev.filter((d) => d.id !== driveId));
  };

  // Scrap Catalog Admin CRUD
  const handleCreateScrapItem = (newItem: ScrapItem) => {
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateScrapItem = (itemId: string, updated: Partial<ScrapItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        const rateChanged =
          typeof updated.rate === 'number' && updated.rate !== i.rate;
        return {
          ...i,
          ...updated,
          previousRate: rateChanged ? i.rate : updated.previousRate ?? i.previousRate,
          trend:
            rateChanged && !updated.trend
              ? updated.rate! > i.rate
                ? 'up'
                : 'down'
              : updated.trend ?? i.trend,
        };
      })
    );
  };

  const handleDeleteScrapItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleCreateCategory = (newCat: ScrapCategory) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  // Businesses Admin CRUD
  const handleCreateBusiness = (newBiz: BusinessProfile) => {
    setBusinesses((prev) => [newBiz, ...prev]);
  };

  const handleUpdateBusiness = (bizId: string, updated: Partial<BusinessProfile>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === bizId ? { ...b, ...updated } : b))
    );
  };

  const handleDeleteBusiness = (bizId: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== bizId));
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} defaultCategory={null} />;
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Main Navbar - Role Isolated (No cross-role visibility) */}
      <HeaderNavbar
        currentRole={currentRole}
        language={language}
        setLanguage={setLanguage}
        userProfile={userProfile}
        notifications={notifications}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenEcoQuiz={() => setEcoQuizOpen(true)}
        onOpenEcoAdvice={() => setCustomerTab('advice')}
        cartCount={Object.keys(cart).length}
        onOpenCartModal={() => setScheduleModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Role Navigation Sub-Bar for Customer Portal */}
      {currentRole === 'customer' && (
        <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCustomerTab('browse')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  customerTab === 'browse'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Recycle className="w-3.5 h-3.5" />
                <span>{t.navCategories}</span>
              </button>

              <button
                onClick={() => setCustomerTab('orders')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  customerTab === 'orders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.navMyOrders}</span>
                {activeOrdersCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    customerTab === 'orders' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCustomerTab('wallet')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  customerTab === 'wallet'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{t.navEcoWallet}</span>
              </button>

              <button
                onClick={() => setCustomerTab('leaderboard')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  customerTab === 'leaderboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Eco Leaderboard</span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[9px] font-black uppercase">
                  TOP 10
                </span>
              </button>

              <button
                onClick={() => setCustomerTab('community')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  customerTab === 'community'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-500" />
                <span>Community Drives</span>
                <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-full text-[9px] font-black uppercase">
                  LIVE
                </span>
              </button>

              <button
                onClick={() => setCustomerTab('impact')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  customerTab === 'impact'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Carbon Savings</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase">
                  CO₂ OFFSET
                </span>
              </button>

              <button
                onClick={() => setCustomerTab('map')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  customerTab === 'map'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Eco Map & Fleet</span>
                <span className="px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded-full text-[9px] font-black uppercase">
                  LIVE GPS
                </span>
              </button>

              <button
                onClick={() => setCustomerTab('advice')}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  customerTab === 'advice'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Eco-Advice & Tips</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase">
                  AI
                </span>
              </button>
            </div>

            {/* Quick Actions Button Group */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200/80 my-1 overflow-x-auto">
              <span className="hidden xl:inline-flex text-[10px] font-black uppercase text-slate-400 tracking-wider items-center gap-1 mr-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Quick Actions:
              </span>

              <button
                onClick={() => setScheduleModalOpen(true)}
                className="px-3 py-1.5 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-95"
                title="Book doorstep scrap pickup"
              >
                <Truck className="w-3.5 h-3.5 text-amber-300" />
                <span>Book Pickup</span>
              </button>

              <button
                onClick={() => setEcoQuizOpen(true)}
                className="px-2.5 py-1.5 text-xs font-extrabold bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-950 border border-amber-300 rounded-xl flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-95"
                title="Play Quick Eco Quiz to earn Eco Coins"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Eco Quiz</span>
                <span className="px-1 py-0.2 bg-amber-400 text-slate-950 rounded-md text-[9px] font-black">
                  +15
                </span>
              </button>

              <button
                onClick={() => setCustomerTab('advice')}
                className="px-2.5 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-95"
                title="View Gemini AI Eco-Advice"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Eco-Advice</span>
              </button>

              <button
                onClick={() => setCustomerTab('wallet')}
                className="px-2.5 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-95"
                title="View Eco Wallet & Earnings"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Wallet</span>
                <span className="px-1.5 py-0.5 bg-emerald-200/90 text-emerald-950 rounded-md text-[10px] font-black">
                  ₹{userProfile.walletBalance}
                </span>
              </button>

              <button
                onClick={() => setAiScannerOpen(true)}
                className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-95"
                title="AI Camera Scan Scrap"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">AI Scan</span>
              </button>

              <button
                onClick={() => {
                  setArPresetItemId(null);
                  setArAssistantOpen(true);
                }}
                className="px-2.5 py-1.5 text-xs font-bold bg-emerald-900 hover:bg-emerald-800 text-white border border-emerald-700 rounded-xl flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-95"
                title="AR Spatial Scrap Measurement & Bin Overlay"
              >
                <Box className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden lg:inline">AR Scan</span>
              </button>

              <button
                onClick={() => setVoiceBookingOpen(true)}
                className="px-2.5 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-95"
                title="Voice Assistant Booking"
              >
                <Mic className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline">Voice</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 rounded-xl flex items-center gap-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-95 ml-1"
                title="Return to Portal Selection / Close Customer Portal"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Exit Portal</span>
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Scrap Price Surges Scrolling Marquee Banner (Customer Portal Top) */}
      {currentRole === 'customer' && (
        <ScrapPriceSurgeBanner
          items={items}
          onSelectItem={(item) => {
            setCustomerTab('browse');
            setFocusedChartItemId(item.id);
            setTimeout(() => {
              document
                .getElementById('scrap-price-trends-section')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 80);
          }}
        />
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'customer' && (
          <>
            {customerTab === 'browse' && (
              <ScrapCategoryBrowser
                categories={categories}
                items={items}
                orders={orders}
                userProfile={userProfile}
                language={language}
                cart={cart}
                onUpdateCartQty={handleUpdateCartQty}
                onOpenAiScanner={() => setAiScannerOpen(true)}
                onOpenArAssistant={(presetId?: string) => {
                  setArPresetItemId(presetId || null);
                  setArAssistantOpen(true);
                }}
                onOpenVoiceBooking={() => setVoiceBookingOpen(true)}
                onOpenScheduleModal={() => setScheduleModalOpen(true)}
                activeOrderCount={activeOrdersCount}
                onOpenActiveOrderTracking={() => {
                  setSelectedTrackingOrder(orders[0]);
                  setGpsTrackerOpen(true);
                }}
                onNavigateToImpact={() => setCustomerTab('impact')}
                onNavigateToMap={() => setCustomerTab('map')}
                focusedChartItemId={focusedChartItemId}
                onTipAdded={(tip: SidebarTipSuggestion) => {
                  recordActivityLog({
                    actionType: 'RECYCLING_TIP_ADDED',
                    summary: `Added Tip Pick: ${tip.itemName} (${tip.suggestedQty} ${tip.unit})`,
                    details: `${tip.reasonTag}: ${tip.reasonText}`,
                    materialId: tip.scrapItemId,
                    quantity: tip.suggestedQty,
                    estimatedValue: Math.round(tip.suggestedQty * tip.estimatedRate),
                  });
                }}
              />
            )}

            {customerTab === 'orders' && (
              <OrderHistoryView
                orders={orders}
                language={language}
                userProfile={userProfile}
                transactions={transactions}
                activityLogs={activityLogs}
                onTrackOrder={(ord) => {
                  setSelectedTrackingOrder(ord);
                  setGpsTrackerOpen(true);
                }}
                onRateOrder={handleRateOrder}
                onReorder={handleReorder}
                onSetReminder={handleOpenPickupReminder}
                onConfirmPickupComplete={(ord) => {
                  const computedKg = ord.items.reduce((sum, item) => {
                    const qty = item.actualQty || item.estimatedQty || 0;
                    return sum + (item.unit === 'kg' ? qty : 1);
                  }, 0);
                  handleUpdateOrderStatus(
                    ord.id,
                    'completed',
                    ord.finalAmount || ord.totalEstimatedAmount,
                    computedKg > 0 ? computedKg : 12
                  );
                }}
              />
            )}

            {customerTab === 'wallet' && (
              <EcoWalletAndRewards
                userProfile={userProfile}
                transactions={transactions}
                vouchers={vouchers}
                orders={orders}
                language={language}
                onWithdrawFunds={handleWithdrawFunds}
                onRedeemVoucher={handleRedeemVoucher}
                onPledgeSigned={(pledge) => {
                  if (pledge.bonusPointsEarned > 0) {
                    handleRewardCoins(pledge.bonusPointsEarned);
                  }
                  recordActivityLog({
                    actionType: 'RECYCLING_TIP_ADDED',
                    summary: `Smart Eco Pledge Signed (${pledge.pledgeId}): ${pledge.monthlyTargetKg} kg/mo`,
                    details: `${pledge.frequency} target · ${pledge.annualCo2Kg} kg CO2/yr · ${pledge.commitments.join(', ')}`,
                    quantity: pledge.monthlyTargetKg,
                    estimatedValue: pledge.annualCo2Kg,
                  });
                }}
              />
            )}

            {customerTab === 'impact' && (
              <CarbonSavedCalculator
                orders={orders}
                userProfile={userProfile}
                onBack={() => setCustomerTab('browse')}
                onPledgeSigned={(pledge) => {
                  if (pledge.bonusPointsEarned > 0) {
                    handleRewardCoins(pledge.bonusPointsEarned);
                  }
                  recordActivityLog({
                    actionType: 'RECYCLING_TIP_ADDED',
                    summary: `Smart Eco Pledge Signed (${pledge.pledgeId}): ${pledge.monthlyTargetKg} kg/mo`,
                    details: `${pledge.frequency} target · ${pledge.annualCo2Kg} kg CO2/yr · ${pledge.commitments.join(', ')}`,
                    quantity: pledge.monthlyTargetKg,
                    estimatedValue: pledge.annualCo2Kg,
                  });
                }}
              />
            )}

            {customerTab === 'map' && (
              <InteractiveEcoMap
                language={language}
                userProfile={userProfile}
                cleanupDrives={cleanupDrives}
                onBookPickupHere={(area) => {
                  setCustomerTab('browse');
                  setScheduleModalOpen(true);
                }}
                onBack={() => setCustomerTab('browse')}
              />
            )}

            {customerTab === 'leaderboard' && (
              <EcoLeaderboard
                userProfile={userProfile}
                language={language}
                leaderboardUsers={leaderboardUsers}
                onUpdateUsers={setLeaderboardUsers}
              />
            )}

            {customerTab === 'community' && (
              <CommunityCleanup
                userProfile={userProfile}
                language={language}
                drives={cleanupDrives}
                onUpdateDrives={setCleanupDrives}
              />
            )}

            {customerTab === 'advice' && (
              <EcoAdviceComponent
                orders={orders}
                userName={userProfile.name}
                onRewardCoins={handleRewardCoins}
                onOpenEcoQuiz={() => setEcoQuizOpen(true)}
              />
            )}
          </>
        )}

        {currentRole === 'business' && (
          <BusinessDashboard
            business={currentBusiness}
            items={items}
            language={language}
            onBack={handleLogout}
            onClose={handleLogout}
          />
        )}

        {currentRole === 'executive' && (
          <ExecutiveDashboard
            orders={orders}
            language={language}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBack={handleLogout}
            onClose={handleLogout}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            items={items}
            categories={categories}
            executives={executives}
            orders={orders}
            customers={customers}
            vouchers={vouchers}
            transactions={transactions}
            leaderboardUsers={leaderboardUsers}
            cleanupDrives={cleanupDrives}
            businesses={businesses}
            activityLogs={activityLogs}
            language={language}
            onUpdateScrapRate={handleUpdateScrapRate}
            onCreateScrapItem={handleCreateScrapItem}
            onUpdateScrapItem={handleUpdateScrapItem}
            onDeleteScrapItem={handleDeleteScrapItem}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
            onCreateCustomer={handleCreateCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onBulkUploadCustomers={handleBulkUploadCustomers}
            onCreateCustomerOrder={handleCreateCustomerOrder}
            onCreateExecutive={handleCreateExecutive}
            onUpdateExecutive={handleUpdateExecutive}
            onDeleteExecutive={handleDeleteExecutive}
            onBulkUploadExecutives={handleBulkUploadExecutives}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            onCreateVoucher={handleCreateVoucher}
            onUpdateVoucher={handleUpdateVoucher}
            onDeleteVoucher={handleDeleteVoucher}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAdjustCustomerBalance={handleAdjustCustomerBalance}
            onCreateLeaderboardUser={handleCreateLeaderboardUser}
            onUpdateLeaderboardUser={handleUpdateLeaderboardUser}
            onDeleteLeaderboardUser={handleDeleteLeaderboardUser}
            onCreateCleanupDrive={handleCreateCleanupDrive}
            onUpdateCleanupDrive={handleUpdateCleanupDrive}
            onDeleteCleanupDrive={handleDeleteCleanupDrive}
            onCreateBusiness={handleCreateBusiness}
            onUpdateBusiness={handleUpdateBusiness}
            onDeleteBusiness={handleDeleteBusiness}
            onFormCreated={(form: GoogleFormSummary) => {
              recordActivityLog({
                actorRole: 'admin',
                actionType: 'FORM_CREATED',
                summary: `Google Form Created: ${form.title}`,
                details: `${form.questions.length} question(s) · Template: ${form.templateType || 'custom'}`,
              });
            }}
            onBack={handleLogout}
            onClose={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-950">{t.appName}</span>
            <span>• Government Eco Partner & Clean Earth Green Wealth Initiative</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Kannada • English • Hindi</span>
            <button
              onClick={() => setEcoQuizOpen(true)}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Eco Quiz Challenge</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals Container */}
      <AiScrapCameraModal
        isOpen={aiScannerOpen}
        onClose={() => setAiScannerOpen(false)}
        language={language}
        onAddDetectedItemToCart={handleAddDetectedItemToCart}
      />

      <ArScrapAssistantModal
        isOpen={arAssistantOpen}
        onClose={() => setArAssistantOpen(false)}
        items={items}
        presetItemId={arPresetItemId}
        language={language}
        onAnalysisComplete={(arResult: ArScanAnalysis) => {
          recordActivityLog({
            actionType: 'AR_SPATIAL_SCAN',
            summary: `AR Scan: ${arResult.materialName} (${arResult.estimatedDimensionsCm})`,
            details: `${arResult.purityGrade} · Bin: ${arResult.binLabel} · Est. ${arResult.estimatedWeightKg} ${arResult.unit}`,
            materialId: arResult.matchedItemId,
            quantity: arResult.estimatedWeightKg,
            estimatedValue: Math.round(arResult.estimatedWeightKg * arResult.estimatedRatePerUnit),
          });
        }}
        onAddMeasuredToCart={(itemId, qty) => {
          handleUpdateCartQty(itemId, (cart[itemId] || 0) + qty);
          const itemMatch = items.find((it) => it.id === itemId);
          recordActivityLog({
            actionType: 'AR_SPATIAL_SCAN',
            summary: `AR Measured & Added: ${itemMatch?.name || itemId} (${qty} ${itemMatch?.unit || 'kg'})`,
            details: `Added measured volume from AR Spatial Scanner to pickup cart.`,
            materialId: itemId,
            quantity: qty,
            estimatedValue: itemMatch ? Math.round(itemMatch.rate * qty) : undefined,
          });
        }}
      />

      <VoiceBookingModal
        isOpen={voiceBookingOpen}
        onClose={() => setVoiceBookingOpen(false)}
        language={language}
        onConfirmVoiceBooking={handleConfirmVoiceBooking}
      />

      <PickupScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        language={language}
        userProfile={userProfile}
        cart={cart}
        items={items}
        orders={orders}
        onConfirmScheduleOrder={handleConfirmScheduleOrder}
      />

      {selectedTrackingOrder && (
        <LiveGpsTrackerModal
          isOpen={gpsTrackerOpen}
          onClose={() => setGpsTrackerOpen(false)}
          language={language}
          order={selectedTrackingOrder}
        />
      )}

      {/* Pickup Reminder Modal (WhatsApp Alert & Calendar .ics Sync) */}
      <PickupReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        order={selectedReminderOrder || orders[0] || null}
        language={language}
        onAddNotification={(notif) => setNotifications((prev) => [notif, ...prev])}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
      />

      {/* Eco Quiz Challenge Modal */}
      <EcoQuizModal
        isOpen={ecoQuizOpen}
        onClose={() => setEcoQuizOpen(false)}
        onRewardCoins={handleRewardCoins}
      />

      {/* Profile Milestone Celebration Modal (Total Kg Recycled & Wallet Balance) */}
      <MilestoneCelebrationModal
        milestone={celebrationQueue[0] || null}
        remainingInQueue={Math.max(0, celebrationQueue.length - 1)}
        userProfile={userProfile}
        onClose={() => setCelebrationQueue((prev) => prev.slice(1))}
        onNavigateToWallet={() => {
          setRole('customer');
          setCustomerTab('wallet');
        }}
        onNavigateToImpact={() => {
          setRole('customer');
          setCustomerTab('impact');
        }}
      />

      {/* Floating WhatsApp Quick Connect & Support (Official 24/7 Channel across all portals) */}
      <WhatsAppChatWidget />
    </div>
  );
}
