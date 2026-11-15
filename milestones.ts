export type ProfileMilestoneCategory = 'recycled_kg' | 'wallet_balance';

export interface ProfileMilestone {
  id: string;
  category: ProfileMilestoneCategory;
  threshold: number;
  title: string;
  subtitle: string;
  badge: string;
  rewardLabel: string;
}

export const RECYCLED_KG_MILESTONES: ProfileMilestone[] = [
  {
    id: 'kg_25',
    category: 'recycled_kg',
    threshold: 25,
    title: '25 kg Eco Starter',
    subtitle: 'You diverted your first 25 kg of household scrap from urban landfills.',
    badge: '🌱',
    rewardLabel: 'Eco Starter Tier Unlocked',
  },
  {
    id: 'kg_50',
    category: 'recycled_kg',
    threshold: 50,
    title: '50 kg Half-Century Recycler',
    subtitle: 'Half a quintal of clean sorted materials returned into Bengaluru’s circular economy.',
    badge: '♻️',
    rewardLabel: 'Green Citizen Tier Reached',
  },
  {
    id: 'kg_100',
    category: 'recycled_kg',
    threshold: 100,
    title: '100 kg Century Champion',
    subtitle: 'A full 100 kg of scrap recycled — equivalent to saving ~200 kg of CO₂ emissions!',
    badge: '🌿',
    rewardLabel: 'Century Recycler Verified',
  },
  {
    id: 'kg_250',
    category: 'recycled_kg',
    threshold: 250,
    title: '250 kg Quarter-Tonne Hero',
    subtitle: 'Quarter-tonne milestone achieved through consistent source segregation.',
    badge: '🌲',
    rewardLabel: 'Forest Defender Status',
  },
  {
    id: 'kg_500',
    category: 'recycled_kg',
    threshold: 500,
    title: '500 kg Half-Tonne Legend',
    subtitle: 'Half a metric tonne recycled — ranking among top sustainability champions.',
    badge: '👑',
    rewardLabel: 'Zero-Waste Legend Status',
  },
  {
    id: 'kg_1000',
    category: 'recycled_kg',
    threshold: 1000,
    title: '1,000 kg One-Tonne Titan',
    subtitle: 'One full metric tonne diverted from landfills through PunarChakra.',
    badge: '🌍',
    rewardLabel: 'Planet Titan Honors',
  },
];

export const WALLET_BALANCE_MILESTONES: ProfileMilestone[] = [
  {
    id: 'wallet_500',
    category: 'wallet_balance',
    threshold: 500,
    title: '₹500 Green Wealth Starter',
    subtitle: 'Your Eco Wallet crossed ₹500 in verified doorstep recycling payouts.',
    badge: '💰',
    rewardLabel: 'Instant UPI Payout Ready',
  },
  {
    id: 'wallet_1000',
    category: 'wallet_balance',
    threshold: 1000,
    title: '₹1,000 Eco Wealth Saver',
    subtitle: 'Crossed ₹1,000 in Eco Wallet balance — turning household waste into clean wealth!',
    badge: '🪙',
    rewardLabel: '₹1K Circular Earner',
  },
  {
    id: 'wallet_2500',
    category: 'wallet_balance',
    threshold: 2500,
    title: '₹2,500 Circular Earner',
    subtitle: 'Earned ₹2,500+ in Eco Wallet value from paper, metals & e-waste recovery.',
    badge: '💎',
    rewardLabel: 'Silver Green Earner',
  },
  {
    id: 'wallet_5000',
    category: 'wallet_balance',
    threshold: 5000,
    title: '₹5,000 Eco Investor',
    subtitle: 'Built ₹5,000+ in clean recycling wealth inside your Eco Wallet.',
    badge: '🏆',
    rewardLabel: 'Gold Circular Earner',
  },
  {
    id: 'wallet_10000',
    category: 'wallet_balance',
    threshold: 10000,
    title: '₹10,000 Zero-Waste Tycoon',
    subtitle: 'Reached ₹10,000+ Eco Wallet milestone through high-value scrap recovery.',
    badge: '⚡',
    rewardLabel: 'Platinum Green Wealth',
  },
];

export const ALL_PROFILE_MILESTONES: ProfileMilestone[] = [
  ...RECYCLED_KG_MILESTONES,
  ...WALLET_BALANCE_MILESTONES,
];

export interface MilestoneProgressSummary {
  milestones: ProfileMilestone[];
  unlocked: ProfileMilestone[];
  nextMilestone: ProfileMilestone | null;
  progressPercent: number;
  remaining: number;
}

export function getMilestoneProgress(
  category: ProfileMilestoneCategory,
  currentValue: number
): MilestoneProgressSummary {
  const milestones =
    category === 'recycled_kg' ? RECYCLED_KG_MILESTONES : WALLET_BALANCE_MILESTONES;
  const unlocked = milestones.filter((m) => currentValue >= m.threshold);
  const nextMilestone = milestones.find((m) => currentValue < m.threshold) || null;

  if (!nextMilestone) {
    return {
      milestones,
      unlocked,
      nextMilestone: null,
      progressPercent: 100,
      remaining: 0,
    };
  }

  const prevThreshold = unlocked.length > 0 ? unlocked[unlocked.length - 1].threshold : 0;
  const span = Math.max(1, nextMilestone.threshold - prevThreshold);
  const progressInSpan = Math.max(0, currentValue - prevThreshold);
  const progressPercent = Math.min(100, Math.round((progressInSpan / span) * 100));
  const remaining = Math.max(0, Number((nextMilestone.threshold - currentValue).toFixed(1)));

  return {
    milestones,
    unlocked,
    nextMilestone,
    progressPercent,
    remaining,
  };
}
