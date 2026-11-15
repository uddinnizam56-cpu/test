import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Star,
  MapPin,
  Calendar,
  X,
  FileText,
  ShieldCheck,
  RotateCcw,
  Bell,
  FileSpreadsheet,
  HardDrive,
  Upload,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  PickupOrder,
  Language,
  UserProfile,
  WalletTransaction,
  WorkspaceActivityLog,
} from '../../types';
import { translations } from '../../utils/translations';
import logoImg from '../../assets/images/punarchakra_logo_1785891011537.jpg';
import { PunarChakraLogo } from '../PunarChakraLogo';
import {
  signInWithGoogleWorkspace,
  getWorkspaceAccessToken,
  createGoogleSpreadsheet,
  uploadBackupCsvToDrive,
  SheetTabInput,
  auth,
} from '../../services/googleWorkspace';
import { onAuthStateChanged, User } from 'firebase/auth';

interface OrderHistoryViewProps {
  orders: PickupOrder[];
  language: Language;
  userProfile?: UserProfile;
  transactions?: WalletTransaction[];
  activityLogs?: WorkspaceActivityLog[];
  onTrackOrder: (order: PickupOrder) => void;
  onRateOrder: (orderId: string, rating: number, reviewText: string) => void;
  onReorder?: (order: PickupOrder) => void;
  onSetReminder?: (order: PickupOrder) => void;
  onConfirmPickupComplete?: (order: PickupOrder) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  language,
  userProfile,
  transactions = [],
  activityLogs = [],
  onTrackOrder,
  onRateOrder,
  onReorder,
  onSetReminder,
  onConfirmPickupComplete,
}) => {
  const t = translations[language];
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<PickupOrder | null>(null);
  const [ratingModalOrder, setRatingModalOrder] = useState<PickupOrder | null>(null);
  const [starRating, setStarRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reorderNotification, setReorderNotification] = useState<string | null>(null);

  // Citizen Google Sheets & Drive Sync State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncedSheetUrl, setSyncedSheetUrl] = useState<string | null>(null);
  const [syncedDriveUrl, setSyncedDriveUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setGoogleUser(u);
    });
    return () => unsub();
  }, []);

  const ensureWorkspaceToken = async (): Promise<boolean> => {
    if (googleUser && getWorkspaceAccessToken()) return true;
    try {
      const res = await signInWithGoogleWorkspace();
      if (res) {
        setGoogleUser(res.user);
        return true;
      }
      return false;
    } catch (err: any) {
      setSyncError(err?.message || 'Google Workspace sign-in cancelled or failed.');
      return false;
    }
  };

  const buildCitizenSheetsPayload = (): SheetTabInput[] => {
    const profileTab: SheetTabInput = {
      sheetTitle: 'My_Profile_Summary',
      headers: [
        'User ID', 'Name', 'Phone', 'Email', 'Wallet Balance (₹)',
        'Eco Points', 'Total Recycled (kg)', 'Total CO2 Saved (kg)', 'Total Payout Earned (₹)', 'Referral Code',
      ],
      rows: [
        [
          userProfile?.id || 'cust_self',
          userProfile?.name || orders[0]?.customerName || 'Citizen Recycler',
          userProfile?.phone || orders[0]?.customerPhone || '',
          userProfile?.email || '',
          userProfile?.walletBalance ?? 0,
          userProfile?.ecoRewardPoints ?? 0,
          userProfile?.totalRecycledKg ?? 0,
          userProfile?.totalCo2SavedKg ?? 0,
          userProfile?.totalPayoutEarned ?? 0,
          userProfile?.referralCode || '',
        ],
      ],
    };

    const ordersTab: SheetTabInput = {
      sheetTitle: 'My_Pickup_Orders',
      headers: [
        'Order Number', 'Scheduled Date', 'Time Slot', 'Status', 'Pickup Area',
        'Executive', 'Vehicle No', 'Payment Method', 'Payment Status',
        'Estimated (₹)', 'Final Payout (₹)', 'CO2 Saved (kg)', 'Rating', 'Review',
      ],
      rows: orders.map((o) => [
        o.orderNumber,
        o.scheduledDate,
        o.timeSlot,
        o.status,
        `${o.address.area}, ${o.address.city}`,
        o.assignedExecutiveName || 'Pending',
        o.vehicleNo || 'EV Auto',
        o.paymentMethod,
        o.paymentStatus,
        o.totalEstimatedAmount,
        o.finalAmount ?? o.totalEstimatedAmount,
        o.co2SavedTotal ?? 0,
        o.rating ?? '',
        o.reviewText || '',
      ]),
    };

    const itemizedRows: (string | number)[][] = [];
    orders.forEach((o) => {
      o.items.forEach((it) => {
        itemizedRows.push([
          o.orderNumber,
          o.scheduledDate,
          it.scrapItemId,
          it.name,
          it.estimatedQty,
          it.actualQty ?? it.estimatedQty,
          it.unit,
          it.ratePerUnit,
          it.estimatedAmount,
          it.actualAmount ?? it.estimatedAmount,
        ]);
      });
    });

    const itemizedTab: SheetTabInput = {
      sheetTitle: 'Itemized_Materials',
      headers: [
        'Order Number', 'Date', 'Material ID', 'Material Name', 'Est. Qty',
        'Actual Qty', 'Unit', 'Rate (₹/unit)', 'Est. Amount (₹)', 'Actual Amount (₹)',
      ],
      rows: itemizedRows,
    };

    const txTab: SheetTabInput = {
      sheetTitle: 'Wallet_Transactions',
      headers: ['Transaction ID', 'Type', 'Amount (₹)', 'Description', 'Timestamp', 'Status', 'Reference ID'],
      rows: transactions.map((tx) => [
        tx.id,
        tx.type,
        tx.amount,
        tx.description,
        tx.timestamp,
        tx.status,
        tx.referenceId,
      ]),
    };

    const logsTab: SheetTabInput = {
      sheetTitle: 'AI_AR_Activity_Logs',
      headers: ['Log ID', 'Timestamp', 'Action Type', 'Summary', 'Details', 'Material ID', 'Qty', 'Est. Value (₹)'],
      rows: activityLogs.map((l) => [
        l.id,
        l.timestamp,
        l.actionType,
        l.summary,
        l.details,
        l.materialId || '',
        l.quantity ?? '',
        l.estimatedValue ?? '',
      ]),
    };

    return [profileTab, ordersTab, itemizedTab, txTab, logsTab];
  };

  const handleCitizenExportToSheets = async () => {
    setSyncError(null);
    setSyncStatus(null);
    setSyncBusy(true);
    try {
      const ok = await ensureWorkspaceToken();
      if (!ok) {
        setSyncBusy(false);
        return;
      }
      const tabs = buildCitizenSheetsPayload();
      const title = `PunarChakra My Recycling Records - ${new Date().toISOString().slice(0, 10)}`;
      const res = await createGoogleSpreadsheet(title, tabs);
      setSyncedSheetUrl(res.spreadsheetUrl);
      if (res.folderWebViewLink) {
        setSyncedDriveUrl(res.folderWebViewLink);
      }
      setSyncStatus(
        `Exported all 5 personal tabs (${orders.length} orders, ${transactions.length} transactions, ${activityLogs.length} AI/AR logs) to Google Sheets!`
      );
    } catch (err: any) {
      setSyncError(err?.message || 'Failed to sync personal records to Google Sheets.');
    } finally {
      setSyncBusy(false);
    }
  };

  const handleCitizenExportToDrive = async () => {
    setSyncError(null);
    setSyncStatus(null);
    setSyncBusy(true);
    try {
      const ok = await ensureWorkspaceToken();
      if (!ok) {
        setSyncBusy(false);
        return;
      }
      const tabs = buildCitizenSheetsPayload();
      const csvEscape = (v: string | number | undefined) => {
        const s = String(v ?? '').replace(/\r?\n/g, ' ');
        return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines: string[] = [
        'PUNARCHAKRA CITIZEN PERSONAL RECYCLING & WALLET ARCHIVE',
        `Generated On: ${new Date().toLocaleString()}`,
        `Recycler: ${userProfile?.name || 'Citizen'}`,
      ];
      tabs.forEach((tab) => {
        lines.push('');
        lines.push(`--- ${tab.sheetTitle.toUpperCase()} (${tab.rows.length}) ---`);
        lines.push(tab.headers.map(csvEscape).join(','));
        tab.rows.forEach((r) => lines.push(r.map(csvEscape).join(',')));
      });
      const stamp = new Date().toISOString().slice(0, 10);
      const result = await uploadBackupCsvToDrive(
        `PunarChakra_My_Records_${stamp}.csv`,
        lines.join('\n')
      );
      setSyncedDriveUrl(result.fileWebViewLink || result.folderWebViewLink || null);
      setSyncStatus(`Saved personal archive CSV inside Google Drive / ${result.folderName}.`);
    } catch (err: any) {
      setSyncError(err?.message || 'Failed to save backup to Google Drive.');
    } finally {
      setSyncBusy(false);
    }
  };

  const handleReorderClick = (order: PickupOrder) => {
    if (onReorder) {
      onReorder(order);
    }
    setReorderNotification(`All scrap items from Order #${order.orderNumber} added to cart!`);
    setTimeout(() => {
      setReorderNotification(null);
    }, 4000);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalOrder) return;
    onRateOrder(ratingModalOrder.id, starRating, reviewComment);
    setRatingModalOrder(null);
    setReviewComment('');
  };

  const handleDownloadInvoice = (order: PickupOrder) => {
    const totalAmount = order.finalAmount || order.totalEstimatedAmount;
    const totalCo2 = order.items.reduce(
      (sum, item) => sum + (item.actualQty || item.estimatedQty) * 1.8,
      0
    ).toFixed(1);

    const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PunarChakra_Invoice_${order.orderNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #f8fafc; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 24px; margin-bottom: 28px; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand-logo { width: 48px; height: 48px; background: #059669; color: #ffffff; border-radius: 12px; font-weight: 900; font-size: 22px; display: flex; align-items: center; justify-content: center; }
    .brand-text h1 { font-size: 22px; font-weight: 900; color: #065f46; margin: 0; }
    .brand-text p { font-size: 12px; color: #64748b; margin: 2px 0 0 0; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
    .invoice-title p { font-size: 12px; color: #64748b; margin: 4px 0 0 0; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; background: #f0fdf4; padding: 20px; border-radius: 14px; border: 1px solid #dcfce7; }
    .meta-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #166534; letter-spacing: 0.5px; }
    .meta-box p { margin: 0; font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th { background: #ecfdf5; text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: #065f46; border-bottom: 2px solid #a7f3d0; }
    td { padding: 14px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
    .text-right { text-align: right; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 2px solid #e2e8f0; }
    .eco-badge { background: #d1fae5; color: #065f46; padding: 10px 18px; border-radius: 999px; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; }
    .total-box { text-align: right; }
    .total-box label { font-size: 12px; color: #64748b; font-weight: 600; display: block; }
    .total-box .amount { font-size: 28px; font-weight: 900; color: #059669; }
    .footer { margin-top: 36px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
    @media print {
      body { padding: 0; background: #fff; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div class="brand">
        <img src="${logoImg}" alt="PunarChakra Logo" style="height: 54px; width: auto; object-fit: contain; border-radius: 8px;" />
        <div class="brand-text">
          <h1>PunarChakra (ಪುನಃಚಕ್ರ)</h1>
          <p>Giving Waste a New Life • ತ್ಯಾಜ್ಯಕ್ಕೆ ಹೊಸ ಜೀವನ</p>
        </div>
      </div>
      <div class="invoice-title">
        <h2>TAX INVOICE / RECEIPT</h2>
        <p>Order #${order.orderNumber}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Customer Details</h4>
        <p><strong>${order.customerName}</strong></p>
        <p>Phone: ${order.customerPhone}</p>
        <p>Address: ${order.address.street}, ${order.address.area}, ${order.address.city}</p>
      </div>
      <div class="meta-box">
        <h4>Pickup & Payment Summary</h4>
        <p>Date: ${order.scheduledDate} (${order.timeSlot})</p>
        <p>Executive: ${order.assignedExecutiveName || 'Assigned Agent'} (${order.vehicleNo || 'EV Rickshaw'})</p>
        <p>Payout Method: <strong style="color: #059669;">${order.paymentMethod} (PAID INSTANTLY)</strong></p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Scrap Item Category</th>
          <th>Rate / Unit</th>
          <th>Quantity Recycled</th>
          <th class="text-right">Total Payout (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item) => `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td>₹${item.ratePerUnit} / ${item.unit}</td>
          <td>${item.actualQty || item.estimatedQty} ${item.unit}</td>
          <td class="text-right">₹${item.actualAmount || item.estimatedAmount}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="summary-row">
      <div class="eco-badge">
        🌱 CO₂ Offset Saved: ${totalCo2} kg
      </div>
      <div class="total-box">
        <label>Total Amount Disbursed</label>
        <div class="amount">₹${totalAmount}</div>
      </div>
    </div>

    <div class="footer">
      <p>This is a computer-generated tax receipt & CO₂ offset certificate issued by PunarChakra Environmental Solutions Ltd.</p>
      <p>Thank you for contributing to Karnataka's Zero-Waste Circular Economy!</p>
    </div>
  </div>
</body>
</html>`;

    // Download HTML / Printable PDF Invoice
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PunarChakra_Invoice_${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open print window for instant PDF save
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div className="space-y-6">
      {reorderNotification && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="font-extrabold text-xs sm:text-sm">{reorderNotification}</span>
          </div>
          <button
            onClick={() => setReorderNotification(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">
            {t.navMyOrders}
          </h2>
          <p className="text-xs text-slate-500">
            Track active doorstep pickups, download digital recycling tax receipts, rate executives, and sync your complete data to Google Sheets &amp; Drive.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full tabular-nums">
          {orders.length} Total Bookings
        </span>
      </div>

      {/* Citizen Google Sheets & Google Drive Sync Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">
                Save Complete Personal Records to Google Sheets &amp; Drive
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Captures {orders.length} orders, itemized materials, {transactions.length} wallet transactions, and {activityLogs.length} AI/AR scans.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCitizenExportToSheets}
              disabled={syncBusy}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {syncBusy ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{googleUser ? 'Export to Google Sheets' : 'Connect & Sync Sheets'}</span>
            </button>

            <button
              type="button"
              onClick={handleCitizenExportToDrive}
              disabled={syncBusy}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Archive CSV to Drive</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{syncStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              {syncedSheetUrl && (
                <a
                  href={syncedSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {syncedDriveUrl && (
                <a
                  href={syncedDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <span>Open Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {syncError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">No pickup bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isActive = order.status !== 'completed' && order.status !== 'cancelled';
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 font-display">
                        Order #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Scheduled: {order.scheduledDate} ({order.timeSlot})
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Payout</span>
                    <span className="text-lg font-black text-emerald-600 font-display">
                      ₹{order.finalAmount || order.totalEstimatedAmount}
                    </span>
                  </div>
                </div>

                {/* Items breakdown */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ITEMS:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="px-4 py-2.5 bg-slate-50/80 rounded-full border border-slate-100 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-700">• {item.name}</span>
                        <strong className="text-slate-900">
                          {item.actualQty || item.estimatedQty} {item.unit}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address & Executive info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {order.address.street}, {order.address.area}, {order.address.city}
                    </span>
                  </div>

                  {order.assignedExecutiveName && (
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{order.assignedExecutiveName} ({order.vehicleNo})</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isActive ? (
                      <>
                        <button
                          onClick={() => onTrackOrder(order)}
                          className="px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Live Executive</span>
                        </button>
                        {onSetReminder && (
                          <button
                            onClick={() => onSetReminder(order)}
                            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Set WhatsApp and Calendar pickup reminder"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-600" />
                            <span>Set Reminder</span>
                          </button>
                        )}
                        {onConfirmPickupComplete && (
                          <button
                            onClick={() => onConfirmPickupComplete(order)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Confirm doorstep collection & credit Eco Wallet"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Confirm Pickup & Credit Wallet</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View & Download Invoice</span>
                        </button>
                        <button
                          onClick={() => handleReorderClick(order)}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Reorder Scrap Items</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Rating button if completed */}
                  {order.status === 'completed' && (
                    <div>
                      {order.rating ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Rated {order.rating}★</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRatingModalOrder(order)}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Rate Executive</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Receipt PDF Preview Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100">
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4 text-center">
              <PunarChakraLogo size="lg" showSubtitle={true} className="justify-center mb-2" />
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Official Digital Tax Payout & CO₂ Offset Certificate
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <strong className="text-slate-900">{selectedReceiptOrder.orderNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <strong className="text-slate-900">{selectedReceiptOrder.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Executive:</span>
                <strong className="text-slate-900">{selectedReceiptOrder.assignedExecutiveName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <strong className="text-emerald-700">{selectedReceiptOrder.paymentMethod} (PAID)</strong>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Recycled Items:</span>
                {selectedReceiptOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{item.name} ({item.actualQty || item.estimatedQty} {item.unit})</span>
                    <span>₹{(item.actualAmount || item.estimatedAmount)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900 font-display">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700">₹{selectedReceiptOrder.finalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => {
                handleDownloadInvoice(selectedReceiptOrder);
                setSelectedReceiptOrder(null);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Summary Invoice</span>
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setRatingModalOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 font-display mb-1">
              Rate Executive
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              How was your doorstep pickup experience with {ratingModalOrder.assignedExecutiveName}?
            </p>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStarRating(s)}
                    className="p-2 transition-transform transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        s <= starRating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Comments / Review
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="E.g., Punctual, verified weight accurately with Bluetooth scale and paid instantly!"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                Submit Rating & Earn +20 Points
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
