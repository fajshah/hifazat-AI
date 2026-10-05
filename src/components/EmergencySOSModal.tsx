import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Volume2,
  VolumeX,
  MapPin,
  Share2,
  PhoneCall,
  X,
  ShieldAlert,
  Send,
  Check,
} from 'lucide-react';
import { startEmergencySiren, stopEmergencySiren } from '../utils/audioAlerts';
import { EmergencyContact } from '../types/safety';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number | null; lng: number | null; address?: string };
  contacts: EmergencyContact[];
  language: 'romanUrdu' | 'english';
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  location,
  contacts,
  language,
}) => {
  const [isSirenActive, setIsSirenActive] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const isUrdu = language === 'romanUrdu';

  const mapLink = location.lat && location.lng
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : 'https://maps.google.com';

  const defaultSOSMessage = isUrdu
    ? `🚨 ایمرجنسی خطرہ! برائے مہربانی فوری مدد بھیجیں، میں خطرے میں ہوں۔ میری لائیو لوکیشن: ${mapLink}۔ فوری پولیس 15 کو کال کریں۔`
    : `🚨 EMERGENCY SOS! I am in immediate danger and need urgent help. My live GPS location: ${mapLink}. Please alert police (15) and call me immediately!`;

  useEffect(() => {
    if (isOpen) {
      if (isSirenActive) {
        startEmergencySiren();
      }
    } else {
      stopEmergencySiren();
    }

    return () => {
      stopEmergencySiren();
    };
  }, [isOpen, isSirenActive]);

  if (!isOpen) return null;

  const toggleSiren = () => {
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      startEmergencySiren();
      setIsSirenActive(true);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(defaultSOSMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(defaultSOSMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleClose = () => {
    stopEmergencySiren();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-rose-500 shadow-2xl overflow-hidden flex flex-col">
        {/* Urgent Header */}
        <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">
                {isUrdu ? 'ایمرجنسی خطرہ (ACTIVE SOS)' : 'EMERGENCY SOS ACTIVE'}
              </h2>
              <p className="text-xs text-rose-100">
                {isUrdu ? 'لائیو لوکیشن اور الارم فعال ہے' : 'Live GPS & Distress Broadcast Triggered'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Siren Control Banner */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-900 block">
                {isSirenActive
                  ? (isUrdu ? 'بلند خطرے کا سائرن بج رہا ہے' : 'Loud Distress Siren Playing')
                  : (isUrdu ? 'خاموش الرٹ (Silent Stealth SOS)' : 'Silent Stealth Distress')}
              </span>
              <p className="text-[11px] text-rose-700 mt-0.5">
                {isSirenActive
                  ? (isUrdu ? 'آس پاس کے لوگوں کو متوجہ کرنے کے لیے' : 'Deterring harassers and alerting public')
                  : (isUrdu ? 'خفیہ مدد بھیجنے کے لیے آواز بند ہے' : 'Audio muted for quiet discreet distress')}
              </p>
            </div>

            <button
              onClick={toggleSiren}
              className={`p-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                isSirenActive
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {isSirenActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span>{isSirenActive ? (isUrdu ? 'سائرن بند کریں' : 'Mute') : (isUrdu ? 'سائرن چلائیں' : 'Sound Siren')}</span>
            </button>
          </div>

          {/* Live Location Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>{isUrdu ? 'آپ کی موجودہ لائیو لوکیشن' : 'Your Live Coordinates'}</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                GPS Fixed
              </span>
            </div>

            <div className="font-mono text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 truncate">
              {mapLink}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopyLocation}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (isUrdu ? 'کاپی ہوگیا!' : 'Copied!') : (isUrdu ? 'پیغام کاپی کریں' : 'Copy SOS Text')}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'واٹس ایپ پر بھیجیں' : 'WhatsApp SOS'}</span>
              </button>
            </div>
          </div>

          {/* Rapid Calling Bar */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              {isUrdu ? 'فوری کال ملائیں (1-Tap Dial):' : 'Emergency 1-Tap Dialing:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:15"
                className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Police Helpline 15</span>
              </a>

              <a
                href="tel:1043"
                className="p-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Women 1043</span>
              </a>
            </div>

            {/* Primary Guardian Call */}
            {contacts.length > 0 && (
              <div className="mt-2">
                <a
                  href={`tel:${contacts[0].phone}`}
                  className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isUrdu ? `کال ${contacts[0].name} (${contacts[0].relationship}): ${contacts[0].phone}` : `Call ${contacts[0].name} (${contacts[0].relationship})`}
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer cancel button */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            {isUrdu ? 'خطرہ ختم / بند کریں' : 'I am Safe / Deactivate SOS'}
          </button>
        </div>
      </div>
    </div>
  );
};
