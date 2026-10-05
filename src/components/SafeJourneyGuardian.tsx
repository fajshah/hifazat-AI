import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Car,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  Square,
  Share2,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { SafeJourneyState } from '../types/safety';

interface SafeJourneyGuardianProps {
  language: 'romanUrdu' | 'english';
  location: { lat: number | null; lng: number | null };
  onTriggerSOS: () => void;
}

export const SafeJourneyGuardian: React.FC<SafeJourneyGuardianProps> = ({
  language,
  location,
  onTriggerSOS,
}) => {
  const [destination, setDestination] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [journey, setJourney] = useState<SafeJourneyState>({
    isActive: false,
    destination: '',
    vehicleDetails: '',
    durationMinutes: 20,
    startedAt: 0,
    expectedArrival: 0,
  });
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const isUrdu = language === 'romanUrdu';

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (journey.isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Timer expired without checkin! Trigger emergency
            onTriggerSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [journey.isActive, secondsRemaining, onTriggerSOS]);

  const handleStartJourney = () => {
    if (!destination.trim()) return;
    const totalSecs = durationMinutes * 60;
    setJourney({
      isActive: true,
      destination,
      vehicleDetails,
      durationMinutes,
      startedAt: Date.now(),
      expectedArrival: Date.now() + totalSecs * 1000,
    });
    setSecondsRemaining(totalSecs);
  };

  const handleEndJourneySafe = () => {
    setJourney({
      isActive: false,
      destination: '',
      vehicleDetails: '',
      durationMinutes: 20,
      startedAt: 0,
      expectedArrival: 0,
    });
    setSecondsRemaining(0);
  };

  const handleAddFiveMinutes = () => {
    setSecondsRemaining((s) => s + 300);
  };

  const handleShareJourneyWhatsApp = () => {
    const mapUrl = location.lat ? `https://maps.google.com/?q=${location.lat},${location.lng}` : '';
    const text = isUrdu
      ? `🚗 میں سفر پر نکل رہی ہوں۔ منزل: "${destination}"۔ گاڑی کی تفصیل: "${vehicleDetails || 'پیدل / رکشہ'}"۔ متوقع وقت: ${durationMinutes} منٹ۔ اگر میں وقت پر فون نہ اٹھاؤں تو مجھ سے رابطہ کریں۔ لائیو لوکیشن: ${mapUrl}`
      : `🚗 I started a journey to "${destination}". Vehicle details: "${vehicleDetails || 'Walking/Ride'}". Expected travel time: ${durationMinutes} mins. Tracking link: ${mapUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-rose-50">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Car className="w-5 h-5 text-rose-600" />
          <span>{isUrdu ? 'محفوظ سفر نگہبان (Safe Ride & Walk Guardian)' : 'Safe Journey Guardian'}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isUrdu
            ? 'رکشہ، ٹیکسی، یا پیدل سفر کا ٹائمر اور گاڑی کی تفصیل درج کریں۔ وقت ختم ہونے پر خیریت کنفرم نہ کرنے کی صورت میں خودکار ایمرجنسی الرٹ جائے گا۔'
            : 'Track your transit in real-time. If you don’t confirm safe arrival before the countdown ends, emergency alerts are dispatched.'}
        </p>
      </div>

      {!journey.isActive ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isUrdu ? 'منزل کا نام (Destination)' : 'Destination / Route'}
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={isUrdu ? 'مثلاً: ہاسٹل سے گھر / لبرٹی مارکیٹ' : 'e.g. Office to Home'}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isUrdu ? 'گاڑی / رکشہ نمبر یا حلیہ (Vehicle / Plate #)' : 'Vehicle / Plate # / Driver Note'}
              </label>
              <input
                type="text"
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
                placeholder={isUrdu ? 'مثلاً: پیلا رکشہ پلیٹ LEB-893 یا Indrive کار' : 'e.g. White Corolla LE-4029 or Rickshaw'}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isUrdu ? 'متوقع وقت (پہنچنے کا وقت):' : 'Expected Duration (Check-in window):'}
            </label>
            <div className="flex items-center gap-2">
              {[10, 15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    durationMinutes === mins
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartJourney}
              disabled={!destination.trim()}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isUrdu ? 'محفوظ سفر شروع کریں (Start Safe Journey)' : 'Activate Safe Journey Guardian'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Journey Running Screen */
        <div className="p-6 rounded-3xl bg-rose-50/60 border-2 border-rose-300 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{isUrdu ? 'سفر کی نگرانی جاری ہے' : 'Journey Live Monitoring Active'}</span>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              {isUrdu ? 'باقی ماندہ وقت (سیفٹی کاؤنٹ ڈاؤن):' : 'Time Remaining to Safe Check-In:'}
            </span>
            <div className="text-5xl font-black font-mono text-rose-700 tracking-tight my-2">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-xs text-slate-600">
              {isUrdu ? `منزل: ${journey.destination}` : `Heading to: ${journey.destination}`}
              {journey.vehicleDetails && ` · ${journey.vehicleDetails}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleAddFiveMinutes}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              {isUrdu ? '+5 منٹ کا اضافہ' : '+5 Minutes'}
            </button>

            <button
              onClick={handleShareJourneyWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'رشتہ داروں کو شیئر کریں' : 'Share with Family'}</span>
            </button>

            <button
              onClick={handleEndJourneySafe}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isUrdu ? 'خیریت سے پہنچ گئی (I am Safe)' : 'Arrived Safely'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
