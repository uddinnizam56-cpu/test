import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Phone,
  CheckCheck,
  Sparkles,
  Truck,
  Building2,
  DollarSign,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Language } from '../types';

interface WhatsAppChatWidgetProps {
  language?: Language;
  defaultCategory?: string;
}

export const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Namaskara! Welcome to PunarChakra WhatsApp Support 🌿. How can we help you today?',
      time: 'Just now',
    },
  ]);

  const WHATSAPP_NUMBER = '919886012345';

  const quickPrompts = [
    { label: '🛺 Book Scrap Pickup', text: 'Hi PunarChakra! I want to schedule a scrap pickup at my doorstep.' },
    { label: '🏭 Industrial Bulk Quote', text: 'Hello, our factory needs a bulk scrap valuation & container truck dispatch.' },
    { label: '📈 Check Today Scrap Rates', text: 'Hi, what is the current market scrap rate for copper, brass, and aluminum?' },
    { label: '📦 Track My Order', text: 'Hi, I want to check the live status of my scrap collection executive.' },
  ];

  const handleSendCustomMessage = (textToSend = message) => {
    if (!textToSend.trim()) return;

    const userText = textToSend;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatHistory((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setMessage('');

    // Simulate instant assistant response
    setTimeout(() => {
      let botReply = "Thank you for reaching out! Our dispatch team is reviewing your message. Connecting you to our live WhatsApp agent...";
      if (userText.toLowerCase().includes('rate')) {
        botReply = "Today's dynamic market rates: Copper: ₹720/kg, Brass: ₹490/kg, Aluminum: ₹190/kg, Iron: ₹38/kg, Cardboard: ₹16/kg. You can also view these live on our portal!";
      } else if (userText.toLowerCase().includes('bulk') || userText.toLowerCase().includes('factory')) {
        botReply = "Our B2B Industrial Division handles multi-ton industrial scrap with GST invoicing and EPR certification. We have assigned a priority B2B coordinator to you.";
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  const handleOpenNativeWhatsApp = (customText?: string) => {
    const text = customText || message || 'Hi PunarChakra, I need assistance with scrap recycling.';
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* WhatsApp Chat Popover */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center font-black shadow-md">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-2.001-.462-1.666-.69-2.733-2.39-2.816-2.501-.083-.111-.676-.901-.676-1.719 0-.819.431-1.222.585-1.39.155-.168.337-.21.45-.21.112 0 .225.001.323.006.104.005.244-.039.38.291.144.35.492 1.2.535 1.288.043.088.072.19.014.305-.058.115-.087.187-.174.289-.087.102-.183.228-.261.306-.088.087-.18.182-.077.359.102.176.455.751.977 1.217.672.599 1.238.784 1.414.872.176.088.279.076.383-.043.104-.12.446-.52.565-.699.12-.178.239-.149.401-.089.162.06 1.026.484 1.203.573.177.088.294.132.338.207.044.075.044.436-.1.841z" />
                  </svg>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white">PunarChakra Support</h4>
                  <span className="text-[10px] bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-1.5 py-0.2 rounded font-bold">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Instant Response (&lt; 2 mins)</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 bg-[#ECE5DD] flex-1 max-h-[280px] overflow-y-auto space-y-3 text-xs">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#DCF8C6] text-slate-800 rounded-br-xs'
                      : 'bg-white text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-semibold">
                    <span>{msg.time}</span>
                    {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-sky-600" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reply Chips */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendCustomMessage(q.text)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold rounded-full border border-slate-200 hover:border-emerald-300 transition-all whitespace-nowrap shadow-2xs"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input & Send Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCustomMessage()}
              placeholder="Type message or question..."
              className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />

            <button
              onClick={() => handleSendCustomMessage()}
              disabled={!message.trim()}
              className="p-2 bg-[#128C7E] hover:bg-[#075E54] disabled:bg-slate-300 text-white rounded-xl transition-all shadow-xs"
              title="Send In-App"
            >
              <Send className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleOpenNativeWhatsApp()}
              className="px-2.5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-[10px] font-black flex items-center gap-1 shadow-xs transition-all"
              title="Open in WhatsApp Web / App"
            >
              <span>App</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-xl hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
        title="Chat with PunarChakra on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>

        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span className="hidden sm:inline text-xs font-black tracking-wide pr-1">
          WhatsApp Support
        </span>
      </button>
    </div>
  );
};
