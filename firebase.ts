import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  persistentSingleTabManager,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  PickupOrder,
  ScrapItem,
  UserProfile,
  WorkspaceActivityLog,
  GoogleFormTemplateType,
} from '../types';

// Single shared Firebase App initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const databaseId =
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || '(default)';

// Enable IndexedDB offline persistence (multi-tab with single-tab and HMR-safe fallback)
function initPersistentFirestore(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      databaseId
    );
  } catch {
    try {
      return initializeFirestore(
        app,
        {
          localCache: persistentLocalCache({
            tabManager: persistentSingleTabManager({ forceOwnership: false }),
          }),
        },
        databaseId
      );
    } catch {
      return getFirestore(app, databaseId);
    }
  }
}

// CRITICAL: Connected to the exact provisioned Firestore database ID from firebase-applet-config.json
export const db = initPersistentFirestore();

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const isOfflineError = (error: unknown): boolean => {
  if (!error) return false;
  const code = (error as { code?: string }).code;
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    code === 'unavailable' ||
    msg.includes('the client is offline') ||
    msg.includes('client is offline') ||
    msg.includes('failed to get document because the client is offline')
  );
};

// Validate live connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

const sanitizeId = (raw: string, fallback = 'doc_default'): string => {
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return clean.length > 0 ? clean : fallback;
};

const clampStr = (raw: string | undefined | null, maxLen: number, fallback = ''): string => {
  const s = (raw ?? fallback).toString().trim();
  return s.slice(0, maxLen);
};

export interface FirestoreFormRecordInput {
  id: string;
  title: string;
  responderUri?: string;
  webViewLink?: string;
  templateType: GoogleFormTemplateType;
  responseCount: number;
}

export interface PersistedWalletState {
  displayName: string;
  walletBalance: number;
  ecoRewardPoints: number;
  totalRecycledKg: number;
}

export interface PersistedScrapRate {
  id: string;
  category: string;
  name: string;
  rate: number;
  unit: 'kg' | 'piece';
  co2Offset: number;
  minQty: string;
}

export interface PersistedOrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  area: string;
  city: string;
  status: PickupOrder['status'];
  scheduledDate: string;
  timeSlot: PickupOrder['timeSlot'];
  totalEstimatedAmount: number;
  finalAmount: number;
  paymentMethod: PickupOrder['paymentMethod'];
  itemsSummary: string;
  co2SavedTotal: number;
  rating: number;
  createdAt: string;
  hasPendingWrites: boolean;
}

export interface PersistedFirestoreData {
  ordersCount: number;
  logsCount: number;
  formsCount: number;
  walletState: PersistedWalletState | null;
  syncedRates: PersistedScrapRate[];
  syncedOrders: PersistedOrderRecord[];
  syncedForms: FirestoreFormRecordInput[];
  latestLogs: WorkspaceActivityLog[];
  fromCache: boolean;
  hasPendingWrites: boolean;
}

/**
 * Ensures the authenticated user's public & private (PII-isolated) profile exists in Firestore
 * without clobbering previously persisted walletBalance / ecoRewardPoints when reloading.
 */
export async function syncUserProfileToFirestore(
  user: User,
  profile: UserProfile,
  area = 'Indiranagar',
  city = 'Bengaluru'
): Promise<void> {
  const uid = sanitizeId(user.uid);
  const publicPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/info`;

  let publicExists = false;
  try {
    const publicRef = doc(db, 'users', uid);
    const existingPublic = await getDoc(publicRef);
    publicExists = existingPublic.exists();
    const displayName = clampStr(user.displayName || profile.name, 100, 'Eco Citizen');

    if (!publicExists) {
      await setDoc(publicRef, {
        uid,
        displayName,
        role: 'customer',
        walletBalance: Math.max(0, Number(profile.walletBalance) || 0),
        ecoRewardPoints: Math.max(0, Number(profile.ecoRewardPoints) || 0),
        totalRecycledKg: Math.max(0, Number(profile.totalRecycledKg) || 0),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      publicExists = true;
    } else if (user.displayName && existingPublic.data()?.displayName !== displayName) {
      await updateDoc(publicRef, {
        displayName,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    if (isOfflineError(error)) {
      // Offline with no prior cached profile: onSnapshot will hydrate once available or queued
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, publicPath);
  }

  if (!publicExists) return;

  try {
    const privateRef = doc(db, 'users', uid, 'private', 'info');
    const existingPrivate = await getDoc(privateRef);
    const email = clampStr(user.email || profile.email, 160, 'citizen@punarchakra.in');
    const phone = clampStr(user.phoneNumber || profile.phone, 32, '');
    const safeArea = clampStr(area, 100, 'Indiranagar');
    const safeCity = clampStr(city, 80, 'Bengaluru');

    if (!existingPrivate.exists()) {
      await setDoc(privateRef, {
        uid,
        email,
        phone,
        area: safeArea,
        city: safeCity,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(privateRef, {
        email,
        phone,
        area: safeArea,
        city: safeCity,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    if (isOfflineError(error)) return;
    handleFirestoreError(error, OperationType.WRITE, privatePath);
  }
}

/**
 * Updates Eco-Wallet balance, reward points, and recycled kg in Firestore (works offline via IndexedDB queue).
 */
export async function syncWalletBalanceToFirestore(
  walletBalance: number,
  ecoRewardPoints: number,
  totalRecycledKg: number
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const uid = sanitizeId(user.uid);
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      walletBalance: Math.max(0, Number(walletBalance) || 0),
      ecoRewardPoints: Math.max(0, Number(ecoRewardPoints) || 0),
      totalRecycledKg: Math.max(0, Number(totalRecycledKg) || 0),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (isOfflineError(error)) return;
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Persists a pickup order in Cloud Firestore under /pickup_orders/{orderId}.
 * Writes locally to IndexedDB immediately when offline and auto-syncs upon reconnection.
 */
export async function syncPickupOrderToFirestore(order: PickupOrder): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeOrderId = sanitizeId(order.id, `ord_${Date.now()}`);
  const path = `pickup_orders/${safeOrderId}`;
  const itemsSummary = clampStr(
    order.items
      .map((i) => `${i.name} (${i.actualQty ?? i.estimatedQty} ${i.unit})`)
      .join(', '),
    500,
    'Mixed Recyclable Scrap'
  );

  try {
    await setDoc(doc(db, 'pickup_orders', safeOrderId), {
      id: safeOrderId,
      orderNumber: clampStr(order.orderNumber, 40, safeOrderId),
      ownerUid: sanitizeId(user.uid),
      customerName: clampStr(order.customerName, 100, user.displayName || 'Citizen'),
      area: clampStr(order.address?.area, 100, 'Indiranagar'),
      city: clampStr(order.address?.city, 80, 'Bengaluru'),
      status: order.status,
      scheduledDate: clampStr(order.scheduledDate, 40, new Date().toISOString().slice(0, 10)),
      timeSlot: clampStr(order.timeSlot, 60, 'Morning (9 AM - 12 PM)'),
      totalEstimatedAmount: Math.max(0, Number(order.totalEstimatedAmount) || 0),
      finalAmount: Math.max(0, Number(order.finalAmount ?? order.totalEstimatedAmount) || 0),
      paymentMethod: order.paymentMethod || 'UPI',
      itemsSummary,
      co2SavedTotal: Math.max(0, Number(order.co2SavedTotal) || 0),
      rating: Math.min(5, Math.max(0, Number(order.rating) || 0)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (isOfflineError(error)) return;
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates an order's rating in Cloud Firestore
 */
export async function updateOrderRatingInFirestore(
  orderId: string,
  rating: number
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const safeId = sanitizeId(orderId);
  const path = `pickup_orders/${safeId}`;
  try {
    await updateDoc(doc(db, 'pickup_orders', safeId), {
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (isOfflineError(error)) return;
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Persists an AI, AR, recycling tip, or Google Form telemetry event in /activity_logs/{logId}
 */
export async function syncActivityLogToFirestore(log: WorkspaceActivityLog): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = sanitizeId(log.id, `log_${Date.now()}`);
  const path = `activity_logs/${safeId}`;

  try {
    await setDoc(doc(db, 'activity_logs', safeId), {
      id: safeId,
      ownerUid: sanitizeId(user.uid),
      actorName: clampStr(log.actorName, 100, user.displayName || 'Citizen'),
      actionType: log.actionType,
      summary: clampStr(log.summary, 200, 'Recycling activity'),
      details: clampStr(log.details, 500, ''),
      materialId: clampStr(log.materialId, 80, ''),
      quantity: Math.max(0, Number(log.quantity) || 0),
      estimatedValue: Math.max(0, Number(log.estimatedValue) || 0),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (isOfflineError(error)) return;
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Persists a live scrap spot rate to /scrap_rates/{itemId} (admin-only per firestore.rules)
 */
export async function syncScrapRateToFirestore(item: ScrapItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = sanitizeId(item.id);
  const path = `scrap_rates/${safeId}`;
  try {
    await setDoc(doc(db, 'scrap_rates', safeId), {
      id: safeId,
      category: clampStr(item.category, 60, 'General'),
      name: clampStr(item.name, 120, safeId),
      rate: Math.max(0, Number(item.rate) || 0),
      unit: item.unit === 'piece' ? 'piece' : 'kg',
      co2Offset: Math.max(0, Number(item.co2Offset) || 0),
      minQty: clampStr(item.minQty, 40, '1 kg'),
      updatedByUid: sanitizeId(user.uid),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (isOfflineError(error)) return;
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Seeds /scrap_rates when the bootstrap admin connects and no rates exist in Firestore yet,
 * so all authenticated users cache live scrap categories/rates in IndexedDB for offline browsing.
 */
export async function seedScrapRatesIfAdmin(items: ScrapItem[]): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || user.email !== 'nizamaazuddin@gmail.com') return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  for (const item of items) {
    const safeId = sanitizeId(item.id);
    const rateRef = doc(db, 'scrap_rates', safeId);
    try {
      const snap = await getDocFromServer(rateRef);
      if (!snap.exists()) {
        await syncScrapRateToFirestore(item);
      }
    } catch (error) {
      if (isOfflineError(error)) return;
      // Continue cleanly if server check cannot complete right now
    }
  }
}

/**
 * Persists a created/linked Google Form record inside /form_records/{formId}
 */
export async function syncGoogleFormRecordToFirestore(
  formRecord: FirestoreFormRecordInput
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = sanitizeId(formRecord.id, `form_${Date.now()}`);
  const path = `form_records/${safeId}`;
  try {
    const formRef = doc(db, 'form_records', safeId);
    const existingForm = await getDoc(formRef);
    const safeTitle = clampStr(formRecord.title, 160, 'PunarChakra Form');
    const safeCount = Math.max(0, Number(formRecord.responseCount) || 0);

    if (!existingForm.exists()) {
      await setDoc(formRef, {
        id: safeId,
        ownerUid: sanitizeId(user.uid),
        title: safeTitle,
        responderUri: clampStr(formRecord.responderUri, 400, ''),
        webViewLink: clampStr(formRecord.webViewLink, 400, ''),
        templateType: formRecord.templateType || 'custom',
        responseCount: safeCount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(formRef, {
        title: safeTitle,
        responseCount: safeCount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    if (isOfflineError(error)) return;
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to the signed-in user's persisted Firestore records (user Eco-Wallet,
 * scrap catalog rates, pickup orders, activity logs, and forms) using offline-capable listeners.
 */
export function subscribeUserFirestoreData(
  user: User,
  onUpdate: (data: PersistedFirestoreData) => void
): Unsubscribe {
  const uid = sanitizeId(user.uid);
  const state: PersistedFirestoreData = {
    ordersCount: 0,
    logsCount: 0,
    formsCount: 0,
    walletState: null,
    syncedRates: [],
    syncedOrders: [],
    syncedForms: [],
    latestLogs: [],
    fromCache: false,
    hasPendingWrites: false,
  };

  const userPath = `users/${uid}`;
  const ratesPath = 'scrap_rates';
  const ordersPath = 'pickup_orders';
  const logsPath = 'activity_logs';
  const formsPath = 'form_records';

  const unsubWallet = onSnapshot(
    doc(db, 'users', uid),
    { includeMetadataChanges: true },
    (snap) => {
      if (snap.exists()) {
        const data = snap.data({ serverTimestamps: 'estimate' });
        state.walletState = {
          displayName: data.displayName || user.displayName || 'Eco Citizen',
          walletBalance: Math.max(0, Number(data.walletBalance) || 0),
          ecoRewardPoints: Math.max(0, Number(data.ecoRewardPoints) || 0),
          totalRecycledKg: Math.max(0, Number(data.totalRecycledKg) || 0),
        };
      }
      state.fromCache = snap.metadata.fromCache;
      state.hasPendingWrites = snap.metadata.hasPendingWrites;
      onUpdate({ ...state });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, userPath);
    }
  );

  const unsubRates = onSnapshot(
    query(collection(db, ratesPath), limit(100)),
    { includeMetadataChanges: true },
    (snap) => {
      state.syncedRates = snap.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          id: data.id || d.id,
          category: data.category || 'General',
          name: data.name || d.id,
          rate: Math.max(0, Number(data.rate) || 0),
          unit: data.unit === 'piece' ? 'piece' : 'kg',
          co2Offset: Math.max(0, Number(data.co2Offset) || 0),
          minQty: data.minQty || '1 kg',
        };
      });
      onUpdate({ ...state });
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, ratesPath);
    }
  );

  const unsubOrders = onSnapshot(
    query(collection(db, ordersPath), where('ownerUid', '==', uid), limit(50)),
    { includeMetadataChanges: true },
    (snap) => {
      state.ordersCount = snap.size;
      state.syncedOrders = snap.docs
        .map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return {
            id: data.id || d.id,
            orderNumber: data.orderNumber || d.id,
            customerName: data.customerName || 'Citizen',
            area: data.area || 'Indiranagar',
            city: data.city || 'Bengaluru',
            status: (data.status as PickupOrder['status']) || 'en_route',
            scheduledDate: data.scheduledDate || new Date().toISOString().slice(0, 10),
            timeSlot: (data.timeSlot as PickupOrder['timeSlot']) || 'Morning (9 AM - 12 PM)',
            totalEstimatedAmount: Math.max(0, Number(data.totalEstimatedAmount) || 0),
            finalAmount: Math.max(0, Number(data.finalAmount) || 0),
            paymentMethod: (data.paymentMethod as PickupOrder['paymentMethod']) || 'UPI',
            itemsSummary: data.itemsSummary || 'Recyclable Scrap',
            co2SavedTotal: Math.max(0, Number(data.co2SavedTotal) || 0),
            rating: Math.max(0, Number(data.rating) || 0),
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            hasPendingWrites: d.metadata.hasPendingWrites,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      state.fromCache = snap.metadata.fromCache;
      state.hasPendingWrites = snap.metadata.hasPendingWrites;
      onUpdate({ ...state });
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, ordersPath);
    }
  );

  const unsubLogs = onSnapshot(
    query(collection(db, logsPath), where('ownerUid', '==', uid), limit(30)),
    { includeMetadataChanges: true },
    (snap) => {
      state.logsCount = snap.size;
      state.latestLogs = snap.docs
        .map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return {
            id: data.id || d.id,
            timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            actorName: data.actorName || 'User',
            actorRole: 'customer' as const,
            actionType: data.actionType || 'AI_PHOTO_SCAN',
            summary: data.summary || '',
            details: data.details || '',
            materialId: data.materialId || undefined,
            quantity: typeof data.quantity === 'number' ? data.quantity : undefined,
            estimatedValue: typeof data.estimatedValue === 'number' ? data.estimatedValue : undefined,
          };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate({ ...state });
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, logsPath);
    }
  );

  const unsubForms = onSnapshot(
    query(collection(db, formsPath), where('ownerUid', '==', uid), limit(25)),
    { includeMetadataChanges: true },
    (snap) => {
      state.formsCount = snap.size;
      state.syncedForms = snap.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          id: data.id || d.id,
          title: data.title || 'Google Form',
          responderUri: data.responderUri || '',
          webViewLink: data.webViewLink || '',
          templateType: data.templateType || 'custom',
          responseCount: Number(data.responseCount) || 0,
        };
      });
      onUpdate({ ...state });
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, formsPath);
    }
  );

  return () => {
    unsubWallet();
    unsubRates();
    unsubOrders();
    unsubLogs();
    unsubForms();
  };
}
