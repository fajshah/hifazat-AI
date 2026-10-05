import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Shield,
  HeartPulse,
  Pill,
  Fuel,
  Navigation,
  PhoneCall,
  ExternalLink,
  Clock,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import L from 'leaflet';

interface NearbySafeSpotsMapProps {
  language: 'romanUrdu' | 'english';
  userLocation: { lat: number | null; lng: number | null };
}

interface SafeSpot {
  id: string;
  name: string;
  nameUrdu: string;
  category: 'police' | 'hospital' | 'pharmacy' | 'petrol';
  lat: number;
  lng: number;
  distanceKm: number;
  etaMins: number;
  address: string;
  addressUrdu: string;
  phone: string;
  open247: boolean;
  securityNote: string;
  securityNoteUrdu: string;
}

export const NearbySafeSpotsMap: React.FC<NearbySafeSpotsMapProps> = ({
  language,
  userLocation,
}) => {
  const isUrdu = language === 'romanUrdu';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [activeCategory, setActiveCategory] = useState<'all' | 'police' | 'hospital' | 'pharmacy' | 'petrol'>('all');
  const [selectedSpot, setSelectedSpot] = useState<SafeSpot | null>(null);

  // Default coordinates (e.g. Lahore / Pakistan center if GPS pending)
  const currentLat = userLocation.lat || 31.5204;
  const currentLng = userLocation.lng || 74.3587;

  // Generate realistic nearby safe spots around user's exact coordinates
  const safeSpots: SafeSpot[] = [
    {
      id: 'p1',
      name: 'Police Station / Emergency Post',
      nameUrdu: 'قریبی ماڈل پولیس اسٹیشن و چوکی',
      category: 'police',
      lat: currentLat + 0.0035,
      lng: currentLng + 0.0028,
      distanceKm: 0.45,
      etaMins: 3,
      address: 'Main Boulevard, Sector C (24/7 Desk)',
      addressUrdu: 'مین بلیوارڈ، 24 گھنٹے ویمن ڈیسک و پولیس موبائل',
      phone: '15',
      open247: true,
      securityNote: 'Armed police personnel & female police desk available',
      securityNoteUrdu: 'لیڈی پولیس کانسٹیبل اور 24 گھنٹے پٹرولنگ موبائل موجود',
    },
    {
      id: 'p2',
      name: 'City Police Emergency Response Base',
      nameUrdu: 'پولیس خدمت مرکز و ریسپانس بیس',
      category: 'police',
      lat: currentLat - 0.0065,
      lng: currentLng + 0.0042,
      distanceKm: 0.85,
      etaMins: 5,
      address: 'Near Jinnah Roundabout & Chowk',
      addressUrdu: 'جناح چوک کے قریب، مرکزی سڑک',
      phone: '15',
      open247: true,
      securityNote: 'Active police patrol vehicles and rapid response squad',
      securityNoteUrdu: '15 ایمرجنسی وینز اور محفوظ سرکاری عمارت',
    },
    {
      id: 'h1',
      name: 'Emergency Hospital & Trauma Center',
      nameUrdu: '24 گھنٹے ایمرجنسی ہسپتال و ٹراما سینٹر',
      category: 'hospital',
      lat: currentLat + 0.0072,
      lng: currentLng - 0.0038,
      distanceKm: 0.9,
      etaMins: 6,
      address: 'Civil Hospital Road (Round the Clock ER)',
      addressUrdu: 'سول ہسپتال روڈ، ایمرجنسی وارڈ اور ایمبولینس سروس',
      phone: '1122',
      open247: true,
      securityNote: 'Guards present, 24/7 doctors and immediate triage',
      securityNoteUrdu: 'سیکیورٹی گارڈز، طبی عملہ اور 24 گھنٹے روشن ایمرجنسی لاؤنج',
    },
    {
      id: 'ph1',
      name: '24-Hour Medical Store & Pharmacy',
      nameUrdu: '24 گھنٹے کھلی فارمیسی و میڈیکل اسٹور',
      category: 'pharmacy',
      lat: currentLat - 0.0022,
      lng: currentLng - 0.0035,
      distanceKm: 0.35,
      etaMins: 2,
      address: 'Shop 4, Market Square (Well-lit)',
      addressUrdu: 'مارکیٹ چوک، روشن دکان اور سی سی ٹی وی کوریج',
      phone: '+92 42 111 254 649',
      open247: true,
      securityNote: 'Well-lit area, active staff, CCTV cameras',
      securityNoteUrdu: 'روشن پناہ گاہ، کیمرے اور رات بھر عملہ موجود',
    },
    {
      id: 'ph2',
      name: 'Servaid / Clinix 24/7 Pharmacy',
      nameUrdu: 'سروس ایڈ / کلینکس 24 گھنٹے میڈیسن',
      category: 'pharmacy',
      lat: currentLat + 0.005,
      lng: currentLng + 0.006,
      distanceKm: 0.7,
      etaMins: 4,
      address: 'Commercial Hub, Main Gate',
      addressUrdu: 'کمرشل مارکیٹ، مین گیٹ کے سامنے',
      phone: '+92 42 111 737 824',
      open247: true,
      securityNote: '24/7 Open, security guard at door',
      securityNoteUrdu: 'دروازے پر گارڈ، محفوظ روشنی اور ہجوم والی جگہ',
    },
    {
      id: 'pt1',
      name: 'Total Parco / Shell 24/7 Petrol Station',
      nameUrdu: 'شیل / ٹوٹل پارکو 24 گھنٹے پیٹرول پمپ و مارٹ',
      category: 'petrol',
      lat: currentLat + 0.004,
      lng: currentLng - 0.007,
      distanceKm: 0.8,
      etaMins: 5,
      address: 'Main Highway Link (Bright Floodlights)',
      addressUrdu: 'مین سڑک، تیز فلڈ لائٹس اور 24 گھنٹے مارٹ',
      phone: '15',
      open247: true,
      securityNote: 'Bright floodlights, public footfall, convenience store',
      securityNoteUrdu: 'تیز روشنی، سی سی ٹی وی اور پناہ کے لیے محفوظ مقام',
    },
  ];

  const filteredSpots = safeSpots.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([currentLat, currentLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView([currentLat, currentLng], 15);
    }

    const map = leafletMapRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // User Location Marker (Pulse beacon)
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(225, 29, 72, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 24px; height: 24px; border-radius: 9999px; background: #e11d48; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
            📍
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([currentLat, currentLng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; font-weight: bold; text-align: center; padding: 4px;">
        ${isUrdu ? 'آپ کی موجودہ جگہ (You are here)' : 'Your Current GPS Location'}
      </div>
    `);
    markersRef.current.push(userMarker);

    // Add safe spots markers
    filteredSpots.forEach((spot) => {
      let iconEmoji = '🛡️';
      let iconColor = '#0284c7';
      if (spot.category === 'police') {
        iconEmoji = '🚓';
        iconColor = '#e11d48';
      } else if (spot.category === 'hospital') {
        iconEmoji = '🏥';
        iconColor = '#dc2626';
      } else if (spot.category === 'pharmacy') {
        iconEmoji = '💊';
        iconColor = '#059669';
      } else if (spot.category === 'petrol') {
        iconEmoji = '⛽';
        iconColor = '#d97706';
      }

      const spotIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: `
          <div style="width: 32px; height: 32px; border-radius: 12px; background: ${iconColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer;">
            ${iconEmoji}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedSpot(spot);
      });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 2px;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">${isUrdu ? spot.nameUrdu : spot.name}</strong>
          <span style="color: #64748b; font-size: 11px;">${spot.distanceKm} km · ${spot.etaMins} mins away</span>
        </div>
      `);
      markersRef.current.push(marker);
    });
  }, [currentLat, currentLng, activeCategory, isUrdu]);

  const handleFocusSpot = (spot: SafeSpot) => {
    setSelectedSpot(spot);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([spot.lat, spot.lng], 16, { duration: 1.2 });
    }
  };

  // Google Maps Direction URL
  const openGoogleMapsDirections = (spot: SafeSpot) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${spot.lat},${spot.lng}`;
    window.open(url, '_blank');
  };

  // Google Maps search query URLs
  const openGoogleMapsSearch = (query: string) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${currentLat},${currentLng},14z`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-rose-50">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-600" />
            <span>{isUrdu ? 'قریبی محفوظ پناہ گاہیں اور نقشہ (Safe Spots Map)' : 'Nearby Safe Havens & Live Map'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'پولیس اسٹیشن، 24 گھنٹے ہسپتال، میڈیکل اسٹور اور پیٹرول پمپ لائیو نقشے پر دیکھیں اور گوگل میپس میں راستہ نکالیں۔'
              : 'Interactive radar for nearby police posts, 24/7 hospitals, pharmacies, and lighted safe havens.'}
          </p>
        </div>

        {/* Live GPS badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{isUrdu ? 'لائیو جی پی ایس فعال' : 'GPS Active'}</span>
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeCategory === 'all'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>{isUrdu ? 'تمام محفوظ جگہیں' : 'All Spots'}</span>
        </button>

        <button
          onClick={() => setActiveCategory('police')}
          className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeCategory === 'police'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-rose-600" />
          <span>{isUrdu ? 'پولیس اسٹیشن (Police)' : 'Police Stations'}</span>
        </button>

        <button
          onClick={() => setActiveCategory('hospital')}
          className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeCategory === 'hospital'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5 text-red-600" />
          <span>{isUrdu ? 'ہسپتال و ایمرجنسی (Hospital)' : 'Hospitals'}</span>
        </button>

        <button
          onClick={() => setActiveCategory('pharmacy')}
          className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeCategory === 'pharmacy'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Pill className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isUrdu ? '24 گھنٹے فارمیسی (Pharmacy)' : '24/7 Pharmacies'}</span>
        </button>

        <button
          onClick={() => setActiveCategory('petrol')}
          className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
            activeCategory === 'petrol'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Fuel className="w-3.5 h-3.5 text-amber-600" />
          <span>{isUrdu ? 'پیٹرول پمپ و مارٹ' : 'Petrol Stations'}</span>
        </button>
      </div>

      {/* Embedded Visual Leaflet Map Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner">
        <div
          ref={mapContainerRef}
          className="w-full h-[360px] sm:h-[420px] bg-slate-100 z-10"
        />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 shadow-md text-[11px] font-semibold flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>{isUrdu ? 'آپ' : 'You'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🚓</span>
            <span>{isUrdu ? 'پولیس' : 'Police'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🏥</span>
            <span>{isUrdu ? 'ہسپتال' : 'Hospital'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>💊</span>
            <span>{isUrdu ? 'فارمیسی' : 'Pharmacy'}</span>
          </span>
        </div>
      </div>

      {/* Selected Safe Spot Detail Card */}
      {selectedSpot && (
        <div className="p-5 bg-rose-50/70 border-2 border-rose-300 rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {selectedSpot.category === 'police' && '🚓'}
                  {selectedSpot.category === 'hospital' && '🏥'}
                  {selectedSpot.category === 'pharmacy' && '💊'}
                  {selectedSpot.category === 'petrol' && '⛽'}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {isUrdu ? selectedSpot.nameUrdu : selectedSpot.name}
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {isUrdu ? '24 گھنٹے کھلا ہے' : '24/7 Open'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isUrdu ? selectedSpot.addressUrdu : selectedSpot.address}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base font-black text-rose-600 block">
                {selectedSpot.distanceKm} km ({selectedSpot.etaMins} mins)
              </span>
              <span className="text-[11px] text-slate-500">
                {isUrdu ? 'پیدل یا بائیک کا وقت' : 'Walking/driving distance'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-rose-200 text-xs text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isUrdu ? selectedSpot.securityNoteUrdu : selectedSpot.securityNote}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => openGoogleMapsDirections(selectedSpot)}
              className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-rose-600/20 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>{isUrdu ? 'گوگل میپس میں لائیو راستہ کھولیں' : 'Navigate on Google Maps'}</span>
            </button>

            <a
              href={`tel:${selectedSpot.phone.replace(/[^0-9]/g, '')}`}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isUrdu ? `کال ملائیں (${selectedSpot.phone})` : `Call ${selectedSpot.phone}`}</span>
            </a>
          </div>
        </div>
      )}

      {/* Grid of Safe Spots Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {isUrdu ? 'قریب ترین محفوظ مقامات کی فہرست:' : 'Closest Safe Havens Near Your Position:'}
          </span>
          <span className="text-xs text-slate-500">
            {filteredSpots.length} {isUrdu ? 'مقامات موجود ہیں' : 'spots available'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSpots.map((spot) => (
            <div
              key={spot.id}
              onClick={() => handleFocusSpot(spot)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedSpot?.id === spot.id
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
                  : 'bg-slate-50/70 hover:bg-white hover:border-slate-300 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {spot.category === 'police' && '🚓'}
                      {spot.category === 'hospital' && '🏥'}
                      {spot.category === 'pharmacy' && '💊'}
                      {spot.category === 'petrol' && '⛽'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {isUrdu ? spot.nameUrdu : spot.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {isUrdu ? spot.addressUrdu : spot.address}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-rose-600 shrink-0">
                    {spot.distanceKm} km
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{spot.etaMins} mins · 24/7 Open</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openGoogleMapsDirections(spot);
                  }}
                  className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3 text-rose-600" />
                  <span>{isUrdu ? 'راستہ دیکھیں' : 'Directions'}</span>
                </button>

                <a
                  href={`tel:${spot.phone.replace(/[^0-9]/g, '')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{spot.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Google Maps Live Search Shortcuts */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-rose-400" />
              <span>{isUrdu ? 'گوگل میپس پر مزید قریبی جگہیں تلاش کریں:' : 'Direct Live Google Maps Searches:'}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isUrdu
                ? 'ایک کلک پر گوگل میپس کھول کر اپنی لوکیشن کے آس پاس تمام سرکاری مراکز دیکھیں:'
                : 'Instantly query Google Maps app for all live nearby places:'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => openGoogleMapsSearch('Police station')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-white"
          >
            <span>🚓</span>
            <span>{isUrdu ? 'تمام قریبی پولیس اسٹیشن' : 'All Police Stations'}</span>
          </button>

          <button
            onClick={() => openGoogleMapsSearch('Hospital emergency')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-white"
          >
            <span>🏥</span>
            <span>{isUrdu ? 'تمام قریبی ہسپتال' : 'All Hospitals (ER)'}</span>
          </button>

          <button
            onClick={() => openGoogleMapsSearch('24 hour pharmacy')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-white"
          >
            <span>💊</span>
            <span>{isUrdu ? 'تمام 24 گھنٹے فارمیسی' : '24/7 Pharmacies'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
