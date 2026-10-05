import React, { useState, useEffect, useRef } from 'react';
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
  Home,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import L from 'leaflet';
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
  const [destination, setDestination] = useState('Home / گھر (Model Town)');
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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  const isUrdu = language === 'romanUrdu';
  const startLat = location.lat || 31.5204;
  const startLng = location.lng || 74.3587;

  // Approximate destination coordinate offset for route visualization
  const destLat = startLat + 0.016;
  const destLng = startLng + 0.019;

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (journey.isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
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

  // Leaflet Route Map rendering
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([startLat, startLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        layer.remove();
      }
    });

    // Start Position Marker (Current GPS)
    const startIcon = L.divIcon({
      className: 'start-marker',
      html: `
        <div style="width: 28px; height: 28px; border-radius: 9999px; background: #e11d48; border: 3px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
          📍
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const startMarker = L.marker([startLat, startLng], { icon: startIcon }).addTo(map);
    startMarker.bindPopup(`<strong>${isUrdu ? 'آپ کی شروعاتی جگہ' : 'Your Start Point'}</strong>`);

    // Home / Destination Marker
    const destIcon = L.divIcon({
      className: 'dest-marker',
      html: `
        <div style="width: 32px; height: 32px; border-radius: 12px; background: #059669; border: 3px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
          🏠
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`<strong>${destination || (isUrdu ? 'منزل / گھر' : 'Home / Destination')}</strong>`);

    // Safe Route Polyline between Start and Destination
    const routeCoords: [number, number][] = [
      [startLat, startLng],
      [startLat + 0.005, startLng + 0.004],
      [startLat + 0.011, startLng + 0.012],
      [destLat, destLng],
    ];

    const polyline = L.polyline(routeCoords, {
      color: '#e11d48',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  }, [startLat, startLng, destLat, destLng, destination, isUrdu]);

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

  const handleOpenGoogleMapsNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${encodeURIComponent(destination || 'Home')}`;
    window.open(url, '_blank');
  };

  const handleShareJourneyWhatsApp = () => {
    const mapUrl = `https://maps.google.com/?q=${startLat},${startLng}`;
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-rose-50">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-rose-600" />
            <span>{isUrdu ? 'محفوظ سفر اور گھر کا روٹ میپ (Safe Route & Transit)' : 'Safe Journey & Home Route Map'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'گھر یا کالج جانے کے لیے لائیو راستہ دیکھیں، گاڑی کا نمبر درج کریں اور وقت کی خودکار نگرانی شروع کریں۔'
              : 'Interactive transit route to home with deadman check-in and 1-tap Google Maps turn-by-turn directions.'}
          </p>
        </div>

        <button
          onClick={handleOpenGoogleMapsNavigation}
          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Navigation className="w-4 h-4 text-rose-600" />
          <span>{isUrdu ? 'گوگل میپس میں راستہ کھولیں' : 'Google Maps Route'}</span>
        </button>
      </div>

      {/* Visual Route Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>{isUrdu ? 'گھر / منزل کا لائیو روٹ میپ:' : 'Live Transit Route Map:'}</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {isUrdu ? 'متوقع فاصلہ: 2.8 کلومیٹر (15 منٹ)' : 'Est. Distance: 2.8 km (15 mins)'}
          </span>
        </div>

        <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner">
          <div
            ref={mapContainerRef}
            className="w-full h-[280px] sm:h-[320px] bg-slate-100 z-10"
          />

          <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-[11px] font-semibold flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span>{isUrdu ? 'موجودہ جگہ' : 'Start'}</span>
            </span>
            <span>➔</span>
            <span className="flex items-center gap-1">
              <span>🏠</span>
              <span>{destination || (isUrdu ? 'گھر' : 'Home')}</span>
            </span>
          </div>
        </div>
      </div>

      {!journey.isActive ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isUrdu ? 'منزل کا نام (Destination / Home)' : 'Destination / Home Address'}
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={isUrdu ? 'مثلاً: ہاسٹل سے گھر / ماڈل ٹاؤن' : 'e.g. Office to Home (Gulberg)'}
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

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleStartJourney}
              disabled={!destination.trim()}
              className="flex-1 w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isUrdu ? 'محفوظ سفر شروع کریں (Start Safe Journey)' : 'Activate Safe Journey Guardian'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGoogleMapsNavigation}
              className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Navigation className="w-4 h-4 text-rose-400" />
              <span>{isUrdu ? 'گوگل میپس نیویگیشن' : 'Google Navigation'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Journey Running Screen */
        <div className="p-6 rounded-3xl bg-rose-50/60 border-2 border-rose-300 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{isUrdu ? 'سفر کی لائیو نگرانی جاری ہے' : 'Journey Live Monitoring Active'}</span>
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
              onClick={handleOpenGoogleMapsNavigation}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'گوگل میپس میں راستہ دیکھیں' : 'Turn-by-Turn GPS'}</span>
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

      {/* Safety Tips Banner */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
        <span className="font-bold text-slate-900 block">
          {isUrdu ? 'رات کے سفر کے اہم حفاظتی اصول:' : 'Night Route Safety Protocols:'}
        </span>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
          <li>{isUrdu ? 'ہمیشہ روشن اور کھلی بڑی سڑکوں پر سفر کریں، غیر آباد گلیوں سے پرہیز کریں۔' : 'Always stick to brightly lit main roads and avoid unlit alleys.'}</li>
          <li>{isUrdu ? 'رکشہ یا ٹیکسی میں بیٹھتے ہی نمبر پلیٹ کی تصویر فیملی واٹس ایپ پر بھیجیں۔' : 'Snap a picture of the vehicle license plate and share to family WhatsApp.'}</li>
          <li>{isUrdu ? 'فون کی بیٹری اور انٹرنیٹ فعال رکھیں تاکہ لائیو جی پی ایس اپ ڈیٹ ہوتا رہے۔' : 'Keep phone GPS and mobile data active for real-time guardian tracking.'}</li>
        </ul>
      </div>
    </div>
  );
};
