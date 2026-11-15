import React, { useState } from 'react';
import {
  X,
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  Share2,
  Download,
  ExternalLink,
  MessageCircle,
  Truck,
  MapPin,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { PickupOrder, Language, NotificationItem } from '../../types';
import { translations } from '../../utils/translations';

interface PickupReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PickupOrder | null;
  language: Language;
  onAddNotification?: (notification: NotificationItem) => void;
}

export const PickupReminderModal: React.FC<PickupReminderModalProps> = ({
  isOpen,
  onClose,
  order,
  language,
  onAddNotification,
}) => {
  const t = translations[language];

  const [reminderTiming, setReminderTiming] = useState<
    '1hour' | 'morning' | '1day' | '30mins'
  >('1hour');
  const [selectedChannels, setSelectedChannels] = useState<{
    whatsapp: boolean;
    calendar: boolean;
    inApp: boolean;
  }>({
    whatsapp: true,
    calendar: true,
    inApp: true,
  });
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen || !order) return null;

  const toggleChannel = (key: 'whatsapp' | 'calendar' | 'inApp') => {
    setSelectedChannels((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper to generate .ics file content
  const generateIcsFile = () => {
    const title = `PunarChakra Scrap Pickup (Order #${order.orderNumber})`;
    const description = `Doorstep scrap recycling pickup by PunarChakra.\\nItems: ${order.items
      .map((i) => `${i.name} (${i.estimatedQty} ${i.unit})`)
      .join(', ')}\\nExecutive: ${
      order.assignedExecutiveName || 'Assigned Agent'
    } (${order.vehicleNo || 'EV Auto'})\\nPlease keep scrap weighed and segregated.`;
    const location = `${order.address.street}, ${order.address.area}, ${order.address.city}`;

    // Approximate date time formatting
    const today = new Date();
    today.setDate(today.getDate() + (order.scheduledDate.toLowerCase().includes('tomorrow') ? 1 : 2));
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    let startHour = 10;
    if (order.timeSlot.includes('Afternoon')) startHour = 13;
    if (order.timeSlot.includes('Evening')) startHour = 16;
    const startHourStr = String(startHour).padStart(2, '0');
    const endHourStr = String(startHour + 2).padStart(2, '0');

    const dtStart = `${year}${month}${day}T${startHourStr}0000`;
    const dtEnd = `${year}${month}${day}T${endHourStr}0000`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PunarChakra//Karnataka Eco Pickup//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:punarchakra-${order.id}-${Date.now()}@punarchakra.in`,
      `DTSTAMP:${year}${month}${day}T000000Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: PunarChakra Scrap Pickup in 1 hour',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return icsContent;
  };

  const handleDownloadCalendar = () => {
    const icsContent = generateIcsFile();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PunarChakra_Pickup_${order.orderNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleCalendar = () => {
    const title = encodeURIComponent(`PunarChakra Scrap Pickup (#${order.orderNumber})`);
    const details = encodeURIComponent(
      `Doorstep scrap collection booked on PunarChakra.\nItems: ${order.items
        .map((i) => `${i.name} (${i.estimatedQty} ${i.unit})`)
        .join(', ')}\nAddress: ${order.address.street}, ${order.address.area}\nExecutive: ${
        order.assignedExecutiveName || 'Assigned EV Auto'
      }`
    );
    const location = encodeURIComponent(
      `${order.address.street}, ${order.address.area}, ${order.address.city}`
    );

    const today = new Date();
    today.setDate(today.getDate() + (order.scheduledDate.toLowerCase().includes('tomorrow') ? 1 : 2));
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    let startHour = 10;
    if (order.timeSlot.includes('Afternoon')) startHour = 13;
    if (order.timeSlot.includes('Evening')) startHour = 16;
    const startHourStr = String(startHour).padStart(2, '0');
    const endHourStr = String(startHour + 2).padStart(2, '0');

    const dates = `${year}${month}${day}T${startHourStr}0000Z/${year}${month}${day}T${endHourStr}0000Z`;

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(gcalUrl, '_blank');
  };

  const handleOpenWhatsAppAlert = () => {
    const message = encodeURIComponent(
      `🔔 *PunarChakra Pickup Reminder Alert*\n\n` +
        `Order Number: *#${order.orderNumber}*\n` +
        `Date & Time: *${order.scheduledDate} (${order.timeSlot})*\n` +
        `Location: ${order.address.street}, ${order.address.area}\n` +
        `Items: ${order.items.map((i) => `${i.name} (~${i.estimatedQty} ${i.unit})`).join(', ')}\n\n` +
        `♻️ *Tips for Pickup:*\n` +
        `• Keep paper and cardboard tied in neat stacks.\n` +
        `• Keep electronics or heavy metals near the gate.\n` +
        `• Instant UPI payment will be credited immediately upon weighing.`
    );
    const waUrl = `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handleSaveReminder = () => {
    // 1. In-App Notification
    if (selectedChannels.inApp && onAddNotification) {
      const timingLabel =
        reminderTiming === '1hour'
          ? '1 Hour Before'
          : reminderTiming === 'morning'
          ? 'Morning of Pickup'
          : reminderTiming === '30mins'
          ? '30 Mins Before'
          : '1 Day Before';

      onAddNotification({
        id: `reminder_${Date.now()}`,
        title: `Pickup Reminder Set! 🔔 (${timingLabel})`,
        message: `Reminder active for Order #${order.orderNumber} scheduled on ${order.scheduledDate} (${order.timeSlot}) at ${order.address.area}.`,
        time: 'Just now',
        read: false,
        type: 'order',
      });
    }

    // 2. Download Calendar if selected
    if (selectedChannels.calendar) {
      handleDownloadCalendar();
    }

    // 3. Save to localStorage
    const savedReminders = JSON.parse(localStorage.getItem('punarchakra_reminders') || '[]');
    savedReminders.push({
      orderId: order.id,
      orderNumber: order.orderNumber,
      timing: reminderTiming,
      createdAt: new Date().toISOString(),
      channels: selectedChannels,
    });
    localStorage.setItem('punarchakra_reminders', JSON.stringify(savedReminders));

    // 4. Request Browser Notification if supported
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().catch(() => {});
    }

    setIsSuccess(true);
    setSuccessMessage(
      `Pickup reminder successfully scheduled for Order #${order.orderNumber}! Calendar downloaded & in-app alert active.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Dual Back / Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all cursor-pointer border border-slate-200"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>← Back</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title="Close reminder window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 shrink-0">
            <Bell className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
              <span>Set Pickup Reminder</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                AUTO-ALERT
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Never miss your scheduled doorstep scrap collection
            </p>
          </div>
        </div>

        {/* Order Brief Summary */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 font-display">
              Order #{order.orderNumber}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
              ₹{order.finalAmount || order.totalEstimatedAmount} Payout
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{order.scheduledDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{order.timeSlot}</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 text-slate-500 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {order.address.street}, {order.address.area}
              </span>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="space-y-4 py-3 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 font-display">
                Pickup Reminder Configured!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                {successMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleOpenWhatsAppAlert}
                className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                <span>Send WhatsApp Reminder</span>
              </button>
              <button
                onClick={handleOpenGoogleCalendar}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Google Calendar</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Step 1: Reminder Timing */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 tracking-wider mb-2">
                1. When should we alert you?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '1hour', label: '1 Hour Before', desc: 'Ideal to bag scrap' },
                  { id: 'morning', label: 'Morning of Pickup (8 AM)', desc: 'Start day ready' },
                  { id: '30mins', label: '30 Mins Before', desc: 'When truck nears' },
                  { id: '1day', label: '1 Day Before (7 PM)', desc: 'Evening prep' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setReminderTiming(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      reminderTiming === item.id
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="block text-xs font-black text-slate-900">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Reminder Channels */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 tracking-wider mb-2">
                2. Reminder Channels
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Calendar Event (.ics & Google Calendar)
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Syncs to Google Calendar, Apple iCal, & Outlook
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedChannels.calendar}
                    onChange={() => toggleChannel('calendar')}
                    className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                      <Bell className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        In-App Alert & Notifications
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Bell icon reminder banner when you login
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedChannels.inApp}
                    onChange={() => toggleChannel('inApp')}
                    className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-green-100 text-green-800 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        WhatsApp Reminder Link
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Direct prefilled alert message on WhatsApp
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedChannels.whatsapp}
                    onChange={() => toggleChannel('whatsapp')}
                    className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Quick Actions & Confirm */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSaveReminder}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Save Reminder Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
