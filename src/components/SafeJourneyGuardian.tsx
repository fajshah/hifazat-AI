import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Car,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  Share2,
  CheckCircle2,
  Send,
  Home,
  MapPin,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import L from 'leaflet';
import { SafeJourneyState } from '../types/safety';

interface SafeJourneyGuardianProps {
  language: 'romanUrdu' | 'english';
  location: { lat: number | null; lng: number | null };
  onTriggerSOS: () => void;
}

// Known Karachi route profiles with authentic coordinates & checkpoints
interface KarachiRouteProfile {
  id: string;
  name: string;
  nameUrdu: string;
  origin: string;
  originUrdu: string;
  destination: string;
  destinationUrdu: string;
  startCoords: [number, number];
  endCoords: [number, number];
  routeWaypoints: [number, number][];
  distanceKm: number;
  estimatedMins: number;
  checkpoints: { name: string; nameUrdu: string; note: string; noteUrdu: string }[];
}

const KARACHI_ROUTE_PRESETS: KarachiRouteProfile[] = [
  {
    id: 'fb_to_govhouse',
    name: 'Federal B Area to Governor House',
    nameUrdu: 'فیڈرل بی ایریا سے گورنر ہاؤس، کراچی',
    origin: 'Federal B Area (Ayesha Manzil / Water Pump), Karachi',
    originUrdu: 'فیڈرل بی ایریا (عائشہ منزل و واٹر پمپ)',
    destination: 'Governor House Sindh (Aiwan-e-Sadar Road), Karachi',
    destinationUrdu: 'گورنر ہاؤس سندھ (ایوانِ صدر روڈ، کلفٹن/صدر روڈ لنک)',
    startCoords: [24.9310, 67.0720], // Ayesha Manzil, F.B. Area
    endCoords: [24.8530, 67.0260],   // Governor House Sindh
    routeWaypoints: [
      [24.9310, 67.0720], // Ayesha Manzil, Block 7 F.B Area
      [24.9180, 67.0600], // Karimabad Chowrangi
      [24.9080, 67.0490], // Liaquatabad 10 Flyover (Shahrah-e-Pakistan)
      [24.8870, 67.0410], // Teen Hatti Bridge
      [24.8720, 67.0320], // Guru Mandir / M.A. Jinnah Road Link
      [24.8620, 67.0260], // Saddar / Din Muhammad Wafai Road
      [24.8530, 67.0260], // Governor House Sindh, Red Zone
    ],
    distanceKm: 13.8,
    estimatedMins: 26,
    checkpoints: [
      {
        name: 'Ayesha Manzil & Karimabad (F.B Area)',
        nameUrdu: 'عائشہ منزل و کریم آباد چورنگی (فیڈرل بی ایریا)',
        note: 'High illumination, 24/7 traffic flow, police patrol presence',
        noteUrdu: 'روشن سڑک، مصروف ٹریفک اور تھانہ گلبرگ پٹرولنگ',
      },
      {
        name: 'Liaquatabad No. 10 Flyover',
        nameUrdu: 'لیاقت آباد 10 نمبر فلائی اوور',
        note: 'Stay on the upper main flyover for non-stop safe transit',
        noteUrdu: 'اوپری فلائی اوور استعمال کریں، نیچے والی تنگ گلیوں سے پرہیز کریں',
      },
      {
        name: 'Teen Hatti & Guru Mandir',
        nameUrdu: 'تین ہٹی تا گرومندر و ایم اے جناح روڈ',
        note: 'Traffic wardens active, bright street lights, multiple police pickets',
        noteUrdu: 'ٹریفک پولیس، روشن اسٹریٹ لائٹس اور پٹرولنگ وینز',
      },
      {
        name: 'Saddar & Governor House (Red Zone)',
        nameUrdu: 'صدر تا گورنر ہاؤس (ہائی سیکیورٹی ریڈ زون)',
        note: '24/7 Sindh Police & Rangers checkpoints, maximum security area',
        noteUrdu: 'گورنر ہاؤس کے اطراف 24 گھنٹے رینجرز اور پولیس چوکیاں (انتہائی محفوظ علاقہ)',
      },
    ],
  },
  {
    id: 'ku_to_jauhar',
    name: 'University of Karachi to Gulistan-e-Jauhar',
    nameUrdu: 'جامعہ کراچی سے گلستانِ جوہر',
    origin: 'University of Karachi, University Road',
    originUrdu: 'جامعہ کراچی (سلور جوبلی گیٹ)',
    destination: 'Gulistan-e-Jauhar (Kamran Chowrangi / Block 12)',
    destinationUrdu: 'گلستانِ جوہر (کامران چورنگی و بلاک 12)',
    startCoords: [24.9420, 67.1140],
    endCoords: [24.9150, 67.1350],
    routeWaypoints: [
      [24.9420, 67.1140],
      [24.9280, 67.1180],
      [24.9190, 67.1260],
      [24.9150, 67.1350],
    ],
    distanceKm: 5.2,
    estimatedMins: 14,
    checkpoints: [
      {
        name: 'Silver Jubilee Gate to NIPA',
        nameUrdu: 'سلور جوبلی گیٹ تا نیپا لنک',
        note: 'Main University Road with student buses',
        noteUrdu: 'مین یونیورسٹی روڈ، طلبہ و طالبات کا مصروف روٹ',
      },
      {
        name: 'Jauhar Mor to Kamran Chowrangi',
        nameUrdu: 'جوہر موڑ تا کامران چورنگی',
        note: 'Continuous food street and active police picket',
        noteUrdu: '24 گھنٹے کھلی دکانیں اور پٹرولنگ موبائل',
      },
    ],
  },
  {
    id: 'tariq_to_pechs',
    name: 'Tariq Road to PECHS Block 2',
    nameUrdu: 'طارق روڈ سے پی ای سی ایچ ایس',
    origin: 'Tariq Road Market, Karachi',
    originUrdu: 'طارق روڈ شاپنگ مارکیٹ',
    destination: 'PECHS Block 2 / Shahrah-e-Faisal',
    destinationUrdu: 'پی ای سی ایچ ایس بلاک 2 و شاہراہِ فیصل',
    startCoords: [24.8740, 67.0610],
    endCoords: [24.8660, 67.0680],
    routeWaypoints: [
      [24.8740, 67.0610],
      [24.8700, 67.0640],
      [24.8660, 67.0680],
    ],
    distanceKm: 2.1,
    estimatedMins: 8,
    checkpoints: [
      {
        name: 'Allahwali Chowrangi to Nursery',
        nameUrdu: 'اللہ والی چورنگی تا نرسری',
        note: 'Dense commercial market, female shoppers crowd',
        noteUrdu: 'خواتین کا پرہجوم علاقہ، سی سی ٹی وی کیمرے فعال',
      },
    ],
  },
];

export const SafeJourneyGuardian: React.FC<SafeJourneyGuardianProps> = ({
  language,
  location,
  onTriggerSOS,
}) => {
  const isUrdu = language === 'romanUrdu';

  // Active route preset (default: Federal B Area to Governor House, Karachi)
  const [selectedRoute, setSelectedRoute] = useState<KarachiRouteProfile>(KARACHI_ROUTE_PRESETS[0]);
  const [origin, setOrigin] = useState(KARACHI_ROUTE_PRESETS[0].origin);
  const [destination, setDestination] = useState(KARACHI_ROUTE_PRESETS[0].destination);
  const [vehicleDetails, setVehicleDetails] = useState('Bykea / Indrive / Rikshaw');
  const [durationMinutes, setDurationMinutes] = useState(25);

  const [journey, setJourney] = useState<SafeJourneyState>({
    isActive: false,
    destination: KARACHI_ROUTE_PRESETS[0].destination,
    vehicleDetails: '',
    durationMinutes: 25,
    startedAt: 0,
    expectedArrival: 0,
  });
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

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

    const startCoords = selectedRoute.startCoords;
    const endCoords = selectedRoute.endCoords;
    const waypoints = selectedRoute.routeWaypoints;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView(startCoords, 13);

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

    // Start Position Marker (Federal B Area)
    const startIcon = L.divIcon({
      className: 'start-marker',
      html: `
        <div style="width: 32px; height: 32px; border-radius: 9999px; background: #e11d48; border: 3px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">
          📍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const startMarker = L.marker(startCoords, { icon: startIcon }).addTo(map);
    startMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 3px;">
        <strong style="color: #e11d48; display: block; font-size: 13px;">${isUrdu ? selectedRoute.originUrdu : selectedRoute.origin}</strong>
        <span style="color: #64748b; font-size: 11px;">${isUrdu ? 'شروعاتی نقطہ (کراچی)' : 'Transit Origin (Karachi)'}</span>
      </div>
    `);

    // Destination Marker (Governor House)
    const destIcon = L.divIcon({
      className: 'dest-marker',
      html: `
        <div style="width: 36px; height: 36px; border-radius: 12px; background: #059669; border: 3px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
          🏛️
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const destMarker = L.marker(endCoords, { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 3px;">
        <strong style="color: #059669; display: block; font-size: 13px;">${isUrdu ? selectedRoute.destinationUrdu : selectedRoute.destination}</strong>
        <span style="color: #64748b; font-size: 11px;">${isUrdu ? 'منزل (گورنر ہاؤس ریڈ زون)' : 'Destination (High Security Zone)'}</span>
      </div>
    `);

    // Add Key Checkpoint Markers along the route
    waypoints.slice(1, -1).forEach((pt, idx) => {
      const wpIcon = L.divIcon({
        className: 'waypoint-marker',
        html: `
          <div style="width: 14px; height: 14px; border-radius: 9999px; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const wp = L.marker(pt, { icon: wpIcon }).addTo(map);
      if (selectedRoute.checkpoints[idx]) {
        wp.bindPopup(`
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <strong>${isUrdu ? selectedRoute.checkpoints[idx].nameUrdu : selectedRoute.checkpoints[idx].name}</strong>
            <p style="color: #64748b; margin: 0; font-size: 10px;">${isUrdu ? selectedRoute.checkpoints[idx].noteUrdu : selectedRoute.checkpoints[idx].note}</p>
          </div>
        `);
      }
    });

    // Safe Route Polyline between Start and Destination
    const polyline = L.polyline(waypoints, {
      color: '#e11d48',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [45, 45] });
  }, [selectedRoute, isUrdu]);

  const handleSelectPresetRoute = (route: KarachiRouteProfile) => {
    setSelectedRoute(route);
    setOrigin(route.origin);
    setDestination(route.destination);
    setDurationMinutes(route.estimatedMins);
  };

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
      durationMinutes: 25,
      startedAt: 0,
      expectedArrival: 0,
    });
    setSecondsRemaining(0);
  };

  const handleAddFiveMinutes = () => {
    setSecondsRemaining((s) => s + 300);
  };

  const handleOpenGoogleMapsNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  const handleShareJourneyWhatsApp = () => {
    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    const text = isUrdu
      ? `🚗 میں سفر پر نکل رہی ہوں۔\n📍 روانگی: ${origin}\n🏛️ منزل: ${destination}\n⏱️ متوقع وقت: ${durationMinutes} منٹ۔ گاڑی: ${vehicleDetails || 'رکشہ / رائیڈ'}\nگوگل میپس لائیو روٹ لنک: ${mapUrl}`
      : `🚗 Safe Journey Alert\n📍 From: ${origin}\n🏛️ Destination: ${destination}\n⏱️ ETA: ${durationMinutes} mins. Vehicle: ${vehicleDetails || 'Transit'}\nGoogle Maps Route: ${mapUrl}`;
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
          <div className="flex items-center gap-2">
            <span className="text-xl">🚗</span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{isUrdu ? 'کراچی لائیو روٹ نیویگیشن (Karachi Safe Transit)' : 'Karachi Safe Route & Navigation'}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {selectedRoute.distanceKm} km · {selectedRoute.estimatedMins} mins
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isUrdu
              ? 'فیڈرل بی ایریا (عائشہ منزل) سے گورنر ہاؤس تک کا پورا روٹ، فلائی اوورز اور سیکیورٹی چوکیاں لائیو دیکھیں۔'
              : 'Interactive safe transit route with flyover checkpoints, police radar, and deadman safety check-in.'}
          </p>
        </div>

        <button
          onClick={handleOpenGoogleMapsNavigation}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-rose-600/20 transition-all shrink-0"
        >
          <Navigation className="w-4 h-4" />
          <span>{isUrdu ? 'گوگل میپس میں لائیو راستہ کھولیں' : 'Open in Google Maps'}</span>
        </button>
      </div>

      {/* Quick Karachi Route Selector Chips */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 block">
          {isUrdu ? 'کراچی کے مشہور محفوظ روٹس:' : 'Karachi Quick Routes:'}
        </label>
        <div className="flex flex-wrap gap-2">
          {KARACHI_ROUTE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPresetRoute(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedRoute.id === preset.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{preset.id === 'fb_to_govhouse' ? '🏛️' : '📍'}</span>
              <span>{isUrdu ? preset.nameUrdu : preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Interactive Leaflet Map for Route */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>{isUrdu ? 'کراچی لائیو روٹ میپ (شاہراہِ پاکستان تا گورنر ہاؤس):' : 'Live Karachi Corridor Map:'}</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedRoute.distanceKm} km · ~{selectedRoute.estimatedMins} mins
          </span>
        </div>

        <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner">
          <div
            ref={mapContainerRef}
            className="w-full h-[320px] sm:h-[380px] bg-slate-100 z-10"
          />

          {/* Floating Route Info Bar */}
          <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-md text-xs font-semibold space-y-1">
            <div className="flex items-center gap-1.5 text-rose-700">
              <span>📍</span>
              <span className="font-bold">{isUrdu ? selectedRoute.originUrdu : selectedRoute.origin}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span>🏛️</span>
              <span className="font-bold">{isUrdu ? selectedRoute.destinationUrdu : selectedRoute.destination}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Checkpoints & Security Status */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isUrdu ? 'اس روٹ کے اہم محفوظ مقامات اور چوکیاں:' : 'Key Security Corridors & Checkpoints Along This Route:'}</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {selectedRoute.checkpoints.map((cp, idx) => (
            <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
              <span className="font-bold text-slate-900 block flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span>{isUrdu ? cp.nameUrdu : cp.name}</span>
              </span>
              <p className="text-[11px] text-slate-600 pl-5">
                {isUrdu ? cp.noteUrdu : cp.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {!journey.isActive ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isUrdu ? 'شروعاتی مقام (Origin)' : 'Starting Location'}
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isUrdu ? 'منزل (Destination)' : 'Destination'}
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isUrdu ? 'گاڑی / رکشہ نمبر یا ڈرائیور کی تفصیل' : 'Vehicle / Rickshaw Plate # or Ride Note'}
              </label>
              <input
                type="text"
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
                placeholder={isUrdu ? 'مثلاً: یانگو کار LE-392 یا گرین رکشہ' : 'e.g. InDrive White Alto KHI-8291'}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isUrdu ? 'متوقع وقت (منٹ):' : 'Expected Duration (Minutes):'}
              </label>
              <div className="flex items-center gap-2">
                {[15, 20, 25, 30, 45].map((mins) => (
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
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleStartJourney}
              className="flex-1 w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isUrdu ? 'محفوظ سفر شروع کریں (فیڈرل بی تا گورنر ہاؤس)' : 'Activate Safe Transit Monitoring'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGoogleMapsNavigation}
              className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Navigation className="w-4 h-4 text-rose-400" />
              <span>{isUrdu ? 'گوگل میپس میں راستہ دیکھیں' : 'Google Navigation'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Journey Running Screen */
        <div className="p-6 rounded-3xl bg-rose-50/60 border-2 border-rose-300 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{isUrdu ? 'فیڈرل بی ایریا تا گورنر ہاؤس لائیو نگرانی فعال' : 'Live Karachi Journey Active'}</span>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              {isUrdu ? 'پہنچنے کا باقی ماندہ وقت (سیفٹی ٹائمر):' : 'Deadman Check-In Countdown:'}
            </span>
            <div className="text-5xl font-black font-mono text-rose-700 tracking-tight my-2">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {isUrdu
                ? `روانگی: ${origin} ➔ منزل: ${destination}`
                : `From: ${origin} ➔ To: ${destination}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleAddFiveMinutes}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              {isUrdu ? '+5 منٹ کا اضافہ (ٹریفک تاخیر)' : '+5 Minutes Delay'}
            </button>

            <button
              onClick={handleOpenGoogleMapsNavigation}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'گوگل میپس راستہ' : 'Turn-by-Turn GPS'}</span>
            </button>

            <button
              onClick={handleShareJourneyWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'فیملی کو واٹس ایپ پر بھیجیں' : 'Share with Family'}</span>
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
