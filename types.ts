export type UserRole = 'customer' | 'executive' | 'admin' | 'business';
export type Language = 'en' | 'kn' | 'hi';

export interface ScrapItem {
  id: string;
  category: string;
  name: string;
  rate: number; // in ₹ per unit
  previousRate?: number; // baseline rate for real-time surge % computation
  unit: 'kg' | 'piece';
  icon: string;
  co2Offset: number; // in kg CO2 saved per unit
  minQty: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface ScrapCategory {
  id: string;
  name: string;
  nameKn: string;
  nameHi: string;
  icon: string;
  itemCount: number;
  color: string;
  bgGradient: string;
}

export interface AiClassificationResult {
  materialName: string;
  category: string;
  purityGrade: string;
  estimatedRatePerUnit: number;
  unit: 'kg' | 'piece';
  estimatedWeight: string;
  recyclabilityScore: number;
  co2SavedPerKg: number;
  segregationTips: string[];
  kannadaName: string;
  kannadaSummary: string;
  hindiName: string;
  hindiSummary: string;
  confidenceScore: number;
}

export interface Address {
  id: string;
  title: string; // Home, Office, Warehouse
  street: string;
  area: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export type TimeSlot = 'Morning (9 AM - 12 PM)' | 'Afternoon (12 PM - 3 PM)' | 'Evening (3 PM - 6 PM)';

export interface PickupOrderItem {
  scrapItemId: string;
  name: string;
  estimatedQty: number;
  actualQty?: number;
  unit: 'kg' | 'piece';
  ratePerUnit: number;
  estimatedAmount: number;
  actualAmount?: number;
}

export type OrderStatus =
  | 'requested'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'weighing'
  | 'completed'
  | 'cancelled';

export interface PickupOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: Address;
  items: PickupOrderItem[];
  totalEstimatedAmount: number;
  finalAmount?: number;
  totalWeight?: number;
  status: OrderStatus;
  scheduledDate: string;
  timeSlot: TimeSlot;
  assignedExecutiveId?: string;
  assignedExecutiveName?: string;
  assignedExecutivePhone?: string;
  assignedExecutiveRating?: number;
  vehicleNo?: string;
  executiveLat?: number;
  executiveLng?: number;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  reviewText?: string;
  paymentMethod: 'UPI' | 'Cash' | 'PunarChakra Wallet';
  paymentStatus: 'Pending' | 'Paid' | 'Processing';
  ecoPointsEarned?: number;
  co2SavedTotal?: number;
}

export interface Executive {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  vehicleType: 'Electric Auto' | 'Mini PickUp Van' | 'E-Bike Loader';
  vehicleNumber: string;
  rating: number;
  totalPickups: number;
  currentLat: number;
  currentLng: number;
  isAvailable: boolean;
  pendingJobsCount: number;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'withdrawal' | 'reward_cashback';
  amount: number;
  description: string;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Failed';
  referenceId: string;
}

export interface RewardVoucher {
  id: string;
  title: string;
  pointsRequired: number;
  discountValue: string;
  sponsorName: string;
  category: 'Greens' | 'Utilities' | 'Shopping' | 'Organic';
  icon: string;
  code: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'rate' | 'reward' | 'system';
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  language: Language;
  walletBalance: number;
  ecoRewardPoints: number;
  referralCode: string;
  totalRecycledKg: number;
  totalCo2SavedKg: number;
  totalPayoutEarned: number;
  savedAddresses: Address[];
}

export interface CustomerAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  city: string;
  walletBalance: number;
  ecoRewardPoints: number;
  totalRecycledKg: number;
  totalOrdersCount: number;
  status: 'active' | 'suspended';
  joinedDate: string;
  address: Address;
}

export interface BusinessProfile {
  id: string;
  companyName: string;
  gstin: string;
  contactPerson: string;
  phone: string;
  email: string;
  industryCategory: 'Manufacturing' | 'IT Park & Tech' | 'Automobile' | 'Textiles' | 'Chemical & Plastics' | 'Warehouse';
  facilityAddress: Address;
  tonnageCollected: number;
  co2OffsetTonnes: number;
  eprCertificatesCount: number;
  monthlyContractActive: boolean;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
  size?: string;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  locality: string;
  city: string;
  totalKg: number;
  points: number;
  co2SavedKg: number;
  badgeTitle: string;
  cheers: number;
  isCurrentUser?: boolean;
}

export interface CleanupDrive {
  id: string;
  title: string;
  organizer: string;
  locality: string;
  city: string;
  date: string;
  time: string;
  locationHub: string;
  targetCategory: string;
  targetCategoryIcon: string;
  participantsCount: number;
  maxSlots: number;
  expectedKg: number;
  bonusPoints: number;
  status: 'upcoming' | 'live' | 'completed';
  joined: boolean;
  image: string;
  description: string;
}

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
];

export interface SidebarTipSuggestion {
  scrapItemId: string;
  itemName: string;
  category: string;
  reasonType: 'history' | 'seasonal' | 'price_surge';
  reasonTag: string;
  reasonText: string;
  prepTip: string;
  suggestedQty: number;
  unit: 'kg' | 'piece';
  estimatedRate: number;
  co2OffsetPerUnit: number;
}

export interface RecyclingSidebarData {
  seasonName: string;
  seasonWindow: string;
  localTrendHeadline: string;
  historySummary: string;
  arScanPrompt: string;
  suggestedMaterials: SidebarTipSuggestion[];
  aiPowered: boolean;
}

export interface ArScanAnalysis {
  materialName: string;
  matchedItemId: string;
  category: string;
  purityGrade: string;
  estimatedRatePerUnit: number;
  unit: 'kg' | 'piece';
  estimatedWeightKg: number;
  estimatedDimensionsCm: string;
  recyclabilityScore: number;
  co2SavedTotalKg: number;
  binLabel: string;
  binColor: 'emerald' | 'amber' | 'sky' | 'purple';
  arCallouts: string[];
  kannadaName: string;
  hindiName: string;
  confidenceScore: number;
  aiPowered: boolean;
}

export interface WorkspaceActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionType:
    | 'PICKUP_SCHEDULED'
    | 'ORDER_STATUS_UPDATED'
    | 'AI_PHOTO_SCAN'
    | 'AR_SPATIAL_SCAN'
    | 'RECYCLING_TIP_ADDED'
    | 'WALLET_WITHDRAWAL'
    | 'VOUCHER_REDEEMED'
    | 'RATE_UPDATED'
    | 'FORM_CREATED';
  summary: string;
  details: string;
  materialId?: string;
  quantity?: number;
  estimatedValue?: number;
}

export type GoogleFormTemplateType =
  | 'pickup_feedback'
  | 'cleanup_volunteer'
  | 'b2b_bulk_intake'
  | 'custom';

export interface GoogleFormQuestion {
  itemId: string;
  questionId?: string;
  title: string;
  type: 'TEXT' | 'PARAGRAPH' | 'CHOICE' | 'SCALE' | 'OTHER';
  required?: boolean;
  options?: string[];
}

export interface GoogleFormSummary {
  formId: string;
  title: string;
  description?: string;
  responderUri?: string;
  webViewLink?: string;
  templateType?: GoogleFormTemplateType;
  questions: GoogleFormQuestion[];
  responseCount?: number;
}

export interface GoogleFormResponseItem {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  respondentEmail?: string;
  answers: {
    questionTitle: string;
    answerText: string;
  }[];
}

