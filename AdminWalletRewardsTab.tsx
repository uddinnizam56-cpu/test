import React, { useState } from 'react';
import {
  Wallet,
  Award,
  Plus,
  Trash2,
  Edit2,
  Gift,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { RewardVoucher, WalletTransaction, CustomerAccount, Language } from '../../types';

interface AdminWalletRewardsTabProps {
  vouchers: RewardVoucher[];
  transactions: WalletTransaction[];
  customers: CustomerAccount[];
  language: Language;
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
}

export const AdminWalletRewardsTab: React.FC<AdminWalletRewardsTabProps> = ({
  vouchers,
  transactions,
  customers,
  language,
  onCreateVoucher,
  onUpdateVoucher,
  onDeleteVoucher,
  onAddTransaction,
  onDeleteTransaction,
  onAdjustCustomerBalance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'vouchers' | 'adjust' | 'ledger'>('vouchers');
  const [voucherSearch, setVoucherSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');

  // Voucher Modals
  const [addVoucherOpen, setAddVoucherOpen] = useState(false);
  const [editVoucherOpen, setEditVoucherOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<RewardVoucher | null>(null);
  const [deleteVoucherConfirmId, setDeleteVoucherConfirmId] = useState<string | null>(null);

  // Voucher Form State
  const [vTitle, setVTitle] = useState('');
  const [vPoints, setVPoints] = useState(300);
  const [vDiscount, setVDiscount] = useState('₹100 Off');
  const [vSponsor, setVSponsor] = useState('');
  const [vCategory, setVCategory] = useState<RewardVoucher['category']>('Greens');
  const [vCode, setVCode] = useState('');
  const [vIcon, setVIcon] = useState('gift');

  // Adjust Balance Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustCustId, setAdjustCustId] = useState(customers[0]?.id || '');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustWalletAmount, setAdjustWalletAmount] = useState(100);
  const [adjustEcoPoints, setAdjustEcoPoints] = useState(50);
  const [adjustReason, setAdjustReason] = useState('Green recycling bonus grant');
  const [adjustToast, setAdjustToast] = useState<string | null>(null);

  // Transaction Delete
  const [deleteTxConfirmId, setDeleteTxConfirmId] = useState<string | null>(null);

  // Manual Transaction Modal
  const [manualTxModalOpen, setManualTxModalOpen] = useState(false);
  const [mTxType, setMTxType] = useState<WalletTransaction['type']>('credit');
  const [mTxAmount, setMTxAmount] = useState(250);
  const [mTxDesc, setMTxDesc] = useState('');
  const [mTxCustId, setMTxCustId] = useState(customers[0]?.id || '');

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.title.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      v.sponsorName.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      v.code.toLowerCase().includes(voucherSearch.toLowerCase())
  );

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.description.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.referenceId.toLowerCase().includes(txSearch.toLowerCase())
  );

  const handleOpenAddVoucher = () => {
    setVTitle('');
    setVPoints(300);
    setVDiscount('₹100 Off');
    setVSponsor('');
    setVCategory('Greens');
    setVCode(`ECO${Math.floor(1000 + Math.random() * 9000)}`);
    setVIcon('gift');
    setAddVoucherOpen(true);
  };

  const handleOpenEditVoucher = (v: RewardVoucher) => {
    setSelectedVoucher(v);
    setVTitle(v.title);
    setVPoints(v.pointsRequired);
    setVDiscount(v.discountValue);
    setVSponsor(v.sponsorName);
    setVCategory(v.category);
    setVCode(v.code);
    setVIcon(v.icon);
    setEditVoucherOpen(true);
  };

  const handleSaveNewVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle || !vSponsor || !vCode) return;
    const newVoucher: RewardVoucher = {
      id: `vouch_${Date.now()}`,
      title: vTitle,
      pointsRequired: Number(vPoints),
      discountValue: vDiscount,
      sponsorName: vSponsor,
      category: vCategory,
      icon: vIcon,
      code: vCode.toUpperCase(),
    };
    if (onCreateVoucher) {
      onCreateVoucher(newVoucher);
    }
    setAddVoucherOpen(false);
  };

  const handleSaveEditVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher || !vTitle) return;
    if (onUpdateVoucher) {
      onUpdateVoucher(selectedVoucher.id, {
        title: vTitle,
        pointsRequired: Number(vPoints),
        discountValue: vDiscount,
        sponsorName: vSponsor,
        category: vCategory,
        icon: vIcon,
        code: vCode.toUpperCase(),
      });
    }
    setEditVoucherOpen(false);
    setSelectedVoucher(null);
  };

  const handleConfirmDeleteVoucher = (id: string) => {
    if (onDeleteVoucher) {
      onDeleteVoucher(id);
    }
    setDeleteVoucherConfirmId(null);
  };

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustCustId) return;
    const walletDelta = adjustType === 'credit' ? Number(adjustWalletAmount) : -Number(adjustWalletAmount);
    const ecoPointsDelta = adjustType === 'credit' ? Number(adjustEcoPoints) : -Number(adjustEcoPoints);
    if (onAdjustCustomerBalance) {
      onAdjustCustomerBalance(adjustCustId, walletDelta, ecoPointsDelta, adjustReason);
    }
    const targetCust = customers.find((c) => c.id === adjustCustId);
    setAdjustToast(`Successfully ${adjustType === 'credit' ? 'credited' : 'debited'} ₹${adjustWalletAmount} & ${adjustEcoPoints} Eco Points for ${targetCust?.name || 'Customer'}.`);
    setTimeout(() => setAdjustToast(null), 4000);
    setAdjustModalOpen(false);
  };

  const handleCreateManualTx = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      type: mTxType,
      amount: Number(mTxAmount),
      description: mTxDesc || `Admin Manual ${mTxType.toUpperCase()} Adjustment`,
      timestamp: new Date().toLocaleString(),
      status: 'Completed',
      referenceId: `TX-ADM-${Date.now().toString().slice(-6)}`,
    };
    if (onAddTransaction) {
      onAddTransaction(newTx, mTxCustId);
    }
    setManualTxModalOpen(false);
  };

  const totalWalletSum = customers.reduce((sum, c) => sum + (c.walletBalance || 0), 0);
  const totalEcoPointsSum = customers.reduce((sum, c) => sum + (c.ecoRewardPoints || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {adjustToast && (
        <div className="p-4 bg-emerald-900 text-white rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-extrabold text-xs sm:text-sm">{adjustToast}</span>
        </div>
      )}

      {/* Top Banner & KPI Summary */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-amber-900/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Wallet & Rewards Engine
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Real-Time Ledger & Voucher Manager</span>
            </div>
            <h2 className="text-2xl font-black font-display text-white">
              Rewards, Eco Points & Wallet Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Add new promotional vouchers, edit sponsor partnerships, credit or debit customer wallets, and manage cash payouts throughout the platform.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleOpenAddVoucher}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reward Voucher</span>
            </button>
            <button
              onClick={() => setAdjustModalOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              <span>Adjust Customer Balance</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Vouchers</span>
            <span className="text-xl font-black text-amber-300 font-display mt-0.5 block">{vouchers.length}</span>
            <span className="text-[10px] text-slate-400">Available to customers</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Circulating Wallet</span>
            <span className="text-xl font-black text-emerald-400 font-display mt-0.5 block">₹{totalWalletSum.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">Across {customers.length} accounts</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Eco Reward Points</span>
            <span className="text-xl font-black text-teal-300 font-display mt-0.5 block">{totalEcoPointsSum.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">Awarded for recycling</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Transactions</span>
            <span className="text-xl font-black text-white font-display mt-0.5 block">{transactions.length}</span>
            <span className="text-[10px] text-slate-400">Recorded on ledger</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Switcher */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab('vouchers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'vouchers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span>Reward Vouchers Catalog ({vouchers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('adjust')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'adjust'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-200" />
          <span>Customer Wallet Balances</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'ledger'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Coins className="w-4 h-4 text-indigo-200" />
          <span>Wallet Transactions Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* SUB TAB 1: VOUCHERS CATALOG */}
      {activeSubTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vouchers by title, sponsor, code..."
                value={voucherSearch}
                onChange={(e) => setVoucherSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <button
              onClick={handleOpenAddVoucher}
              className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Voucher</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVouchers.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
                      🎁
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                        {v.category}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1 line-clamp-1">{v.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{v.sponsorName}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black shrink-0">
                    {v.pointsRequired} Pts
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold">Benefit Value:</span>
                    <span className="font-extrabold text-emerald-700">{v.discountValue}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold">Promo Code:</span>
                    <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {v.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEditVoucher(v)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteVoucherConfirmId(v.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: CUSTOMER WALLET BALANCES */}
      {activeSubTab === 'adjust' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base text-slate-900 font-display">Customer Accounts & Eco Wallets</h3>
              <p className="text-xs text-slate-500">Inspect real-time customer balances, award green cashback, or debit funds.</p>
            </div>
            <button
              onClick={() => setAdjustModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              <span>Credit / Debit Balance</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Area & City</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Eco Reward Points</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3.5 px-4 font-black text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4">{c.phone}</td>
                    <td className="py-3.5 px-4">{c.area}, {c.city}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700">₹{c.walletBalance?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-black text-teal-700">{c.ecoRewardPoints?.toLocaleString()} Pts</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustCustId(c.id);
                          setAdjustModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition-all inline-flex items-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Adjust Balance</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: TRANSACTIONS LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ledger by description or Ref ID..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              onClick={() => setManualTxModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Manual Transaction</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredTransactions.map((tx) => {
                    const isCredit = tx.type === 'credit' || tx.type === 'reward_cashback';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tx.referenceId}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isCredit
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate" title={tx.description}>
                          {tx.description}
                        </td>
                        <td className={`py-3.5 px-4 font-black ${isCredit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{tx.timestamp}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setDeleteTxConfirmId(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Delete transaction record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD VOUCHER MODAL
          ========================================================================= */}
      {addVoucherOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 font-display">Create Reward Voucher</h3>
              </div>
              <button
                onClick={() => setAddVoucherOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewVoucher} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Voucher Title</label>
                <input
                  type="text"
                  placeholder="e.g. ₹150 Off Organic Produce"
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Points Required</label>
                  <input
                    type="number"
                    value={vPoints}
                    onChange={(e) => setVPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Benefit Value</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹150 Discount"
                    value={vDiscount}
                    onChange={(e) => setVDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sponsor / Partner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Namdhari Organic Farm"
                  value={vSponsor}
                  onChange={(e) => setVSponsor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Greens">Greens</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Redemption Code</label>
                  <input
                    type="text"
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-black"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddVoucherOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black shadow-md"
                >
                  Publish Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT VOUCHER MODAL
          ========================================================================= */}
      {editVoucherOpen && selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 font-display">Edit Reward Voucher</h3>
              </div>
              <button
                onClick={() => setEditVoucherOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditVoucher} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Voucher Title</label>
                <input
                  type="text"
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Points Required</label>
                  <input
                    type="number"
                    value={vPoints}
                    onChange={(e) => setVPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Benefit Value</label>
                  <input
                    type="text"
                    value={vDiscount}
                    onChange={(e) => setVDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sponsor / Partner Name</label>
                <input
                  type="text"
                  value={vSponsor}
                  onChange={(e) => setVSponsor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Greens">Greens</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Redemption Code</label>
                  <input
                    type="text"
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-black"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditVoucherOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md"
                >
                  Update Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADJUST CUSTOMER BALANCE MODAL
          ========================================================================= */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Adjust Customer Balance</h3>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Customer Account</label>
                <select
                  value={adjustCustId}
                  onChange={(e) => setAdjustCustId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Current: ₹{c.walletBalance} / {c.ecoRewardPoints} Pts
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Adjustment Action</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="credit">Credit Funds (+)</option>
                    <option value="debit">Debit Funds (-)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wallet Amount (₹)</label>
                  <input
                    type="number"
                    value={adjustWalletAmount}
                    onChange={(e) => setAdjustWalletAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Eco Reward Points to Grant/Deduct</label>
                <input
                  type="number"
                  value={adjustEcoPoints}
                  onChange={(e) => setAdjustEcoPoints(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-teal-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Audit Trail Note</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Bulk newspaper collection cash payout"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl font-black shadow-md ${
                    adjustType === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Execute {adjustType === 'credit' ? 'Credit' : 'Debit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          RECORD MANUAL TRANSACTION MODAL
          ========================================================================= */}
      {manualTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Record Manual Transaction</h3>
              </div>
              <button
                onClick={() => setManualTxModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualTx} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Account</label>
                <select
                  value={mTxCustId}
                  onChange={(e) => setMTxCustId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Transaction Type</label>
                  <select
                    value={mTxType}
                    onChange={(e) => setMTxType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="credit">Credit (+)</option>
                    <option value="debit">Debit (-)</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="reward_cashback">Reward Cashback</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={mTxAmount}
                    onChange={(e) => setMTxAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Description</label>
                <input
                  type="text"
                  placeholder="e.g. Instant Bank Payout via UPI to customer"
                  value={mTxDesc}
                  onChange={(e) => setMTxDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManualTxModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-md"
                >
                  Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE VOUCHER MODAL
          ========================================================================= */}
      {deleteVoucherConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">Delete Reward Voucher</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this reward voucher? Customers will no longer be able to view or redeem it.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteVoucherConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteVoucher(deleteVoucherConfirmId)}
                className="px-4 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Delete Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE TRANSACTION MODAL
          ========================================================================= */}
      {deleteTxConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">Delete Ledger Transaction</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this transaction record from the audit ledger?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTxConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteTransaction) onDeleteTransaction(deleteTxConfirmId);
                  setDeleteTxConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
