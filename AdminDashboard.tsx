import React, { useState, useEffect } from 'react';
import {
  Shield,
  BarChart3,
  TrendingUp,
  DollarSign,
  Leaf,
  Users,
  Edit2,
  Check,
  Zap,
  Truck,
  Plus,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Trash2,
  Upload,
  Search,
  ExternalLink,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowLeft,
  FileText,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  Eye,
} from 'lucide-react';
import {
  ScrapItem,
  ScrapCategory,
  Executive,
  PickupOrder,
  Language,
  CustomerAccount,
  DriveFileItem,
  TimeSlot,
  RewardVoucher,
  WalletTransaction,
  LeaderboardUser,
  CleanupDrive,
  BusinessProfile,
  WorkspaceActivityLog,
  GoogleFormTemplateType,
  GoogleFormSummary,
  GoogleFormResponseItem,
} from '../../types';
import { translations } from '../../utils/translations';
import { AdminWalletRewardsTab } from './AdminWalletRewardsTab';
import { AdminLeaderboardTab } from './AdminLeaderboardTab';
import { AdminDrivesTab } from './AdminDrivesTab';
import { AdminCatalogTab } from './AdminCatalogTab';
import { AdminBusinessTab } from './AdminBusinessTab';
import { ScrapPriceTrendChart } from '../CustomerPortal/ScrapPriceTrendChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from 'recharts';
import businessCircularFacilityImg from '../../assets/images/business_circular_facility_1794691631257.jpg';
import fleetEvOperationsImg from '../../assets/images/fleet_ev_operations_1794691631469.jpg';
import {
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  getWorkspaceAccessToken,
  createGoogleSpreadsheet,
  syncAllSheetsToExistingSpreadsheet,
  listGoogleSpreadsheetsFromDrive,
  listBackupFilesInDrive,
  deleteFileFromDrive,
  uploadBackupCsvToDrive,
  uploadJsonBackupToDrive,
  listGoogleFormsFromDrive,
  createPunarChakraGoogleForm,
  getGoogleFormResponses,
  updateGoogleFormMetadata,
  SheetTabInput,
  BackupUploadResult,
  auth,
} from '../../services/googleWorkspace';
import { syncGoogleFormRecordToFirestore } from '../../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AdminDashboardProps {
  items: ScrapItem[];
  categories?: ScrapCategory[];
  executives: Executive[];
  orders: PickupOrder[];
  customers: CustomerAccount[];
  vouchers?: RewardVoucher[];
  transactions?: WalletTransaction[];
  leaderboardUsers?: LeaderboardUser[];
  cleanupDrives?: CleanupDrive[];
  businesses?: BusinessProfile[];
  activityLogs?: WorkspaceActivityLog[];
  language: Language;
  onUpdateScrapRate: (itemId: string, newRate: number) => void;
  onCreateScrapItem?: (item: ScrapItem) => void;
  onUpdateScrapItem?: (itemId: string, updated: Partial<ScrapItem>) => void;
  onDeleteScrapItem?: (itemId: string) => void;
  onCreateCategory?: (cat: ScrapCategory) => void;
  onDeleteCategory?: (catId: string) => void;
  onCreateCustomer: (customer: CustomerAccount) => void;
  onUpdateCustomer: (customerId: string, updated: Partial<CustomerAccount>) => void;
  onDeleteCustomer: (customerId: string) => void;
  onBulkUploadCustomers: (newCustomers: CustomerAccount[]) => void;
  onCreateCustomerOrder: (order: PickupOrder) => void;
  onCreateExecutive: (executive: Executive) => void;
  onUpdateExecutive: (executiveId: string, updated: Partial<Executive>) => void;
  onDeleteExecutive: (executiveId: string) => void;
  onBulkUploadExecutives: (newExecutives: Executive[]) => void;
  onUpdateOrder: (orderId: string, updated: Partial<PickupOrder>) => void;
  onDeleteOrder: (orderId: string) => void;
  onCreateVoucher?: (voucher: RewardVoucher) => void;
  onUpdateVoucher?: (voucherId: string, updated: Partial<RewardVoucher>) => void;
  onDeleteVoucher?: (voucherId: string) => void;
  onAddTransaction?: (transaction: WalletTransaction, customerId?: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  onAdjustCustomerBalance?: (
    customerId: string,
    walletDelta: number,
    ecoPointsDelta: number,
    reason: string
  ) => void;
  onCreateLeaderboardUser?: (user: LeaderboardUser) => void;
  onUpdateLeaderboardUser?: (userId: string, updated: Partial<LeaderboardUser>) => void;
  onDeleteLeaderboardUser?: (userId: string) => void;
  onCreateCleanupDrive?: (drive: CleanupDrive) => void;
  onUpdateCleanupDrive?: (driveId: string, updated: Partial<CleanupDrive>) => void;
  onDeleteCleanupDrive?: (driveId: string) => void;
  onCreateBusiness?: (biz: BusinessProfile) => void;
  onUpdateBusiness?: (bizId: string, updated: Partial<BusinessProfile>) => void;
  onDeleteBusiness?: (bizId: string) => void;
  onFormCreated?: (form: GoogleFormSummary) => void;
  onBack?: () => void;
  onClose?: () => void;
}

const CATEGORY_CHART_DATA = [
  { name: 'Metals', volumeKg: 1240, color: '#059669' },
  { name: 'Paper', volumeKg: 3100, color: '#f59e0b' },
  { name: 'Plastics', volumeKg: 980, color: '#0284c7' },
  { name: 'E-Waste', volumeKg: 420, color: '#7c3aed' },
  { name: 'Glass', volumeKg: 650, color: '#65a30d' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  categories = [],
  executives,
  orders,
  customers,
  vouchers = [],
  transactions = [],
  leaderboardUsers = [],
  cleanupDrives = [],
  businesses = [],
  activityLogs = [],
  language,
  onUpdateScrapRate,
  onCreateScrapItem,
  onUpdateScrapItem,
  onDeleteScrapItem,
  onCreateCategory,
  onDeleteCategory,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onBulkUploadCustomers,
  onCreateCustomerOrder,
  onCreateExecutive,
  onUpdateExecutive,
  onDeleteExecutive,
  onBulkUploadExecutives,
  onUpdateOrder,
  onDeleteOrder,
  onCreateVoucher,
  onUpdateVoucher,
  onDeleteVoucher,
  onAddTransaction,
  onDeleteTransaction,
  onAdjustCustomerBalance,
  onCreateLeaderboardUser,
  onUpdateLeaderboardUser,
  onDeleteLeaderboardUser,
  onCreateCleanupDrive,
  onUpdateCleanupDrive,
  onDeleteCleanupDrive,
  onCreateBusiness,
  onUpdateBusiness,
  onDeleteBusiness,
  onFormCreated,
  onBack,
  onClose,
}) => {
  const t = translations[language];

  // Primary Tab Navigation in Admin Console
  const [adminTab, setAdminTab] = useState<
    | 'overview'
    | 'catalog'
    | 'rewards'
    | 'leaderboard'
    | 'drives'
    | 'customers'
    | 'fleet'
    | 'orders'
    | 'businesses'
    | 'workspace'
  >('overview');

  // Scrap Rate Editing
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(0);

  // Search Filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [fleetSearch, setFleetSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals State
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);
  const [deleteCustomerConfirmId, setDeleteCustomerConfirmId] = useState<string | null>(null);

  const [addExecutiveModalOpen, setAddExecutiveModalOpen] = useState(false);
  const [editExecutiveModalOpen, setEditExecutiveModalOpen] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);
  const [deleteExecutiveConfirmId, setDeleteExecutiveConfirmId] = useState<string | null>(null);

  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);
  const [uploadCustomersModalOpen, setUploadCustomersModalOpen] = useState(false);
  const [uploadFleetModalOpen, setUploadFleetModalOpen] = useState(false);

  // Google Workspace State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [workspaceSyncStatus, setWorkspaceSyncStatus] = useState<string | null>(null);
  const [workspaceSyncError, setWorkspaceSyncError] = useState<string | null>(null);
  const [lastCreatedSheetUrl, setLastCreatedSheetUrl] = useState<string | null>(null);
  const [lastBackupResult, setLastBackupResult] = useState<BackupUploadResult | null>(null);
  const [driveSpreadsheets, setDriveSpreadsheets] = useState<DriveFileItem[]>([]);
  const [driveBackupFiles, setDriveBackupFiles] = useState<DriveFileItem[]>([]);
  const [driveForms, setDriveForms] = useState<DriveFileItem[]>([]);
  const [loadingDriveFiles, setLoadingDriveFiles] = useState(false);
  const [pendingSheetUpdateTarget, setPendingSheetUpdateTarget] = useState<DriveFileItem | null>(null);
  const [pendingDeleteFile, setPendingDeleteFile] = useState<DriveFileItem | null>(null);

  // Google Forms Studio State
  const [formTitleInput, setFormTitleInput] = useState('PunarChakra Citizen Pickup Feedback');
  const [formTemplate, setFormTemplate] = useState<GoogleFormTemplateType>('pickup_feedback');
  const [selectedFormSummary, setSelectedFormSummary] = useState<GoogleFormSummary | null>(null);
  const [selectedFormResponses, setSelectedFormResponses] = useState<GoogleFormResponseItem[]>([]);
  const [loadingFormDetails, setLoadingFormDetails] = useState(false);
  const [pendingFormEditTarget, setPendingFormEditTarget] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustStreet, setNewCustStreet] = useState('');
  const [newCustArea, setNewCustArea] = useState('Indiranagar');
  const [newCustCity, setNewCustCity] = useState('Bengaluru');
  const [newCustWallet, setNewCustWallet] = useState(500);

  // New Executive Form State
  const [newExecName, setNewExecName] = useState('');
  const [newExecPhone, setNewExecPhone] = useState('');
  const [newExecVehicleNo, setNewExecVehicleNo] = useState('');
  const [newExecVehicleType, setNewExecVehicleType] = useState<Executive['vehicleType']>('Electric Auto');

  // Create Order on Behalf Form State
  const [orderCustId, setOrderCustId] = useState(customers[0]?.id || '');
  const [orderItemId, setOrderItemId] = useState(items[0]?.id || 'copper');
  const [orderQuantity, setOrderQuantity] = useState(15);
  const [orderDate, setOrderDate] = useState('2026-11-12');
  const [orderSlot, setOrderSlot] = useState<TimeSlot>('Morning (9 AM - 12 PM)');
  const [orderExecId, setOrderExecId] = useState(executives[0]?.id || '');

  // CSV Upload States
  const [csvUploadPreview, setCsvUploadPreview] = useState<any[]>([]);
  const [csvRawFileName, setCsvRawFileName] = useState('');

  // Track Firebase Auth state for Google Workspace
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGoogleUser(user);
    });
    return () => unsubscribe();
  }, []);

  const totalPayout = orders.reduce(
    (sum, o) => sum + (o.finalAmount || o.totalEstimatedAmount),
    0
  );
  const totalCo2Saved = orders.reduce((sum, o) => sum + (o.co2SavedTotal || 35), 0);

  const handleSaveRate = (itemId: string) => {
    onUpdateScrapRate(itemId, tempRate);
    setEditingItemId(null);
  };

  // Google Workspace: Sign In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setWorkspaceSyncError(null);
    try {
      const res = await signInWithGoogleWorkspace();
      if (res) {
        setGoogleUser(res.user);
        setWorkspaceSyncStatus('Successfully authenticated with Google Drive & Google Sheets.');
        fetchDriveSpreadsheets();
      }
    } catch (err: any) {
      console.error(err);
      setWorkspaceSyncError(err.message || 'Google authentication failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogleWorkspace();
    setGoogleUser(null);
    setDriveSpreadsheets([]);
    setDriveBackupFiles([]);
    setDriveForms([]);
    setSelectedFormSummary(null);
    setSelectedFormResponses([]);
    setWorkspaceSyncStatus('Logged out of Google Workspace.');
  };

  // Fetch Spreadsheets, Forms & Backup Folder files from Google Drive
  const fetchDriveSpreadsheets = async () => {
    setLoadingDriveFiles(true);
    try {
      const [sheetsList, backupList, formsList] = await Promise.all([
        listGoogleSpreadsheetsFromDrive(),
        listBackupFilesInDrive('PunarChakra-Backups').catch(() => [] as DriveFileItem[]),
        listGoogleFormsFromDrive().catch(() => [] as DriveFileItem[]),
      ]);
      setDriveSpreadsheets(sheetsList);
      setDriveBackupFiles(backupList);
      setDriveForms(formsList);
    } catch (err: any) {
      console.error('Fetch Drive error:', err);
    } finally {
      setLoadingDriveFiles(false);
    }
  };

  // Create templated Google Form
  const handleCreateGoogleForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleUser || !getWorkspaceAccessToken()) {
      setWorkspaceSyncError('Please sign in with Google first to create Google Forms.');
      return;
    }
    setIsGoogleLoading(true);
    setWorkspaceSyncError(null);
    setWorkspaceSyncStatus(null);
    try {
      const created = await createPunarChakraGoogleForm(formTitleInput, formTemplate);
      setSelectedFormSummary(created);
      setSelectedFormResponses([]);
      onFormCreated?.(created);
      if (auth.currentUser?.emailVerified) {
        syncGoogleFormRecordToFirestore({
          id: created.formId,
          title: created.title,
          responderUri: created.responderUri,
          webViewLink: created.webViewLink,
          templateType: formTemplate,
          responseCount: 0,
        }).catch((err) => console.error('Firestore form sync skipped:', err));
      }
      setWorkspaceSyncStatus(
        `Google Form "${created.title}" created with ${created.questions.length} question(s) and archived in Drive.`
      );
      fetchDriveSpreadsheets();
    } catch (err: any) {
      console.error('Google Form create error:', err);
      setWorkspaceSyncError(err.message || 'Failed to create Google Form.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Inspect form schema and read live submitted responses
  const handleInspectGoogleForm = async (formId: string) => {
    if (!googleUser || !getWorkspaceAccessToken()) {
      setWorkspaceSyncError('Please sign in with Google first to read Google Form responses.');
      return;
    }
    setLoadingFormDetails(true);
    setWorkspaceSyncError(null);
    try {
      const { form, responses } = await getGoogleFormResponses(formId);
      setSelectedFormSummary(form);
      setSelectedFormResponses(responses);
      if (auth.currentUser?.emailVerified) {
        syncGoogleFormRecordToFirestore({
          id: form.formId,
          title: form.title,
          responderUri: form.responderUri,
          webViewLink: form.webViewLink,
          templateType: form.templateType || 'custom',
          responseCount: responses.length,
        }).catch((err) => console.error('Firestore form sync skipped:', err));
      }
    } catch (err: any) {
      console.error('Inspect Google Form error:', err);
      setWorkspaceSyncError(err.message || 'Failed to load Google Form responses.');
    } finally {
      setLoadingFormDetails(false);
    }
  };

  // Confirmation-gated Google Form metadata update
  const handleConfirmEditGoogleForm = async () => {
    if (!pendingFormEditTarget) return;
    const target = pendingFormEditTarget;
    setPendingFormEditTarget(null);
    setIsGoogleLoading(true);
    setWorkspaceSyncError(null);
    try {
      const updated = await updateGoogleFormMetadata(
        target.id,
        target.title,
        target.description,
        () => true
      );
      setSelectedFormSummary(updated);
      if (auth.currentUser?.emailVerified) {
        syncGoogleFormRecordToFirestore({
          id: updated.formId,
          title: updated.title,
          responderUri: updated.responderUri,
          webViewLink: updated.webViewLink,
          templateType: updated.templateType || 'custom',
          responseCount: selectedFormResponses.length,
        }).catch((err) => console.error('Firestore form update sync skipped:', err));
      }
      setWorkspaceSyncStatus(`Updated Google Form "${updated.title}" metadata.`);
      fetchDriveSpreadsheets();
    } catch (err: any) {
      setWorkspaceSyncError(err.message || 'Failed to update Google Form.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const csvCell = (val: string | number | boolean | undefined | null): string => {
    if (val === undefined || val === null) return '';
    const str = String(val).replace(/\r?\n/g, ' ');
    if (/[",]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build complete 11-tab payload capturing every entity & AI/AR activity log
  const buildMasterSheetsPayload = (): SheetTabInput[] => {
    const customersHeaders = [
      'Customer ID', 'Full Name', 'Phone', 'Email', 'Street', 'Area', 'City', 'Pincode',
      'Wallet Balance (₹)', 'Eco Points', 'Total Recycled (kg)', 'Orders Count', 'Status', 'Joined Date',
    ];
    const customersRows = customers.map((c) => [
      c.id,
      c.name,
      c.phone,
      c.email,
      c.address?.street || '',
      c.area,
      c.city,
      c.address?.pincode || '',
      c.walletBalance,
      c.ecoRewardPoints,
      c.totalRecycledKg,
      c.totalOrdersCount,
      c.status,
      c.joinedDate,
    ]);

    const fleetHeaders = [
      'Executive ID', 'Name', 'Phone', 'Vehicle Type', 'Vehicle Number',
      'Rating', 'Total Pickups', 'Availability', 'Pending Jobs', 'Lat', 'Lng',
    ];
    const fleetRows = executives.map((e) => [
      e.id,
      e.name,
      e.phone,
      e.vehicleType,
      e.vehicleNumber,
      e.rating,
      e.totalPickups,
      e.isAvailable ? 'ON FIELD' : 'OFF DUTY',
      e.pendingJobsCount,
      e.currentLat,
      e.currentLng,
    ]);

    const ordersHeaders = [
      'Order Number', 'Customer ID', 'Customer Name', 'Customer Phone', 'Street', 'Area', 'City', 'Pincode',
      'Items Breakdown', 'Total Weight (kg)', 'Estimated Amount (₹)', 'Final Amount (₹)', 'Status',
      'Scheduled Date', 'Time Slot', 'Assigned Executive', 'Vehicle No', 'Payment Method', 'Payment Status',
      'CO2 Saved (kg)', 'Eco Points Earned', 'Customer Rating', 'Review', 'Created At',
    ];
    const ordersRows = orders.map((o) => {
      const itemsBreakdown = o.items
        .map((i) => `${i.name} [${i.actualQty ?? i.estimatedQty} ${i.unit} @ ₹${i.ratePerUnit}]`)
        .join('; ');
      return [
        o.orderNumber,
        o.customerId,
        o.customerName,
        o.customerPhone,
        o.address?.street || '',
        o.address?.area || '',
        o.address?.city || '',
        o.address?.pincode || '',
        itemsBreakdown,
        o.totalWeight ?? o.items.reduce((s, it) => s + (it.actualQty ?? it.estimatedQty), 0),
        o.totalEstimatedAmount,
        o.finalAmount ?? o.totalEstimatedAmount,
        o.status,
        o.scheduledDate,
        o.timeSlot,
        o.assignedExecutiveName || 'Unassigned',
        o.vehicleNo || 'EV Auto',
        o.paymentMethod,
        o.paymentStatus,
        o.co2SavedTotal ?? 0,
        o.ecoPointsEarned ?? 0,
        o.rating ?? '',
        o.reviewText || '',
        o.createdAt,
      ];
    });

    const categoriesHeaders = ['Category ID', 'Name', 'Kannada Name', 'Hindi Name', 'Item Count', 'Color'];
    const categoriesRows = categories.map((cat) => [
      cat.id,
      cat.name,
      cat.nameKn,
      cat.nameHi,
      cat.itemCount,
      cat.color,
    ]);

    const ratesHeaders = [
      'Item ID', 'Category', 'Material Name', 'Current Rate (₹)', 'Previous Rate (₹)',
      'Unit', 'Min Qty', 'Trend', 'CO2 Offset (kg/unit)', 'Description',
    ];
    const ratesRows = items.map((i) => [
      i.id,
      i.category,
      i.name,
      i.rate,
      i.previousRate ?? i.rate,
      i.unit,
      i.minQty,
      i.trend || 'stable',
      i.co2Offset,
      i.description || '',
    ]);

    const businessesHeaders = [
      'Business ID', 'Company Name', 'GSTIN', 'Contact Person', 'Phone', 'Email',
      'Industry Category', 'Facility Area', 'City', 'Tonnage Collected (MT)',
      'CO2 Offset (MT)', 'EPR Certificates', 'Monthly Contract',
    ];
    const businessesRows = businesses.map((b) => [
      b.id,
      b.companyName,
      b.gstin,
      b.contactPerson,
      b.phone,
      b.email,
      b.industryCategory,
      b.facilityAddress?.area || '',
      b.facilityAddress?.city || '',
      b.tonnageCollected,
      b.co2OffsetTonnes,
      b.eprCertificatesCount,
      b.monthlyContractActive ? 'ACTIVE' : 'INACTIVE',
    ]);

    const transactionsHeaders = ['Transaction ID', 'Type', 'Amount (₹)', 'Description', 'Timestamp', 'Status', 'Reference ID'];
    const transactionsRows = transactions.map((tx) => [
      tx.id,
      tx.type,
      tx.amount,
      tx.description,
      tx.timestamp,
      tx.status,
      tx.referenceId,
    ]);

    const vouchersHeaders = ['Voucher ID', 'Title', 'Points Required', 'Discount Value', 'Sponsor Name', 'Category', 'Code'];
    const vouchersRows = vouchers.map((v) => [
      v.id,
      v.title,
      v.pointsRequired,
      v.discountValue,
      v.sponsorName,
      v.category,
      v.code,
    ]);

    const leaderboardHeaders = ['Rank', 'User ID', 'Name', 'Locality', 'City', 'Total Recycled (kg)', 'Eco Points', 'CO2 Saved (kg)', 'Badge Title', 'Cheers'];
    const leaderboardRows = leaderboardUsers.map((u) => [
      u.rank,
      u.id,
      u.name,
      u.locality,
      u.city,
      u.totalKg,
      u.points,
      u.co2SavedKg,
      u.badgeTitle,
      u.cheers,
    ]);

    const drivesHeaders = [
      'Drive ID', 'Title', 'Organizer', 'Locality', 'City', 'Date', 'Time', 'Hub Location',
      'Target Category', 'Participants', 'Max Slots', 'Expected (kg)', 'Bonus Points', 'Status', 'Joined',
    ];
    const drivesRows = cleanupDrives.map((d) => [
      d.id,
      d.title,
      d.organizer,
      d.locality,
      d.city,
      d.date,
      d.time,
      d.locationHub,
      d.targetCategory,
      d.participantsCount,
      d.maxSlots,
      d.expectedKg,
      d.bonusPoints,
      d.status,
      d.joined ? 'YES' : 'NO',
    ]);

    const activityHeaders = [
      'Log ID', 'Timestamp', 'Actor', 'Role', 'Action Type', 'Summary', 'Details',
      'Material ID', 'Quantity', 'Est. Value (₹)',
    ];
    const activityRows = activityLogs.map((log) => [
      log.id,
      log.timestamp,
      log.actorName,
      log.actorRole,
      log.actionType,
      log.summary,
      log.details,
      log.materialId || '',
      log.quantity ?? '',
      log.estimatedValue ?? '',
    ]);

    const formsHeaders = ['Form ID', 'Title', 'Modified Time', 'Forms Link'];
    const formsRows = driveForms.map((f) => [
      f.id,
      f.name,
      f.modifiedTime || '',
      f.webViewLink || `https://docs.google.com/forms/d/${f.id}/edit`,
    ]);

    return [
      { sheetTitle: 'Customers', headers: customersHeaders, rows: customersRows },
      { sheetTitle: 'Fleet_Executives', headers: fleetHeaders, rows: fleetRows },
      { sheetTitle: 'Pickup_Orders', headers: ordersHeaders, rows: ordersRows },
      { sheetTitle: 'Scrap_Categories', headers: categoriesHeaders, rows: categoriesRows },
      { sheetTitle: 'Dynamic_Rates', headers: ratesHeaders, rows: ratesRows },
      { sheetTitle: 'Business_Accounts', headers: businessesHeaders, rows: businessesRows },
      { sheetTitle: 'Wallet_Transactions', headers: transactionsHeaders, rows: transactionsRows },
      { sheetTitle: 'Reward_Vouchers', headers: vouchersHeaders, rows: vouchersRows },
      { sheetTitle: 'Eco_Leaderboard', headers: leaderboardHeaders, rows: leaderboardRows },
      { sheetTitle: 'Community_Drives', headers: drivesHeaders, rows: drivesRows },
      { sheetTitle: 'AI_AR_Activity_Logs', headers: activityHeaders, rows: activityRows },
      { sheetTitle: 'Google_Forms', headers: formsHeaders, rows: formsRows },
    ];
  };

  // Export All PunarChakra Data (11 tabs) to a new Google Spreadsheet & link to PunarChakra-Backups
  const handleExportAllToGoogleSheets = async () => {
    if (!googleUser || !getWorkspaceAccessToken()) {
      setWorkspaceSyncError('Please sign in with Google first (open Google Sheets/Drive Hub tab) to export all platform data.');
      setAdminTab('workspace');
      return;
    }

    setIsGoogleLoading(true);
    setWorkspaceSyncStatus(null);
    setWorkspaceSyncError(null);

    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const sheetTitle = `PunarChakra Master Enterprise Database - ${timestamp}`;
      const masterPayload = buildMasterSheetsPayload();
      const res = await createGoogleSpreadsheet(sheetTitle, masterPayload);

      setLastCreatedSheetUrl(res.spreadsheetUrl);
      setLastBackupResult((prev) =>
        res.folderWebViewLink
          ? {
              fileId: res.spreadsheetId,
              fileName: res.title,
              fileWebViewLink: res.spreadsheetUrl,
              folderId: prev?.folderId || 'PunarChakra-Backups',
              folderName: 'PunarChakra-Backups',
              folderWebViewLink: res.folderWebViewLink,
            }
          : null
      );
      setWorkspaceSyncStatus(
        `Master Google Spreadsheet created with all 12 tabs (${masterPayload.reduce(
          (sum, tab) => sum + tab.rows.length,
          0
        )} total records synced to Sheets & PunarChakra-Backups)!`
      );
      fetchDriveSpreadsheets();
    } catch (err: any) {
      console.error(err);
      setWorkspaceSyncError(err.message || 'Failed to create Google Spreadsheet.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Update an existing Google Spreadsheet with all 11 tabs after explicit user confirmation
  const handleConfirmUpdateExistingSheet = async () => {
    if (!pendingSheetUpdateTarget) return;
    const target = pendingSheetUpdateTarget;
    setPendingSheetUpdateTarget(null);
    setIsGoogleLoading(true);
    setWorkspaceSyncStatus(null);
    setWorkspaceSyncError(null);

    try {
      const masterPayload = buildMasterSheetsPayload();
      const res = await syncAllSheetsToExistingSpreadsheet(target.id, masterPayload, () => true);
      setLastCreatedSheetUrl(res.spreadsheetUrl);
      setWorkspaceSyncStatus(
        `Updated "${target.name}" in Google Sheets with all 12 live tabs (${masterPayload.reduce(
          (sum, tab) => sum + tab.rows.length,
          0
        )} records).`
      );
      fetchDriveSpreadsheets();
    } catch (err: any) {
      console.error(err);
      setWorkspaceSyncError(err.message || 'Failed to update existing Google Spreadsheet.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Admin Export: Complete Multi-Section CSV Backup directly into 'PunarChakra-Backups' in Google Drive
  const handleAdminExportDriveBackup = async () => {
    if (!googleUser || !getWorkspaceAccessToken()) {
      setWorkspaceSyncError('Please sign in with Google first (Google Sheets/Drive Hub tab) to upload full backups to Google Drive.');
      setAdminTab('workspace');
      return;
    }

    setIsGoogleLoading(true);
    setWorkspaceSyncStatus(null);
    setWorkspaceSyncError(null);

    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      const fileName = `PunarChakra_Complete_Backup_${dateStr}_${timeStr}.csv`;

      const masterTabs = buildMasterSheetsPayload();
      const lines: string[] = [];
      lines.push('========================================================================');
      lines.push('PUNARCHAKRA COMPLETE ENTERPRISE SYSTEM BACKUP (ALL 12 DATASETS)');
      lines.push(`Generated On: ${now.toLocaleString()}`);
      lines.push(`Exported By: Super Admin (${googleUser.email || 'admin'})`);
      lines.push('Shared Directory: Google Drive / PunarChakra-Backups');
      lines.push('========================================================================');

      masterTabs.forEach((tab) => {
        lines.push('');
        lines.push(`--- ${tab.sheetTitle.toUpperCase()} (${tab.rows.length} RECORDS) ---`);
        lines.push(tab.headers.map((h) => csvCell(h)).join(','));
        tab.rows.forEach((row) => {
          lines.push(row.map((cell) => csvCell(cell)).join(','));
        });
      });

      const csvContent = lines.join('\n');
      const result = await uploadBackupCsvToDrive(fileName, csvContent);
      setLastBackupResult(result);
      setWorkspaceSyncStatus(
        `Complete CSV Backup uploaded! All 12 datasets saved to "${result.folderName}/${fileName}" in Google Drive.`
      );
      fetchDriveSpreadsheets();
    } catch (err: any) {
      console.error('Backup error:', err);
      setWorkspaceSyncError(err.message || 'Failed to upload backup to Google Drive.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Full JSON Database Snapshot uploaded inside 'PunarChakra-Backups' in Google Drive
  const handleCreateDriveJsonSnapshot = async () => {
    if (!googleUser || !getWorkspaceAccessToken()) {
      setWorkspaceSyncError('Please sign in with Google first to upload JSON snapshots to Google Drive.');
      return;
    }

    setIsGoogleLoading(true);
    setWorkspaceSyncStatus(null);
    setWorkspaceSyncError(null);

    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      const fileName = `PunarChakra_Full_Snapshot_${dateStr}_${timeStr}.json`;

      const snapshotPayload = {
        exportedAt: now.toISOString(),
        exportedBy: googleUser.email || googleUser.displayName || 'Super Admin',
        summaryCounts: {
          customers: customers.length,
          executives: executives.length,
          orders: orders.length,
          categories: categories.length,
          scrapItems: items.length,
          businesses: businesses.length,
          transactions: transactions.length,
          vouchers: vouchers.length,
          leaderboardUsers: leaderboardUsers.length,
          cleanupDrives: cleanupDrives.length,
          activityLogs: activityLogs.length,
          googleForms: driveForms.length,
        },
        customers,
        executives,
        orders,
        categories,
        items,
        businesses,
        transactions,
        vouchers,
        leaderboardUsers,
        cleanupDrives,
        activityLogs,
        googleForms: driveForms,
      };

      const result = await uploadJsonBackupToDrive(
        fileName,
        JSON.stringify(snapshotPayload, null, 2)
      );
      setLastBackupResult(result);
      setWorkspaceSyncStatus(
        `Full JSON database snapshot "${fileName}" archived inside Google Drive / ${result.folderName}!`
      );
      fetchDriveSpreadsheets();
    } catch (err: any) {
      console.error('JSON snapshot error:', err);
      setWorkspaceSyncError(err.message || 'Failed to archive JSON snapshot to Google Drive.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Execute confirmed Drive file deletion
  const handleConfirmDeleteDriveFile = async () => {
    if (!pendingDeleteFile) return;
    const target = pendingDeleteFile;
    setPendingDeleteFile(null);
    setIsGoogleLoading(true);
    setWorkspaceSyncError(null);
    try {
      await deleteFileFromDrive(target.id, target.name, () => true);
      setWorkspaceSyncStatus(`Removed "${target.name}" from Google Drive.`);
      fetchDriveSpreadsheets();
    } catch (err: any) {
      setWorkspaceSyncError(err.message || 'Failed to delete file from Google Drive.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Export CSV Locally
  const handleExportLocalCSV = () => {
    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Phone',
      'Address',
      'Scheduled Date',
      'Time Slot',
      'Status',
      'Payment Method',
      'Assigned Executive',
      'Vehicle No',
      'Total Amount (INR)',
      'CO2 Offset (kg)',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.address.area}, ${o.address.city}"`,
      `"${o.scheduledDate}"`,
      `"${o.timeSlot}"`,
      `"${o.status}"`,
      `"${o.paymentMethod}"`,
      `"${o.assignedExecutiveName || 'Unassigned'}"`,
      `"${o.vehicleNo || 'EV Auto'}"`,
      o.finalAmount || o.totalEstimatedAmount,
      o.co2SavedTotal || 35,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PunarChakra_Operations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit New Customer
  const handleSubmitNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCust: CustomerAccount = {
      id: `usr_${Date.now().toString().slice(-4)}`,
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      area: newCustArea,
      city: newCustCity,
      walletBalance: Number(newCustWallet) || 0,
      ecoRewardPoints: 100,
      totalRecycledKg: 0,
      totalOrdersCount: 0,
      status: 'active',
      joinedDate: new Date().toISOString().slice(0, 10),
      address: {
        id: `addr_${Date.now()}`,
        title: 'Primary Residence',
        street: newCustStreet || '#12, Green Avenue',
        area: newCustArea,
        city: newCustCity,
        pincode: '560001',
        lat: 12.9716,
        lng: 77.5946,
        isDefault: true,
      },
    };

    onCreateCustomer(newCust);
    setAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustStreet('');
    alert(`Customer "${newCust.name}" registered successfully.`);
  };

  // Submit New Executive
  const handleSubmitNewExecutive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExecName || !newExecVehicleNo) return;

    const newExec: Executive = {
      id: `exec_${Date.now().toString().slice(-4)}`,
      name: newExecName,
      phone: newExecPhone || '+91 98450 11223',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      vehicleType: newExecVehicleType,
      vehicleNumber: newExecVehicleNo,
      rating: 5.0,
      totalPickups: 0,
      currentLat: 12.9716,
      currentLng: 77.6412,
      isAvailable: true,
      pendingJobsCount: 0,
    };

    onCreateExecutive(newExec);
    setAddExecutiveModalOpen(false);
    setNewExecName('');
    setNewExecPhone('');
    setNewExecVehicleNo('');
    alert(`Executive "${newExec.name}" (${newExec.vehicleNumber}) added to fleet!`);
  };

  // Submit Create Order on Behalf
  const handleCreateOrderOnBehalf = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCust = customers.find((c) => c.id === orderCustId) || customers[0];
    const targetItem = items.find((i) => i.id === orderItemId) || items[0];
    const targetExec = executives.find((e) => e.id === orderExecId) || executives[0];

    const estimatedAmount = (targetItem.rate || 20) * Number(orderQuantity);
    const orderNumber = `PC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: PickupOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerId: targetCust.id,
      customerName: targetCust.name,
      customerPhone: targetCust.phone,
      address: targetCust.address,
      items: [
        {
          scrapItemId: targetItem.id,
          name: targetItem.name,
          estimatedQty: Number(orderQuantity),
          ratePerUnit: targetItem.rate,
          estimatedAmount,
          unit: targetItem.unit,
        },
      ],
      totalEstimatedAmount: estimatedAmount,
      status: 'assigned',
      scheduledDate: orderDate,
      timeSlot: orderSlot,
      assignedExecutiveId: targetExec.id,
      assignedExecutiveName: targetExec.name,
      assignedExecutivePhone: targetExec.phone,
      vehicleNo: targetExec.vehicleNumber,
      createdAt: new Date().toISOString(),
      paymentMethod: 'UPI',
      paymentStatus: 'Pending',
      co2SavedTotal: Math.round(Number(orderQuantity) * targetItem.co2Offset),
    };

    onCreateCustomerOrder(newOrder);
    setCreateOrderModalOpen(false);
    alert(`Order ${orderNumber} scheduled on behalf of ${targetCust.name} and assigned to ${targetExec.name}!`);
  };

  // CSV Parsing for Bulk Customer Upload
  const handleParseCustomerCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvRawFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV file is empty or missing data rows.');
        return;
      }

      const parsed: CustomerAccount[] = [];
      // skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[0]) {
          parsed.push({
            id: `usr_csv_${Date.now()}_${i}`,
            name: parts[0],
            phone: parts[1] || '+91 98860 00000',
            email: parts[2] || `${parts[0].toLowerCase().replace(/\s+/g, '')}@example.com`,
            area: parts[3] || 'Bengaluru Central',
            city: parts[4] || 'Bengaluru',
            walletBalance: Number(parts[5]) || 200,
            ecoRewardPoints: 150,
            totalRecycledKg: Number(parts[6]) || 10,
            totalOrdersCount: 1,
            status: 'active',
            joinedDate: new Date().toISOString().slice(0, 10),
            address: {
              id: `addr_csv_${i}`,
              title: 'Primary',
              street: parts[3] || 'Central St',
              area: parts[3] || 'Bengaluru Central',
              city: parts[4] || 'Bengaluru',
              pincode: '560001',
              lat: 12.9716,
              lng: 77.5946,
              isDefault: true,
            },
          });
        }
      }

      setCsvUploadPreview(parsed);
    };
    reader.readAsText(file);
  };

  // CSV Parsing for Bulk Fleet Upload
  const handleParseFleetCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvRawFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const parsed: Executive[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[0]) {
          parsed.push({
            id: `exec_csv_${Date.now()}_${i}`,
            name: parts[0],
            phone: parts[1] || '+91 97312 00000',
            photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
            vehicleType: (parts[2] as Executive['vehicleType']) || 'Electric Auto',
            vehicleNumber: parts[3] || `KA-0${i}-EV-${1000 + i}`,
            rating: Number(parts[4]) || 4.9,
            totalPickups: Number(parts[5]) || 50,
            currentLat: 12.9716,
            currentLng: 77.6412,
            isAvailable: true,
            pendingJobsCount: 0,
          });
        }
      }

      setCsvUploadPreview(parsed);
    };
    reader.readAsText(file);
  };

  // Download Sample Customer CSV
  const handleDownloadSampleCustomerCSV = () => {
    const sample = 'Name,Phone,Email,Area,City,WalletBalance,RecycledKg\nVikram Malhotra,+91 98450 11992,vikram@malhotra.com,Koramangala,Bengaluru,450,32\nMeera Nambiar,+91 91234 44556,meera@nambiar.in,Indiranagar,Bengaluru,800,55\n';
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(sample);
    link.download = 'sample_customers_upload.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample Fleet CSV
  const handleDownloadSampleFleetCSV = () => {
    const sample = 'Name,Phone,VehicleType,VehicleNumber,Rating,TotalPickups\nShivanna Gowda,+91 98440 33441,Electric Auto,KA-02-EV-9821,4.9,120\nDeepak Sahu,+91 91089 77881,Mini PickUp Van,KA-04-MC-3341,4.8,240\n';
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(sample);
    link.download = 'sample_fleet_upload.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Confirm delete customer
  const handleConfirmDeleteCustomer = (custId: string) => {
    onDeleteCustomer(custId);
    setDeleteCustomerConfirmId(null);
    alert('Customer record deleted.');
  };

  // Confirm delete executive
  const handleConfirmDeleteExecutive = (execId: string) => {
    onDeleteExecutive(execId);
    setDeleteExecutiveConfirmId(null);
    alert('Executive removed from fleet roster.');
  };

  // Filtered Lists
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.area.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredExecutives = executives.filter(
    (e) =>
      e.name.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      e.vehicleNumber.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      e.phone.includes(fleetSearch)
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

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
            Active: Super Admin Operations Console
          </span>
          <button
            onClick={onClose || onBack}
            className="p-1.5 px-2.5 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all flex items-center gap-1.5 text-xs font-extrabold"
            title="Exit Admin Console"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-indigo-900/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] uppercase font-black tracking-wider border border-violet-500/30">
              Operations Master Authority
            </span>
            <span className="text-xs text-indigo-300 font-semibold">
              Super Admin Console & Fleet Command
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display mt-1 text-white">
            Administrative Operations & Integration Command
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Full authority to create, edit, delete, and bulk upload customer rosters and pickup executive fleet records, with live 2-way Google Drive & Sheets synchronization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAdminExportDriveBackup}
            disabled={isGoogleLoading}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 border border-violet-400/40"
            title="Admin Export: Trigger manual backup of users & orders directly to 'PunarChakra-Backups' in Google Drive"
          >
            <HardDrive className="w-4 h-4 text-violet-200" />
            <span>{isGoogleLoading ? 'Exporting Backup...' : 'Admin Export (Drive Backup)'}</span>
          </button>

          <button
            onClick={() => setCreateOrderModalOpen(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 border border-emerald-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Order</span>
          </button>

          <button
            onClick={handleExportAllToGoogleSheets}
            disabled={isGoogleLoading}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 border border-indigo-400/30"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Sync Sheets</span>
          </button>

          <button
            onClick={handleExportLocalCSV}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-700"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner with Folder & File Links */}
      {workspaceSyncStatus && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{workspaceSyncStatus}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {lastBackupResult?.folderWebViewLink && (
              <a
                href={lastBackupResult.folderWebViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] shrink-0 shadow-xs"
              >
                <HardDrive className="w-3 h-3 text-violet-200" />
                <span>Open 'PunarChakra-Backups' Folder</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}

            {lastBackupResult?.fileWebViewLink &&
              lastBackupResult.fileWebViewLink !== lastCreatedSheetUrl && (
                <a
                  href={lastBackupResult.fileWebViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold rounded-lg flex items-center gap-1 text-[11px] shrink-0 border border-emerald-500/30"
                >
                  <span>View Backup in Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

            {lastCreatedSheetUrl && (
              <a
                href={lastCreatedSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] shrink-0"
              >
                <span>Open in Google Sheets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {workspaceSyncError && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{workspaceSyncError}</span>
        </div>
      )}

      {/* Main Admin Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <button
          onClick={() => setAdminTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setAdminTab('catalog')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'catalog'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Scrap Catalog & Rates</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-mono">
            {items.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('rewards')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'rewards'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Wallet & Rewards</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono">
            {vouchers.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('leaderboard')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'leaderboard'
              ? 'bg-yellow-600 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Eco Champions</span>
          <span className="px-1.5 py-0.2 rounded-md bg-yellow-100 text-yellow-900 text-[10px] font-mono">
            {leaderboardUsers.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('drives')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'drives'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Community Drives</span>
          <span className="px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-900 text-[10px] font-mono">
            {cleanupDrives.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('customers')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'customers'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customers</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-mono">
            {customers.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('fleet')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'fleet'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fleet</span>
          <span className="px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-900 text-[10px] font-mono">
            {executives.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Orders</span>
          <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-900 text-[10px] font-mono">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('businesses')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'businesses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>B2B Corporate</span>
          <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-900 text-[10px] font-mono">
            {businesses.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('workspace')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'workspace'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Workspace (Sheets · Drive · Forms)</span>
          {googleUser && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & SCRAP RATE ENGINE
          ========================================================================= */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{t.totalScrapCollected}</span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Leaf className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">6,390 kg</div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                ↑ 18% increase this month
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{t.totalPayoutDisbursed}</span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                ₹{totalPayout + 84500}
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                Direct UPI & Wallet payouts
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{t.co2SavedGlobal}</span>
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                {(totalCo2Saved + 12800).toFixed(0)} kg CO₂
              </div>
              <p className="text-[11px] text-teal-700 font-semibold mt-1">
                Equivalent to 1,240 Trees
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{t.activePickupRequests}</span>
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                {executives.length} Active Fleet
              </div>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                100% Electric Vehicles
              </p>
            </div>
          </div>

          {/* Platform Visual Hub & Monthly Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Multi-Series Platform Growth & CO2 Offset Chart */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Monthly Scrap Tonnage & CO₂ Offset Trajectory</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    City-wide collection growth vs national urban recovery baseline
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
                  +24% MoM Growth
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[
                      { month: 'Jun', collectedKg: 4200, co2Kg: 8100, nationalAvgKg: 3100 },
                      { month: 'Jul', collectedKg: 4650, co2Kg: 8950, nationalAvgKg: 3250 },
                      { month: 'Aug', collectedKg: 5120, co2Kg: 9800, nationalAvgKg: 3300 },
                      { month: 'Sep', collectedKg: 5480, co2Kg: 10540, nationalAvgKg: 3400 },
                      { month: 'Oct', collectedKg: 5940, co2Kg: 11620, nationalAvgKg: 3500 },
                      {
                        month: 'Nov',
                        collectedKg: 6390 + orders.reduce((s, o) => s + (o.totalWeight || 10), 0),
                        co2Kg: Math.round(totalCo2Saved + 12800),
                        nationalAvgKg: 3600,
                      },
                    ]}
                    margin={{ top: 10, right: 12, left: -8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="adminCo2Area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="co2Kg" name="CO₂ Offset (kg)" stroke="#059669" strokeWidth={2.5} fill="url(#adminCo2Area)" />
                    <Bar dataKey="collectedKg" name="Scrap Collected (kg)" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={24} />
                    <Line type="monotone" dataKey="nationalAvgKg" name="Urban Baseline (kg)" stroke="#d97706" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Dispatch Breakdown & Operations Visuals */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Live Order Fulfillment & Hub Snapshot</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time breakdown across {orders.length} active platform orders
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: Math.max(1, orders.filter((o) => o.status === 'completed').length), color: '#059669' },
                          { name: 'En Route', value: Math.max(1, orders.filter((o) => o.status === 'en_route').length), color: '#0284c7' },
                          { name: 'Assigned', value: Math.max(1, orders.filter((o) => o.status === 'assigned').length), color: '#d97706' },
                          { name: 'Scheduled', value: Math.max(1, orders.filter((o) => o.status === 'scheduled').length), color: '#7c3aed' },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={56}
                        paddingAngle={3}
                      >
                        {['#059669', '#0284c7', '#d97706', '#7c3aed'].map((col, idx) => (
                          <Cell key={idx} fill={col} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-xs tabular-nums">
                  {[
                    { label: 'Completed', count: orders.filter((o) => o.status === 'completed').length, color: '#059669' },
                    { label: 'En Route', count: orders.filter((o) => o.status === 'en_route').length, color: '#0284c7' },
                    { label: 'Assigned', count: orders.filter((o) => o.status === 'assigned').length, color: '#d97706' },
                    { label: 'Scheduled', count: orders.filter((o) => o.status === 'scheduled').length, color: '#7c3aed' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: row.color }} />
                        <span>{row.label}</span>
                      </span>
                      <span className="font-black text-slate-900">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="relative h-20 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={businessCircularFacilityImg}
                    alt="Circular Material Recovery Hub"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-bold text-white">MRF Hubs Active</span>
                  </div>
                </div>
                <div className="relative h-20 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={fleetEvOperationsImg}
                    alt="EV Fleet Dispatch"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-bold text-white">{executives.length} EV Vehicles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts & Rate Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Recyclables Volume */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Recycling Volume by Category (kg)</span>
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CATEGORY_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="volumeKg" fill="#059669" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dynamic Rate Manager */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>{t.updateRates}</span>
                </h3>
                <span className="text-xs text-slate-400">Live Dynamic Price Engine</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] text-slate-400 block">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempRate}
                            onChange={(e) => setTempRate(Number(e.target.value))}
                            className="w-20 p-1 bg-white border border-emerald-500 rounded-lg text-center font-bold"
                          />
                          <button
                            onClick={() => handleSaveRate(item.id)}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 font-display text-sm">
                            ₹{item.rate}/{item.unit}
                          </span>
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setTempRate(item.rate);
                            }}
                            className="p-1.5 bg-slate-200 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg transition-all"
                            title="Edit dynamic price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 30-Day Scrap Price Trend Visualizer */}
          <div className="pt-2">
            <ScrapPriceTrendChart items={items} categories={categories} />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: SCRAP CATALOG & RATES
          ========================================================================= */}
      {adminTab === 'catalog' && (
        <AdminCatalogTab
          items={items}
          categories={categories}
          language={language}
          onUpdateScrapRate={onUpdateScrapRate}
          onCreateScrapItem={onCreateScrapItem}
          onUpdateScrapItem={onUpdateScrapItem}
          onDeleteScrapItem={onDeleteScrapItem}
          onCreateCategory={onCreateCategory}
          onDeleteCategory={onDeleteCategory}
        />
      )}

      {/* =========================================================================
          TAB: WALLET & REWARDS CONTROL
          ========================================================================= */}
      {adminTab === 'rewards' && (
        <AdminWalletRewardsTab
          vouchers={vouchers}
          transactions={transactions}
          customers={customers}
          language={language}
          onCreateVoucher={onCreateVoucher}
          onUpdateVoucher={onUpdateVoucher}
          onDeleteVoucher={onDeleteVoucher}
          onAddTransaction={onAddTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onAdjustCustomerBalance={onAdjustCustomerBalance}
        />
      )}

      {/* =========================================================================
          TAB: ECO LEADERBOARD CONTROL
          ========================================================================= */}
      {adminTab === 'leaderboard' && (
        <AdminLeaderboardTab
          leaderboardUsers={leaderboardUsers}
          language={language}
          onCreateLeaderboardUser={onCreateLeaderboardUser}
          onUpdateLeaderboardUser={onUpdateLeaderboardUser}
          onDeleteLeaderboardUser={onDeleteLeaderboardUser}
        />
      )}

      {/* =========================================================================
          TAB: COMMUNITY DRIVES CONTROL
          ========================================================================= */}
      {adminTab === 'drives' && (
        <AdminDrivesTab
          cleanupDrives={cleanupDrives}
          language={language}
          onCreateCleanupDrive={onCreateCleanupDrive}
          onUpdateCleanupDrive={onUpdateCleanupDrive}
          onDeleteCleanupDrive={onDeleteCleanupDrive}
        />
      )}

      {/* =========================================================================
          TAB: B2B CORPORATE PARTNERS
          ========================================================================= */}
      {adminTab === 'businesses' && (
        <AdminBusinessTab
          businesses={businesses}
          language={language}
          onCreateBusiness={onCreateBusiness}
          onUpdateBusiness={onUpdateBusiness}
          onDeleteBusiness={onDeleteBusiness}
        />
      )}

      {/* =========================================================================
          TAB 2: CUSTOMER DASHBOARD MANAGEMENT (Create, Delete, Upload Details)
          ========================================================================= */}
      {adminTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Customer Directory & Profile Access</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin master accessibility to create new customer accounts, update profiles, delete records, and batch upload CSVs.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setAddCustomerModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Customer</span>
              </button>

              <button
                onClick={() => setUploadCustomersModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Upload CSV</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers by name, phone, or area..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Area</th>
                    <th className="p-3.5">Wallet Balance</th>
                    <th className="p-3.5">Eco Points</th>
                    <th className="p-3.5">Recycled</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block">{cust.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">ID: {cust.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-800 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{cust.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{cust.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {cust.area}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-700">
                        ₹{cust.walletBalance}
                      </td>
                      <td className="p-3.5 font-bold text-amber-700">
                        {cust.ecoRewardPoints} pts
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {cust.totalRecycledKg} kg
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            cust.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setEditCustomerModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCustomerConfirmId(cust.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No customer profiles matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PICKUP EXECUTIVE FLEET MANAGEMENT (Create, Delete, Upload Details)
          ========================================================================= */}
      {adminTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <span>Pickup Executive Fleet Management</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin master control over EV field executives, vehicle assignments, duty rosters, and batch roster uploads.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setAddExecutiveModalOpen(true)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Executive</span>
              </button>

              <button
                onClick={() => setUploadFleetModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all"
              >
                <Upload className="w-4 h-4 text-sky-600" />
                <span>Upload Fleet CSV</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search executives by driver name, vehicle number, or phone..."
              value={fleetSearch}
              onChange={(e) => setFleetSearch(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Fleet Roster Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Executive</th>
                    <th className="p-3.5">Vehicle Number</th>
                    <th className="p-3.5">Vehicle Type</th>
                    <th className="p-3.5">Rating</th>
                    <th className="p-3.5">Pickups Done</th>
                    <th className="p-3.5">Active Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExecutives.map((exec) => (
                    <tr key={exec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-emerald-500 shrink-0">
                            <img src={exec.photoUrl} alt={exec.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block">{exec.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{exec.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-mono font-bold text-slate-800 text-[11px]">
                          {exec.vehicleNumber}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{exec.vehicleType}</td>
                      <td className="p-3.5 font-bold text-amber-600">{exec.rating}★</td>
                      <td className="p-3.5 font-bold text-slate-900">{exec.totalPickups} jobs</td>
                      <td className="p-3.5">
                        <button
                          onClick={() =>
                            onUpdateExecutive(exec.id, { isAvailable: !exec.isAvailable })
                          }
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] transition-all ${
                            exec.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title="Click to toggle duty status"
                        >
                          {exec.isAvailable ? 'ON FIELD (AVAILABLE)' : 'OFF DUTY'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedExecutive(exec);
                              setEditExecutiveModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all"
                            title="Edit Executive"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteExecutiveConfirmId(exec.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Executive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExecutives.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No field executives matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ALL ORDERS & DISPATCH MANAGEMENT
          ========================================================================= */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Pickup Orders & Fleet Dispatch Master</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Create orders on customer behalf, reassign field drivers, inspect real-time pickup statuses, or cancel jobs.
              </p>
            </div>

            <button
              onClick={() => setCreateOrderModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Pickup</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders by order number, customer name, or status..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Scheduled Slot</th>
                    <th className="p-3.5">Assigned Driver</th>
                    <th className="p-3.5">Materials / Qty</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 font-mono">
                        {ord.orderNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-400">{ord.address.area}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 block">{ord.scheduledDate}</span>
                        <span className="text-[10px] text-slate-500">{ord.timeSlot}</span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={ord.assignedExecutiveId || ''}
                          onChange={(e) => {
                            const newExec = executives.find((ex) => ex.id === e.target.value);
                            onUpdateOrder(ord.id, {
                              assignedExecutiveId: newExec?.id,
                              assignedExecutiveName: newExec?.name,
                              vehicleNo: newExec?.vehicleNumber,
                              status: 'assigned',
                            });
                          }}
                          className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- Unassigned --</option>
                          {executives.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.name} ({ex.vehicleNumber})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5">
                        {ord.items.map((i, idx) => (
                          <span key={idx} className="block text-[11px] text-slate-700">
                            {i.name}: {i.actualQty || i.estimatedQty} {i.unit}
                          </span>
                        ))}
                      </td>
                      <td className="p-3.5 font-black text-slate-900">
                        ₹{ord.finalAmount || ord.totalEstimatedAmount}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            onUpdateOrder(ord.id, {
                              status: e.target.value as PickupOrder['status'],
                            })
                          }
                          className="p-1.5 bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-bold"
                        >
                          <option value="requested">requested</option>
                          <option value="assigned">assigned</option>
                          <option value="en_route">en_route</option>
                          <option value="arrived">arrived</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onDeleteOrder(ord.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No orders matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: GOOGLE DRIVE & GOOGLE SHEETS WORKSPACE HUB
          ========================================================================= */}
      {adminTab === 'workspace' && (
        <div className="space-y-6">
          {/* Workspace Integration Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-display">
                    Google Drive, Sheets &amp; Forms Integration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sync customer directories, fleet rosters, pickup orders, and citizen survey forms across Google Workspace &amp; Cloud Firestore.
                  </p>
                </div>
              </div>

              {/* Google Auth Status / Button */}
              {googleUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {googleUser.displayName || 'Google User'}
                    </span>
                    <span className="text-[10px] text-slate-500">{googleUser.email}</span>
                  </div>
                  <button
                    onClick={handleGoogleSignOut}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2.5 shadow-xs hover:shadow-sm transition-all"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>

            {/* Data Capture Coverage Matrix */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Full Data Capture Coverage (12 Sheets &amp; Drive Backup Sections)
                </span>
                <span className="text-[11px] font-bold text-emerald-700">
                  Every module synced on export
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px]">
                {[
                  { label: 'Customers', count: customers.length },
                  { label: 'Fleet Drivers', count: executives.length },
                  { label: 'Pickup Orders', count: orders.length },
                  { label: 'Categories', count: categories.length },
                  { label: 'Scrap Rates', count: items.length },
                  { label: 'B2B Accounts', count: businesses.length },
                  { label: 'Transactions', count: transactions.length },
                  { label: 'Vouchers', count: vouchers.length },
                  { label: 'Leaderboard', count: leaderboardUsers.length },
                  { label: 'Drives', count: cleanupDrives.length },
                  { label: 'AI/AR Logs', count: activityLogs.length },
                  { label: 'Google Forms', count: driveForms.length },
                ].map((entry) => (
                  <div
                    key={entry.label}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between"
                  >
                    <span className="text-slate-600 font-medium truncate">{entry.label}</span>
                    <span className="font-black text-slate-900 tabular-nums ml-1">
                      {entry.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Master Google Sheet</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Creates a 12-tab Google Spreadsheet with Customers, Fleet, Orders, Categories, Rates, B2B, Transactions, Vouchers, Leaderboard, Drives, AI/AR Logs, and Google Forms.
                  </p>
                </div>
                <button
                  onClick={handleExportAllToGoogleSheets}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Generate 12-Tab Sheet</span>
                </button>
              </div>

              <div className="p-4 bg-violet-50/70 border border-violet-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-violet-800 font-bold text-xs uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-violet-600" />
                    <span>Drive Complete CSV</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Writes all 12 platform sections into a single multi-section CSV file inside Drive / PunarChakra-Backups.
                  </p>
                </div>
                <button
                  onClick={handleAdminExportDriveBackup}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Export Full CSV to Drive</span>
                </button>
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider">
                    <HardDrive className="w-4 h-4 text-indigo-600" />
                    <span>Drive JSON Snapshot</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Archives a full JSON database snapshot (all entities + AI/AR telemetry logs) into Drive / PunarChakra-Backups.
                  </p>
                </div>
                <button
                  onClick={handleCreateDriveJsonSnapshot}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Create JSON Snapshot</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                    <span>Sync &amp; Inspect Drive</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Refresh spreadsheets and backup archives stored in Google Drive and PunarChakra-Backups.
                  </p>
                </div>
                <button
                  onClick={fetchDriveSpreadsheets}
                  disabled={loadingDriveFiles || !googleUser}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingDriveFiles ? 'animate-spin' : ''}`} />
                  <span>Refresh Drive Files</span>
                </button>
              </div>
            </div>

            {/* List of User's Spreadsheets in Drive */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Spreadsheets in Google Drive</span>
                </h4>
                {loadingDriveFiles && (
                  <span className="text-xs text-slate-400">Loading from Drive API...</span>
                )}
              </div>

              {driveSpreadsheets.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {driveSpreadsheets.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block">{file.name}</span>
                          <span className="text-[10px] text-slate-400">
                            Modified: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPendingSheetUpdateTarget(file)}
                          disabled={isGoogleLoading}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Sync all 11 tabs into this existing spreadsheet"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Update Sheet</span>
                        </button>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-bold text-[11px]"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setPendingDeleteFile(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {googleUser
                    ? 'No spreadsheets found in Drive or click "Refresh Drive Files" above.'
                    : 'Connect your Google account above to browse Google Sheets & Drive.'}
                </div>
              )}
            </div>

            {/* Backup Files stored in PunarChakra-Backups Folder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-violet-600" />
                  <span>Files in &lsquo;PunarChakra-Backups&rsquo; Folder (Drive)</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                  {driveBackupFiles.length} archived file(s)
                </span>
              </div>

              {driveBackupFiles.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {driveBackupFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-violet-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {file.mimeType.includes('spreadsheet')
                              ? 'Google Sheet'
                              : file.mimeType.includes('json')
                              ? 'JSON Snapshot'
                              : 'CSV Backup'}{' '}
                            · Modified:{' '}
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-violet-700 hover:bg-violet-50 rounded-lg flex items-center gap-1 font-bold text-[11px]"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setPendingDeleteFile(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete backup from Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {googleUser
                    ? 'No backup files archived in PunarChakra-Backups yet. Use "Export Full CSV to Drive" or "Create JSON Snapshot" above.'
                    : 'Sign in with Google to inspect archived CSV & JSON backups in PunarChakra-Backups.'}
                </div>
              )}
            </div>

            {/* =================================================================
                GOOGLE FORMS STUDIO & RESPONSE COLLECTOR
                ================================================================= */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Google Forms Studio &amp; Response Collector
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Create structured pickup feedback surveys, cleanup volunteer signups, and B2B intake forms directly in Google Forms.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                  {driveForms.length} Form(s) in Drive
                </span>
              </div>

              <form
                onSubmit={handleCreateGoogleForm}
                className="grid grid-cols-1 md:grid-cols-12 gap-2.5 p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl"
              >
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-purple-900 mb-1">
                    Survey / Intake Template
                  </label>
                  <select
                    value={formTemplate}
                    onChange={(e) => {
                      const val = e.target.value as GoogleFormTemplateType;
                      setFormTemplate(val);
                      if (val === 'pickup_feedback') setFormTitleInput('PunarChakra Citizen Pickup Feedback');
                      if (val === 'cleanup_volunteer') setFormTitleInput('PunarChakra Community Cleanup Volunteer Signup');
                      if (val === 'b2b_bulk_intake') setFormTitleInput('PunarChakra B2B Bulk EPR Scrap Intake');
                      if (val === 'custom') setFormTitleInput('PunarChakra Custom Recycling Form');
                    }}
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="pickup_feedback">Citizen Pickup Feedback Survey</option>
                    <option value="cleanup_volunteer">Cleanup Drive Volunteer Signup</option>
                    <option value="b2b_bulk_intake">B2B Bulk Scrap Intake</option>
                    <option value="custom">Custom Recycling Survey</option>
                  </select>
                </div>

                <div className="md:col-span-5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-purple-900 mb-1">
                    Google Form Title
                  </label>
                  <input
                    type="text"
                    value={formTitleInput}
                    onChange={(e) => setFormTitleInput(e.target.value)}
                    placeholder="Enter Google Form title..."
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="md:col-span-3 flex items-end">
                  <button
                    type="submit"
                    disabled={isGoogleLoading || !googleUser}
                    className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-300 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isGoogleLoading ? 'Creating...' : 'Create Google Form'}</span>
                  </button>
                </div>
              </form>

              {driveForms.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {driveForms.map((formFile) => (
                    <div
                      key={formFile.id}
                      className="p-3.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ClipboardList className="w-4 h-4 text-purple-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{formFile.name}</span>
                          <span className="text-[10px] text-slate-400">
                            Form ID: {formFile.id} · Modified:{' '}
                            {formFile.modifiedTime ? new Date(formFile.modifiedTime).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInspectGoogleForm(formFile.id)}
                          disabled={loadingFormDetails}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect &amp; Responses</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setPendingFormEditTarget({
                              id: formFile.id,
                              title: formFile.name,
                              description: 'Updated via PunarChakra Admin Workspace',
                            })
                          }
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {formFile.webViewLink && (
                          <a
                            href={formFile.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg flex items-center gap-1 font-bold text-[11px]"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setPendingDeleteFile(formFile)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Google Form"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {googleUser
                    ? 'No Google Forms found yet. Choose a template above and click "Create Google Form".'
                    : 'Sign in with Google above to create Google Forms and view live citizen responses.'}
                </div>
              )}

              {/* Inspected Google Form Details & Live Responses */}
              {selectedFormSummary && (
                <div className="p-5 bg-slate-50 border border-purple-200 rounded-2xl space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                        Active Google Form Schema &amp; Live Responses
                      </span>
                      <h5 className="text-sm font-black text-slate-900 mt-0.5">
                        {selectedFormSummary.title}
                      </h5>
                      {selectedFormSummary.description && (
                        <p className="text-xs text-slate-600 mt-1">{selectedFormSummary.description}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedFormSummary.responderUri && (
                        <a
                          href={selectedFormSummary.responderUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1"
                        >
                          <span>Fill Live Form</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleInspectGoogleForm(selectedFormSummary.formId)}
                        disabled={loadingFormDetails}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingFormDetails ? 'animate-spin' : ''}`} />
                        <span>Refresh Responses</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                        Questions ({selectedFormSummary.questions.length})
                      </span>
                      <div className="space-y-1.5">
                        {selectedFormSummary.questions.map((q, idx) => (
                          <div
                            key={q.itemId || idx}
                            className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900">
                                {idx + 1}. {q.title}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                {q.type}
                              </span>
                            </div>
                            {q.options && q.options.length > 0 && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Options: {q.options.join(' · ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                        Submitted Responses ({selectedFormResponses.length})
                      </span>
                      {selectedFormResponses.length > 0 ? (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {selectedFormResponses.map((resp) => (
                            <div
                              key={resp.responseId}
                              className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="font-mono">{resp.responseId}</span>
                                <span>{new Date(resp.lastSubmittedTime).toLocaleString()}</span>
                              </div>
                              {resp.answers.map((ans, idx) => (
                                <div key={idx} className="text-[11px]">
                                  <span className="font-bold text-slate-700">{ans.questionTitle}: </span>
                                  <span className="text-slate-900">{ans.answerText}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                          No submissions recorded yet. Share the &ldquo;Fill Live Form&rdquo; link above and click &ldquo;Refresh Responses&rdquo;.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Explicit Confirmation Modal: Update Existing Google Spreadsheet */}
          {pendingSheetUpdateTarget && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Confirm Spreadsheet Overwrite
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      This will overwrite all 12 PunarChakra tabs inside{' '}
                      <strong className="text-slate-900">&ldquo;{pendingSheetUpdateTarget.name}&rdquo;</strong>{' '}
                      with current application records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingSheetUpdateTarget(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPendingSheetUpdateTarget(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmUpdateExistingSheet}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Confirm &amp; Sync All 12 Tabs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explicit Confirmation Modal: Update Google Form Metadata */}
          {pendingFormEditTarget && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Confirm Google Form Update
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Review and confirm updates to the Google Form title and description.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingFormEditTarget(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Form Title</label>
                    <input
                      type="text"
                      value={pendingFormEditTarget.title}
                      onChange={(e) =>
                        setPendingFormEditTarget({
                          ...pendingFormEditTarget,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Form Description</label>
                    <textarea
                      rows={3}
                      value={pendingFormEditTarget.description}
                      onChange={(e) =>
                        setPendingFormEditTarget({
                          ...pendingFormEditTarget,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPendingFormEditTarget(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEditGoogleForm}
                    disabled={!pendingFormEditTarget.title.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Confirm &amp; Update Form
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explicit Confirmation Modal: Delete File from Google Drive */}
          {pendingDeleteFile && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-rose-700">
                      Confirm Google Drive Deletion
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Are you sure you want to permanently delete{' '}
                      <strong className="text-slate-900">&ldquo;{pendingDeleteFile.name}&rdquo;</strong>{' '}
                      from Google Drive? This action cannot be undone.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteFile(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteFile(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteDriveFile}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Delete File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW CUSTOMER
          ========================================================================= */}
      {addCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Register New Customer Account</span>
              </h3>
              <button
                onClick={() => setAddCustomerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewCustomer} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Customer Name
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={newCustArea}
                    onChange={(e) => setNewCustArea(e.target.value)}
                    placeholder="Indiranagar"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street / Apartment Address
                </label>
                <input
                  type="text"
                  value={newCustStreet}
                  onChange={(e) => setNewCustStreet(e.target.value)}
                  placeholder="e.g. #45, 12th Main Road"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Wallet Balance (₹)
                </label>
                <input
                  type="number"
                  value={newCustWallet}
                  onChange={(e) => setNewCustWallet(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddCustomerModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT CUSTOMER
          ========================================================================= */}
      {editCustomerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <span>Edit Customer: {selectedCustomer.name}</span>
              </h3>
              <button
                onClick={() => setEditCustomerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateCustomer(selectedCustomer.id, {
                  name: selectedCustomer.name,
                  phone: selectedCustomer.phone,
                  email: selectedCustomer.email,
                  area: selectedCustomer.area,
                  walletBalance: Number(selectedCustomer.walletBalance),
                  ecoRewardPoints: Number(selectedCustomer.ecoRewardPoints),
                  status: selectedCustomer.status,
                });
                setEditCustomerModalOpen(false);
                alert(`Customer ${selectedCustomer.name} updated!`);
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={selectedCustomer.name}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={selectedCustomer.phone}
                    onChange={(e) =>
                      setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) =>
                      setSelectedCustomer({ ...selectedCustomer, email: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Wallet (₹)
                  </label>
                  <input
                    type="number"
                    value={selectedCustomer.walletBalance}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        walletBalance: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Eco Points
                  </label>
                  <input
                    type="number"
                    value={selectedCustomer.ecoRewardPoints}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        ecoRewardPoints: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={selectedCustomer.status}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        status: e.target.value as 'active' | 'suspended',
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditCustomerModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW EXECUTIVE
          ========================================================================= */}
      {addExecutiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <span>Onboard Field Executive Driver</span>
              </h3>
              <button
                onClick={() => setAddExecutiveModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewExecutive} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={newExecName}
                  onChange={(e) => setNewExecName(e.target.value)}
                  placeholder="e.g. Venkatesh Prasad"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newExecPhone}
                    onChange={(e) => setNewExecPhone(e.target.value)}
                    placeholder="+91 98450 66778"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={newExecVehicleNo}
                    onChange={(e) => setNewExecVehicleNo(e.target.value)}
                    placeholder="KA-04-EV-7890"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Type
                </label>
                <select
                  value={newExecVehicleType}
                  onChange={(e) =>
                    setNewExecVehicleType(e.target.value as Executive['vehicleType'])
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Electric Auto">Electric Auto (3-Wheeler)</option>
                  <option value="Mini PickUp Van">Mini PickUp Van (E-Truck)</option>
                  <option value="E-Bike Loader">E-Bike Loader (Heavy Courier)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddExecutiveModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold shadow-md"
                >
                  Add to Fleet Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT EXECUTIVE
          ========================================================================= */}
      {editExecutiveModalOpen && selectedExecutive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-sky-600" />
                <span>Edit Executive: {selectedExecutive.name}</span>
              </h3>
              <button
                onClick={() => setEditExecutiveModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateExecutive(selectedExecutive.id, {
                  name: selectedExecutive.name,
                  phone: selectedExecutive.phone,
                  vehicleNumber: selectedExecutive.vehicleNumber,
                  vehicleType: selectedExecutive.vehicleType,
                  rating: Number(selectedExecutive.rating),
                  isAvailable: selectedExecutive.isAvailable,
                });
                setEditExecutiveModalOpen(false);
                alert(`Executive ${selectedExecutive.name} updated!`);
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={selectedExecutive.name}
                  onChange={(e) =>
                    setSelectedExecutive({ ...selectedExecutive, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={selectedExecutive.phone}
                    onChange={(e) =>
                      setSelectedExecutive({ ...selectedExecutive, phone: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={selectedExecutive.vehicleNumber}
                    onChange={(e) =>
                      setSelectedExecutive({
                        ...selectedExecutive,
                        vehicleNumber: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={selectedExecutive.vehicleType}
                    onChange={(e) =>
                      setSelectedExecutive({
                        ...selectedExecutive,
                        vehicleType: e.target.value as Executive['vehicleType'],
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Electric Auto">Electric Auto</option>
                    <option value="Mini PickUp Van">Mini PickUp Van</option>
                    <option value="E-Bike Loader">E-Bike Loader</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rating (1-5★)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={selectedExecutive.rating}
                    onChange={(e) =>
                      setSelectedExecutive({
                        ...selectedExecutive,
                        rating: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditExecutiveModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SCHEDULE ORDER ON BEHALF OF CUSTOMER
          ========================================================================= */}
      {createOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Schedule Pickup Order on Customer Behalf</span>
              </h3>
              <button
                onClick={() => setCreateOrderModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderOnBehalf} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Customer
                </label>
                <select
                  value={orderCustId}
                  onChange={(e) => setOrderCustId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone} - {c.area})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scrap Material
                  </label>
                  <select
                    value={orderItemId}
                    onChange={(e) => setOrderItemId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} (₹{i.rate}/{i.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot
                  </label>
                  <select
                    value={orderSlot}
                    onChange={(e) => setOrderSlot(e.target.value as TimeSlot)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                    <option value="Evening (3 PM - 6 PM)">Evening (3 PM - 6 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Field Executive Driver
                </label>
                <select
                  value={orderExecId}
                  onChange={(e) => setOrderExecId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                >
                  {executives.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} - {ex.vehicleNumber} ({ex.vehicleType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOrderModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md"
                >
                  Dispatch Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BULK UPLOAD CUSTOMERS (CSV)
          ========================================================================= */}
      {uploadCustomersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Upload Customer Details (CSV / Excel)</span>
              </h3>
              <button
                onClick={() => {
                  setUploadCustomersModalOpen(false);
                  setCsvUploadPreview([]);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Need standard upload template?</span>
                  <span className="text-[11px] text-emerald-700">Download formatted CSV template for bulk onboarding.</span>
                </div>
                <button
                  onClick={handleDownloadSampleCustomerCSV}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select CSV File from Computer
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleParseCustomerCSV}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                />
              </div>

              {csvUploadPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Preview: {csvUploadPreview.length} customer records parsed
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Ready to import</span>
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {csvUploadPreview.map((c, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <span className="text-slate-500 ml-2">({c.phone})</span>
                        </div>
                        <span className="text-slate-600">{c.area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadCustomersModalOpen(false);
                    setCsvUploadPreview([]);
                  }}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={csvUploadPreview.length === 0}
                  onClick={() => {
                    onBulkUploadCustomers(csvUploadPreview as CustomerAccount[]);
                    setUploadCustomersModalOpen(false);
                    setCsvUploadPreview([]);
                    alert(`Successfully imported ${csvUploadPreview.length} customers!`);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-extrabold shadow-md"
                >
                  Import {csvUploadPreview.length} Customers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BULK UPLOAD FLEET (CSV)
          ========================================================================= */}
      {uploadFleetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-600" />
                <span>Upload Executive Fleet Roster (CSV)</span>
              </h3>
              <button
                onClick={() => {
                  setUploadFleetModalOpen(false);
                  setCsvUploadPreview([]);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-sky-800 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Need fleet roster template?</span>
                  <span className="text-[11px] text-sky-700">Download formatted CSV template for bulk vehicles & drivers.</span>
                </div>
                <button
                  onClick={handleDownloadSampleFleetCSV}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select CSV File from Computer
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleParseFleetCSV}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                />
              </div>

              {csvUploadPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Preview: {csvUploadPreview.length} fleet records parsed
                    </span>
                    <span className="text-[10px] text-sky-600 font-bold">Ready to onboard</span>
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {csvUploadPreview.map((e, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-900">{e.name}</span>
                          <span className="text-slate-500 ml-2">({e.vehicleNumber})</span>
                        </div>
                        <span className="text-slate-600">{e.vehicleType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadFleetModalOpen(false);
                    setCsvUploadPreview([]);
                  }}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={csvUploadPreview.length === 0}
                  onClick={() => {
                    onBulkUploadExecutives(csvUploadPreview as Executive[]);
                    setUploadFleetModalOpen(false);
                    setCsvUploadPreview([]);
                    alert(`Successfully imported ${csvUploadPreview.length} executives into fleet!`);
                  }}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-extrabold shadow-md"
                >
                  Import {csvUploadPreview.length} Executives
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE CUSTOMER MODAL
          ========================================================================= */}
      {deleteCustomerConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">
                Confirm Customer Deletion
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this customer profile? This action will remove their account, addresses, and transaction history.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteCustomerConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteCustomer(deleteCustomerConfirmId)}
                className="px-4 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE EXECUTIVE MODAL
          ========================================================================= */}
      {deleteExecutiveConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">
                Remove Executive from Fleet
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to decommission and remove this pickup executive? Any active jobs will be unassigned and returned to the dispatch queue.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteExecutiveConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteExecutive(deleteExecutiveConfirmId)}
                className="px-4 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Remove Executive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
