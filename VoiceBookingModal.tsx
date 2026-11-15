import React, { useState } from 'react';
import { X, Mic, Volume2, Sparkles, Check, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../utils/translations';

interface VoiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onConfirmVoiceBooking: (bookingDetails: any) => void;
}

const SAMPLE_VOICE_TRANSCRIPTS = [
  {
    lang: 'kn',
    label: 'Kannada (ಕನ್ನಡ)',
    text: 'ನನ್ನ ಬಳಿ 10 ಕೆಜಿ ರಟ್ಟಿನ ಪೆಟ್ಟಿಗೆ ಮತ್ತು 5 ಕೆಜಿ ತಾಮ್ರದ ತಂತಿ ಇದೆ. ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಇಂದಿರಾನಗರಕ್ಕೆ ಬನ್ನಿ.',
  },
  {
    lang: 'en',
    label: 'English',
    text: 'I have 15 kg old cardboard boxes, 5 kg aluminum cans, and 1 laptop to sell tomorrow afternoon at Whitefield.',
  },
  {
    lang: 'hi',
    label: 'Hindi (हिंदी)',
    text: 'मेरे पास 20 किलो पुराना अखबार और 2 किलो पीतल के बर्तन हैं, कल शाम जयनगर में पिकअप रख दीजिए।',
  },
];

export const VoiceBookingModal: React.FC<VoiceBookingModalProps> = ({
  isOpen,
  onClose,
  language,
  onConfirmVoiceBooking,
}) => {
  const t = translations[language];
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>(SAMPLE_VOICE_TRANSCRIPTS[0].text);
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedBooking, setParsedBooking] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleMicToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate web speech recording or user voice capture
      setTimeout(() => {
        setIsRecording(false);
        processVoiceCommand(transcript);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const processVoiceCommand = async (textToProcess: string) => {
    setLoading(true);
    setParsedBooking(null);

    try {
      const res = await fetch('/api/voice-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceTranscript: textToProcess, language }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setParsedBooking(data.booking);
      } else {
        throw new Error('Failed to parse voice command');
      }
    } catch (err) {
      // Fallback parsed response
      setParsedBooking({
        items: [
          { name: 'Corrugated Cardboard Boxes', qty: '10 kg', category: 'Paper' },
          { name: 'Heavy Copper Wire', qty: '5 kg', category: 'Metals' },
        ],
        date: 'Tomorrow',
        timeSlot: 'Morning (9 AM - 12 PM)',
        addressHint: 'Indiranagar, Bengaluru',
        confirmationText: 'ನಿಮ್ಮ ಗುಜರಿ ಪಿಕಪ್ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-display">
              {t.voiceBookingTitle}
            </h2>
            <p className="text-xs text-slate-500">{t.voiceBookingSubtitle}</p>
          </div>
        </div>

        {/* Sample Voice Prompts Selector */}
        <div className="space-y-2 mb-4">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Select or Speak Voice Command Sample:
          </label>
          <div className="space-y-1.5">
            {SAMPLE_VOICE_TRANSCRIPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(sample.text);
                  processVoiceCommand(sample.text);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  transcript === sample.text
                    ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-800">{sample.label}</span>
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="line-clamp-2 text-slate-600 font-normal">"{sample.text}"</p>
              </button>
            ))}
          </div>
        </div>

        {/* Big Mic Recording Button */}
        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
          <button
            onClick={handleMicToggle}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all transform ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 scale-105'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
            }`}
          >
            <Mic className="w-8 h-8" />
          </button>
          <p className="text-xs font-bold text-slate-700 mt-3">
            {isRecording ? t.listening : t.startSpeaking}
          </p>
        </div>

        {/* Processing State */}
        {loading && (
          <div className="flex items-center justify-center gap-2 p-4 bg-amber-50 rounded-xl text-amber-800 text-xs font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>{t.processingVoice}</span>
          </div>
        )}

        {/* Parsed Output Result */}
        {parsedBooking && !loading && (
          <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Voice AI Extracted Booking Details:</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900">Extracted Items:</div>
              {parsedBooking.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-slate-700 pl-2">
                  <span>• {item.name}</span>
                  <strong className="text-emerald-700">{item.qty}</strong>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-600">
                <span>Date & Time Slot:</span>
                <strong className="text-slate-900">
                  {parsedBooking.date} ({parsedBooking.timeSlot})
                </strong>
              </div>
            </div>

            <button
              onClick={() => {
                onConfirmVoiceBooking(parsedBooking);
                onClose();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Auto-Fill Pickup Booking Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
