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
  Search,
  Building2,
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
  area: string;
  areaUrdu: string;
  category: 'police' | 'hospital' | 'pharmacy' | 'petrol';
  lat: number;
  lng: number;
  address: string;
  addressUrdu: string;
  phone: string;
  open247: boolean;
  securityNote: string;
  securityNoteUrdu: string;
}

// Authentic Karachi verified safe havens
const KARACHI_SAFE_SPOTS: SafeSpot[] = [
  // --- POLICE STATIONS & WOMEN POLICE ---
  {
    id: 'khi_pol_1',
    name: 'Women Police Station South (Saddar)',
    nameUrdu: 'خواتین پولیس اسٹیشن ساؤتھ (صدر، کراچی)',
    area: 'Saddar',
    areaUrdu: 'صدر',
    category: 'police',
    lat: 24.8580,
    lng: 67.0120,
    address: 'Artillery Maidan, Near Burns Road & Urdu Bazar, Saddar',
    addressUrdu: 'آرٹلری میدان، برنس روڈ کے قریب، صدر کراچی',
    phone: '021-99216142',
    open247: true,
    securityNote: 'Dedicated female police officers, confidential complaint desk & 24/7 shelter',
    securityNoteUrdu: 'لیڈی پولیس افسران، خواتین کے لیے محفوظ سیل اور 24 گھنٹے فوری قانونی مدد',
  },
  {
    id: 'khi_pol_2',
    name: 'Clifton Police Station (Do Talwar)',
    nameUrdu: 'تھانہ کلفٹن (دو تلوار، کراچی)',
    area: 'Clifton & DHA',
    areaUrdu: 'کلفٹن و ڈیفنس',
    category: 'police',
    lat: 24.8190,
    lng: 67.0325,
    address: 'Near Do Talwar & Khayaban-e-Iqbal, Clifton Block 9',
    addressUrdu: 'دو تلوار چوک، خیابان اقبال، کلفٹن بلاک 9',
    phone: '021-99250554',
    open247: true,
    securityNote: '24/7 Mobile patrol units, CCTV monitored and active armed guard response',
    securityNoteUrdu: '24 گھنٹے موبائل پٹرولنگ، سی سی ٹی وی کوریج اور مسلح پولیس فورس',
  },
  {
    id: 'khi_pol_3',
    name: 'Gulshan-e-Iqbal Police Station',
    nameUrdu: 'تھانہ گلشن اقبال (بلاک 6/7، کراچی)',
    area: 'Gulshan & Jauhar',
    areaUrdu: 'گلشن و جوہر',
    category: 'police',
    lat: 24.9210,
    lng: 67.0890,
    address: 'Block 6, Gulshan-e-Iqbal, near Disco Bakery & University Road',
    addressUrdu: 'بلاک 6، گلشن اقبال، ڈسکو بیکری اور یونیورسٹی روڈ کے قریب',
    phone: '021-99243450',
    open247: true,
    securityNote: 'Active police mobiles on University Road and dedicated emergency duty officer',
    securityNoteUrdu: 'یونیورسٹی روڈ پر پولیس وینز اور ایمرجنسی 15 ڈیوٹی چوکی',
  },
  {
    id: 'khi_pol_4',
    name: 'DHA Gizri Police Station',
    nameUrdu: 'تھانہ ڈیفنس گزری (فیز 5، ڈی ایچ اے)',
    area: 'Clifton & DHA',
    areaUrdu: 'کلفٹن و ڈیفنس',
    category: 'police',
    lat: 24.8210,
    lng: 67.0540,
    address: 'Commercial Avenue, Phase 4/5, DHA Gizri',
    addressUrdu: 'کمرشل ایونیو، فیز 4 اور 5 گزری، ڈی ایچ اے کراچی',
    phone: '021-99250557',
    open247: true,
    securityNote: 'DHA Security Vigilance liaison, 24/7 quick reaction force',
    securityNoteUrdu: 'ڈی ایچ اے سیکیورٹی اور پولیس کوئیک رسپانس فورس',
  },
  {
    id: 'khi_pol_5',
    name: 'North Nazimabad Police Station',
    nameUrdu: 'تھانہ نارتھ ناظم آباد (حیدری و سخی حسن)',
    area: 'Nazimabad & North',
    areaUrdu: 'ناظم آباد و نارتھ',
    category: 'police',
    lat: 24.9420,
    lng: 67.0360,
    address: 'Block D, Near Sakhi Hassan Roundabout & Hyderi',
    addressUrdu: 'بلاک ڈی، سخی حسن چورنگی کے قریب، نارتھ ناظم آباد',
    phone: '021-99260100',
    open247: true,
    securityNote: 'Police post with 15 patrol vans, lighted public reception desk',
    securityNoteUrdu: 'حیدری مارکیٹ اور شاہرائے شیرشاہ سوری کی حفاظت کے لیے فعال تھانہ',
  },
  {
    id: 'khi_pol_6',
    name: 'Ferozabad Police Station (PECHS / Tariq Road)',
    nameUrdu: 'تھانہ فیروز آباد (طارق روڈ و پی ای سی ایچ ایس)',
    area: 'PECHS & Tariq Road',
    areaUrdu: 'طارق روڈ و پی ای سی ایچ ایس',
    category: 'police',
    lat: 24.8730,
    lng: 67.0620,
    address: 'Near Tariq Road Roundabout & Allahwali Chowrangi',
    addressUrdu: 'اللہ والی چورنگی، طارق روڈ کے قریب، پی ای سی ایچ ایس',
    phone: '021-99230555',
    open247: true,
    securityNote: 'Patrols around shopping areas, women assistance desk available',
    securityNoteUrdu: 'طارق روڈ شاپنگ ایریا پر پٹرولنگ اور فوری پولیس کوریج',
  },
  {
    id: 'khi_pol_7',
    name: 'Federal B Area / Gulberg Police Station (Ayesha Manzil)',
    nameUrdu: 'تھانہ گلبرگ و فیڈرل بی ایریا (عائشہ منزل)',
    area: 'Federal B Area',
    areaUrdu: 'فیڈرل بی ایریا',
    category: 'police',
    lat: 24.9270,
    lng: 67.0690,
    address: 'Block 7, Near Ayesha Manzil & Shahrah-e-Pakistan, F.B. Area',
    addressUrdu: 'بلاک 7، نزد عائشہ منزل، شاہراہِ پاکستان، فیڈرل بی ایریا',
    phone: '021-99246155',
    open247: true,
    securityNote: '24/7 Police mobile patrol on Shahrah-e-Pakistan corridor',
    securityNoteUrdu: 'شاہراہِ پاکستان پر 24 گھنٹے موبائل گشت اور ویمن رپورٹنگ ڈیسک',
  },
  {
    id: 'khi_pol_8',
    name: 'Governor House Sindh (Red Zone Rangers & Police Post)',
    nameUrdu: 'گورنر ہاؤس سندھ (ریڈ زون رینجرز و پولیس چوکی)',
    area: 'Saddar',
    areaUrdu: 'صدر و کینٹ',
    category: 'police',
    lat: 24.8530,
    lng: 67.0260,
    address: 'Aiwan-e-Sadar Road / Club Road, Civil Lines, Saddar',
    addressUrdu: 'ایوانِ صدر روڈ، سول لائنز، گورنر ہاؤس ریڈ زون، کراچی',
    phone: '15',
    open247: true,
    securityNote: 'Maximum security zone with 24/7 Sindh Police & Rangers armed presence',
    securityNoteUrdu: 'انتہائی محفوظ سرکاری ریڈ زون، 24 گھنٹے رینجرز و پولیس چوکیاں',
  },

  // --- 24/7 HOSPITALS & EMERGENCY TRAUMA CENTERS ---
  {
    id: 'khi_hosp_1',
    name: 'Aga Khan University Hospital (AKUH) Emergency',
    nameUrdu: 'آغا خان یونیورسٹی ہسپتال 24 گھنٹے ایمرجنسی',
    area: 'Gulshan & Jauhar',
    areaUrdu: 'گلشن و جوہر',
    category: 'hospital',
    lat: 24.8920,
    lng: 67.0740,
    address: 'National Stadium Road, Karachi (Level 1 Trauma ER)',
    addressUrdu: 'نیشنل اسٹیڈیم روڈ، کراچی (24 گھنٹے لیول 1 ٹراما سینٹر)',
    phone: '021-111-911-911',
    open247: true,
    securityNote: 'Maximum security hospital with 24/7 security guards, well-lit entrance & safe haven',
    securityNoteUrdu: 'انتہائی محفوظ کیمپس، سیکیورٹی گارڈز، روشن داخلی دروازے اور ایمرجنسی ٹراما',
  },
  {
    id: 'khi_hosp_2',
    name: 'Jinnah Postgraduate Medical Centre (JPMC) & Trauma Center',
    nameUrdu: 'جناح ہسپتال و شہید بینظیر بھٹو ٹراما سینٹر (جے پی ایم سی)',
    area: 'Saddar',
    areaUrdu: 'صدر',
    category: 'hospital',
    lat: 24.8520,
    lng: 67.0450,
    address: 'Rafiqui Shaheed Road, Karachi Cantt (Round-the-Clock ER)',
    addressUrdu: 'رفیقی شہید روڈ، کراچی کینٹ (24 گھنٹے سرکاری ایمرجنسی و مفت علاج)',
    phone: '021-99201300',
    open247: true,
    securityNote: 'Huge public emergency, police post inside premises, active ambulance station',
    securityNoteUrdu: 'ہسپتال کے اندر مستقل پولیس چوکی، 1122 ایمبولینس اڈا اور 24 گھنٹے ڈاکٹرز',
  },
  {
    id: 'khi_hosp_3',
    name: 'Dr. Ruth K.M. Pfau Civil Hospital Karachi',
    nameUrdu: 'سول ہسپتال کراچی و ٹراما سینٹر',
    area: 'Saddar',
    areaUrdu: 'صدر',
    category: 'hospital',
    lat: 24.8590,
    lng: 67.0090,
    address: 'Mission Road, Near Dow University of Health Sciences, Saddar',
    addressUrdu: 'مشن روڈ، ڈاؤ میڈیکل یونیورسٹی کے بالمقابل، صدر کراچی',
    phone: '021-99215740',
    open247: true,
    securityNote: '24/7 Trauma Emergency with armed security, immediate triage & burn centre',
    securityNoteUrdu: 'ٹراما سینٹر، لیڈی ڈاکٹرز، سیکیورٹی عملہ اور ہنگامی سروس',
  },
  {
    id: 'khi_hosp_4',
    name: 'National Institute of Child Health (NICH)',
    nameUrdu: 'قومی ادارہ برائے صحت اطفال (بچوں کا ہسپتال NICH)',
    area: 'Saddar',
    areaUrdu: 'صدر',
    category: 'hospital',
    lat: 24.8510,
    lng: 67.0460,
    address: 'Rafiqui Shaheed Road, adjacent to JPMC, Karachi',
    addressUrdu: 'رفیقی شہید روڈ، جناح ہسپتال کے ساتھ، بچوں کا مخصوص سرکاری ہسپتال',
    phone: '021-99201261',
    open247: true,
    securityNote: 'Dedicated 24/7 pediatric emergency, child specialists & neonatology',
    securityNoteUrdu: 'بچوں کی ایمرجنسی، اغوا یا زخمی بچوں کے لیے فوری نگہداشت',
  },
  {
    id: 'khi_hosp_5',
    name: 'Liaquat National Hospital Emergency',
    nameUrdu: 'لیاقت نیشنل ہسپتال 24 گھنٹے ایمرجنسی',
    area: 'Gulshan & Jauhar',
    areaUrdu: 'گلشن و جوہر',
    category: 'hospital',
    lat: 24.8960,
    lng: 67.0710,
    address: 'National Stadium Road, Gulshan-e-Iqbal',
    addressUrdu: 'نیشنل اسٹیڈیم روڈ، گلشن اقبال کے قریب',
    phone: '021-111-456-456',
    open247: true,
    securityNote: 'High security private emergency, gated campus with security guards',
    securityNoteUrdu: 'گیٹڈ محفوظ کیمپس، سیکورٹی گارڈز اور 24 گھنٹے ایمبولینس سروس',
  },
  {
    id: 'khi_hosp_6',
    name: 'Ziauddin Hospital (Clifton Campus)',
    nameUrdu: 'ضیاء الدین ہسپتال (کلفٹن کیمپس)',
    area: 'Clifton & DHA',
    areaUrdu: 'کلفٹن و ڈیفنس',
    category: 'hospital',
    lat: 24.8170,
    lng: 67.0310,
    address: 'Shahrah-e-Ghalib, Block 6, Clifton',
    addressUrdu: 'شاہرائے غالب، بلاک 6 کلفٹن، کراچی',
    phone: '021-35862937',
    open247: true,
    securityNote: '24/7 Gated emergency room with private security protocol',
    securityNoteUrdu: '24 گھنٹے ایمرجنسی، گارڈز اور محفوظ داخلی دروازے',
  },

  // --- 24-HOUR PHARMACIES & MEDICAL STORES ---
  {
    id: 'khi_pharm_1',
    name: 'Time Medicos 24/7 Pharmacy',
    nameUrdu: 'ٹائم میڈیکوز 24 گھنٹے فارمیسی و میڈیکل اسٹور',
    area: 'Gulshan & Jauhar',
    areaUrdu: 'گلشن و جوہر',
    category: 'pharmacy',
    lat: 24.8935,
    lng: 67.0750,
    address: 'Opposite National Stadium, Stadium Road, Karachi',
    addressUrdu: 'بالمقابل نیشنل اسٹیڈیم، اسٹیڈیم روڈ، کراچی (سب سے مشہور 24 گھنٹے میڈیکل اسٹور)',
    phone: '021-34932278',
    open247: true,
    securityNote: 'Famous 24/7 landmark, heavily crowded, bright floodlights, security staff',
    securityNoteUrdu: 'ہمیشہ روشن، ہجوم والی جگہ، سیکیورٹی گارڈز اور محفوظ پناہ گاہ',
  },
  {
    id: 'khi_pharm_2',
    name: 'D. Watson Chemist & Super Store (24/7)',
    nameUrdu: 'ڈی واٹسن فارمیسی (دو تلوار، کلفٹن)',
    area: 'Clifton & DHA',
    areaUrdu: 'کلفٹن و ڈیفنس',
    category: 'pharmacy',
    lat: 24.8185,
    lng: 67.0330,
    address: 'Khayaban-e-Iqbal, near Do Talwar, Clifton',
    addressUrdu: 'خیابان اقبال، نزد دو تلوار چوک، کلفٹن کراچی',
    phone: '021-35870001',
    open247: true,
    securityNote: '24/7 bright commercial hub, armed security guards at door, CCTV coverage',
    securityNoteUrdu: 'روشن کمرشل ایریا، گیٹ پر گارڈ، سی سی ٹی وی کیمرے اور 24 گھنٹے میڈیسن',
  },
  {
    id: 'khi_pharm_3',
    name: 'Servaid 24/7 Pharmacy (Shahbaz)',
    nameUrdu: 'سروس ایڈ 24 گھنٹے فارمیسی (خیابان شہباز، ڈی ایچ اے)',
    area: 'Clifton & DHA',
    areaUrdu: 'کلفٹن و ڈیفنس',
    category: 'pharmacy',
    lat: 24.8080,
    lng: 67.0620,
    address: 'Khayaban-e-Shahbaz, Phase 6, DHA',
    addressUrdu: 'خیابان شہباز کمرشل، فیز 6، ڈیفنس کراچی',
    phone: '021-111-737-824',
    open247: true,
    securityNote: 'Well-lit upscale area, guarded entry, 24/7 prescription service',
    securityNoteUrdu: 'روشن سڑک، محفوظ ایریا اور 24 گھنٹے عملہ موجود',
  },
  {
    id: 'khi_pharm_4',
    name: 'Kausar Medicos 24/7 (Boat Basin)',
    nameUrdu: 'کوثر میڈیکوز (بوٹ بیسن، کلفٹن)',
    area: 'Clifton & DHA',
    areaUrdu: 'کلفٹن و ڈیفنس',
    category: 'pharmacy',
    lat: 24.8250,
    lng: 67.0270,
    address: 'Boat Basin Food Street Strip, Block 5, Clifton',
    addressUrdu: 'بوٹ بیسن فوڈ اسٹریٹ، بلاک 5، کلفٹن کراچی',
    phone: '021-35874211',
    open247: true,
    securityNote: 'Crowded 24/7 active restaurant strip with police mobile presence',
    securityNoteUrdu: 'رات بھر پرہجوم فوڈ اسٹریٹ، پولیس موبائل اور روشن پناہ گاہ',
  },
  {
    id: 'khi_pharm_5',
    name: 'Clinix 24/7 Pharmacy (Hyderi)',
    nameUrdu: 'کلینکس 24 گھنٹے فارمیسی (حیدری، نارتھ ناظم آباد)',
    area: 'Nazimabad & North',
    areaUrdu: 'ناظم آباد و نارتھ',
    category: 'pharmacy',
    lat: 24.9390,
    lng: 67.0350,
    address: 'Hyderi Market, Block H, North Nazimabad',
    addressUrdu: 'حیدری مارکیٹ، بلاک ایچ، نارتھ ناظم آباد کراچی',
    phone: '021-36639912',
    open247: true,
    securityNote: 'Main commercial road, CCTV monitored, emergency medication available',
    securityNoteUrdu: 'مین روڈ پر محفوظ دکان، رات بھر روشن اور سی سی ٹی وی کوریج',
  },
  {
    id: 'khi_pharm_6',
    name: 'Fazal Din / Al-Mustafa 24/7 Chemist (Tariq Road)',
    nameUrdu: 'فضل دین و المصطفیٰ 24 گھنٹے فارمیسی (طارق روڈ)',
    area: 'PECHS & Tariq Road',
    areaUrdu: 'طارق روڈ و پی ای سی ایچ ایس',
    category: 'pharmacy',
    lat: 24.8740,
    lng: 67.0610,
    address: 'Near Liberty Chowk, Tariq Road, PECHS Block 2',
    addressUrdu: 'نزد لبرٹی چوک، طارق روڈ، پی ای سی ایچ ایس بلاک 2',
    phone: '021-34552090',
    open247: true,
    securityNote: 'Central Tariq Road location, well lit with continuous security guard',
    securityNoteUrdu: 'طارق روڈ کا مرکزی مقام، سیکیورٹی گارڈ اور رات بھر میڈیسن',
  },

  // --- 24/7 WELL-LIT PETROL STATIONS & MARTS ---
  {
    id: 'khi_pet_1',
    name: 'Shell Select & PSO House (Boat Basin)',
    nameUrdu: 'شیل سلیکٹ و پی ایس او مارٹ (بوٹ بیسن و کلفٹن)',
    area: 'Clifton & DHA',
    areaUrdu: 'کلفٹن و ڈیفنس',
    category: 'petrol',
    lat: 24.8260,
    lng: 67.0280,
    address: 'Near PSO House & Boat Basin Roundabout, Clifton',
    addressUrdu: 'پی ایس او ہاؤس اور بوٹ بیسن چورنگی کے قریب، کلفٹن',
    phone: '15',
    open247: true,
    securityNote: 'High power floodlights, 24/7 convenience mart, security guard on duty',
    securityNoteUrdu: 'ہائی پاور فلڈ لائٹس، 24 گھنٹے مارٹ اور فوری پناہ کے لیے محفوظ مقام',
  },
  {
    id: 'khi_pet_2',
    name: 'Total Parco & PSO Service (Shahrah-e-Faisal / Nursery)',
    nameUrdu: 'ٹوٹل پارکو پیٹرول پمپ (شاہراہِ فیصل و نرسری)',
    area: 'PECHS & Tariq Road',
    areaUrdu: 'طارق روڈ و پی ای سی ایچ ایس',
    category: 'petrol',
    lat: 24.8650,
    lng: 67.0660,
    address: 'Main Shahrah-e-Faisal, near Nursery Flyover',
    addressUrdu: 'مین شاہراہِ فیصل، نزد نرسری فلائی اوور، کراچی',
    phone: '15',
    open247: true,
    securityNote: 'Karachi’s main arterial highway, heavy police patrolling, 24/7 lighted haven',
    securityNoteUrdu: 'مرکزی شاہراہِ فیصل پر پٹرولنگ موبائلز اور تیز روشنی والا پیٹرول اسٹیشن',
  },
  {
    id: 'khi_pet_3',
    name: 'PSO 24/7 Service Station (NIPA Chowrangi)',
    nameUrdu: 'پی ایس او 24 گھنٹے سروس اسٹیشن (نیپا چورنگی، گلشن)',
    area: 'Gulshan & Jauhar',
    areaUrdu: 'گلشن و جوہر',
    category: 'petrol',
    lat: 24.9190,
    lng: 67.0980,
    address: 'University Road, near NIPA Chowrangi, Gulshan-e-Iqbal',
    addressUrdu: 'یونیورسٹی روڈ، نزد نیپا چورنگی، گلشن اقبال کراچی',
    phone: '15',
    open247: true,
    securityNote: 'Busy junction, well-illuminated forecourt, 24/7 convenience store',
    securityNoteUrdu: 'نیپا چوک کا مصروف مقام، 24 گھنٹے کھلی دکان اور ایمرجنسی پناہ',
  },
];

const KARACHI_AREAS = [
  { id: 'all', name: 'All Karachi', nameUrdu: 'پورا کراچی (تمام علاقے)' },
  { id: 'Federal B Area', name: 'Federal B Area', nameUrdu: 'فیڈرل بی ایریا', center: { lat: 24.9310, lng: 67.0720 } },
  { id: 'Clifton & DHA', name: 'Clifton & DHA', nameUrdu: 'کلفٹن و ڈیفنس', center: { lat: 24.8190, lng: 67.0325 } },
  { id: 'Gulshan & Jauhar', name: 'Gulshan & Jauhar', nameUrdu: 'گلشن اقبال و جوہر', center: { lat: 24.9180, lng: 67.0890 } },
  { id: 'Saddar', name: 'Saddar & Cantt', nameUrdu: 'صدر و گورنر ہاؤس', center: { lat: 24.8530, lng: 67.0260 } },
  { id: 'Nazimabad & North', name: 'Nazimabad & North', nameUrdu: 'ناظم آباد و نارتھ کراچی', center: { lat: 24.9420, lng: 67.0360 } },
  { id: 'PECHS & Tariq Road', name: 'Tariq Road & PECHS', nameUrdu: 'طارق روڈ و پی ای سی ایچ ایس', center: { lat: 24.8730, lng: 67.0620 } },
];

export const NearbySafeSpotsMap: React.FC<NearbySafeSpotsMapProps> = ({
  language,
  userLocation,
}) => {
  const isUrdu = language === 'romanUrdu';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Default to Karachi central coordinates (Saddar / JPMC / Clifton zone)
  const defaultKarachiLat = 24.8607;
  const defaultKarachiLng = 67.0011;

  const currentLat = userLocation.lat || defaultKarachiLat;
  const currentLng = userLocation.lng || defaultKarachiLng;

  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | 'police' | 'hospital' | 'pharmacy' | 'petrol'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<SafeSpot | null>(null);

  // Filter spots by category, area, and search query
  const filteredSpots = KARACHI_SAFE_SPOTS.filter((spot) => {
    // Area filter
    if (selectedArea !== 'all' && spot.area !== selectedArea) return false;

    // Category filter
    if (activeCategory !== 'all' && spot.category !== activeCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = spot.name.toLowerCase().includes(q) || spot.nameUrdu.toLowerCase().includes(q);
      const matchAddress = spot.address.toLowerCase().includes(q) || spot.addressUrdu.toLowerCase().includes(q);
      const matchArea = spot.area.toLowerCase().includes(q) || spot.areaUrdu.toLowerCase().includes(q);
      return matchName || matchAddress || matchArea;
    }

    return true;
  });

  // Calculate approximate distance from current position
  const getDistanceKm = (spotLat: number, spotLng: number) => {
    const dLat = (spotLat - currentLat) * 111;
    const dLng = (spotLng - currentLng) * 111 * Math.cos((currentLat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return Math.max(0.2, Number(dist.toFixed(1)));
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([currentLat, currentLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // User Location Marker (Pulse beacon)
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="position: relative; width: 26px; height: 26px;">
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(225, 29, 72, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 26px; height: 26px; border-radius: 9999px; background: #e11d48; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">
            📍
          </div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const userMarker = L.marker([currentLat, currentLng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; font-weight: bold; text-align: center; padding: 4px;">
        ${isUrdu ? 'آپ کی موجودہ جگہ (کراچی)' : 'Your Current Location (Karachi)'}
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
          <div style="width: 34px; height: 34px; border-radius: 12px; background: ${iconColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 17px; cursor: pointer;">
            ${iconEmoji}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedSpot(spot);
      });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 3px; max-width: 220px;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">${isUrdu ? spot.nameUrdu : spot.name}</strong>
          <span style="color: #64748b; font-size: 11px; display: block;">${isUrdu ? spot.addressUrdu : spot.address}</span>
          <span style="color: #e11d48; font-weight: bold; font-size: 11px; margin-top: 2px; display: block;">${spot.open247 ? (isUrdu ? '24 گھنٹے کھلا ہے' : '24/7 Open') : ''}</span>
        </div>
      `);
      markersRef.current.push(marker);
    });
  }, [currentLat, currentLng, filteredSpots, isUrdu]);

  const handleSelectArea = (areaId: string) => {
    setSelectedArea(areaId);
    const areaObj = KARACHI_AREAS.find((a) => a.id === areaId);
    if (areaObj && 'center' in areaObj && areaObj.center && leafletMapRef.current) {
      leafletMapRef.current.flyTo([areaObj.center.lat, areaObj.center.lng], 14, { duration: 1.2 });
    } else if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([defaultKarachiLat, defaultKarachiLng], 12, { duration: 1.2 });
    }
  };

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

  // Direct Google Maps search for Karachi
  const openKarachiGoogleMapsSearch = (query: string) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query + ' Karachi')}/@${currentLat},${currentLng},13z`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-rose-50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏙️</span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{isUrdu ? 'کراچی کے محفوظ مقامات اور نقشہ (Karachi Safe Radar)' : 'Karachi Safe Havens & Live Map'}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              کراچی خصوصی
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isUrdu
              ? 'کلفٹن، ڈیفنس، صدر، گلشن، جوہر اور ناظم آباد کے مستند تھانے، 24 گھنٹے ہسپتال اور فارمیسیز نقشے پر لائیو دیکھیں۔'
              : 'Verified police stations, trauma centers (AKUH, JPMC, Civil), and 24/7 pharmacies across all Karachi zones.'}
          </p>
        </div>

        {/* Live GPS badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{isUrdu ? 'کراچی لائیو ریڈار فعال' : 'Karachi Live Radar'}</span>
          </span>
        </div>
      </div>

      {/* Karachi Zones & Areas Quick Switcher */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-rose-600" />
          <span>{isUrdu ? 'کراچی کا علاقہ منتخب کریں (Select Karachi Zone):' : 'Select Karachi Town / Neighborhood:'}</span>
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {KARACHI_AREAS.map((area) => (
            <button
              key={area.id}
              onClick={() => handleSelectArea(area.id)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
                selectedArea === area.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{isUrdu ? area.nameUrdu : area.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search in Karachi */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'کراچی کے کسی بھی ہسپتال، تھانے، یا علاقے کا نام تلاش کریں...' : 'Search Karachi hospital, police station, or area...'}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-rose-500 text-slate-800"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-2 rounded-xl transition-all shrink-0 ${
              activeCategory === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>{isUrdu ? 'سب' : 'All'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('police')}
            className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
              activeCategory === 'police'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>🚓</span>
            <span>{isUrdu ? 'تھانے (Police)' : 'Police'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('hospital')}
            className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
              activeCategory === 'hospital'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>🏥</span>
            <span>{isUrdu ? 'ہسپتال (Hospital)' : 'Hospital'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('pharmacy')}
            className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
              activeCategory === 'pharmacy'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>💊</span>
            <span>{isUrdu ? '24 گھنٹے فارمیسی' : 'Pharmacy'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('petrol')}
            className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
              activeCategory === 'petrol'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>⛽</span>
            <span>{isUrdu ? 'پیٹرول پمپ' : 'Petrol'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Visual Leaflet Map Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner">
        <div
          ref={mapContainerRef}
          className="w-full h-[360px] sm:h-[430px] bg-slate-100 z-10"
        />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 shadow-md text-[11px] font-semibold flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>{isUrdu ? 'آپ کی لوکیشن' : 'Your GPS'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🚓</span>
            <span>{isUrdu ? 'کراچی پولیس' : 'Police'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🏥</span>
            <span>{isUrdu ? 'ٹراما سینٹر' : 'Hospital'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>💊</span>
            <span>{isUrdu ? 'میڈیکل اسٹور' : 'Pharmacy'}</span>
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
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {selectedSpot.open247 ? (isUrdu ? '24 گھنٹے کھلا ہے' : '24/7 Open') : ''}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {isUrdu ? selectedSpot.addressUrdu : selectedSpot.address}
              </p>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md inline-block mt-1">
                علاقہ: {isUrdu ? selectedSpot.areaUrdu : selectedSpot.area}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base font-black text-rose-600 block">
                ~{getDistanceKm(selectedSpot.lat, selectedSpot.lng)} km
              </span>
              <span className="text-[11px] text-slate-500">
                {isUrdu ? 'متوقع فاصلہ' : 'Estimated distance'}
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

      {/* Grid of Karachi Safe Spots Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {isUrdu
              ? `کراچی کے مقامات کی فہرست (${selectedArea === 'all' ? 'تمام کراچی' : selectedArea}):`
              : `Karachi Safe Havens (${selectedArea}):`}
          </span>
          <span className="text-xs text-slate-500">
            {filteredSpots.length} {isUrdu ? 'مقامات دستیاب ہیں' : 'verified locations'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSpots.map((spot) => {
            const dist = getDistanceKm(spot.lat, spot.lng);
            return (
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
                      ~{dist} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                    <span className="bg-slate-200/70 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">
                      {isUrdu ? spot.areaUrdu : spot.area}
                    </span>
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>24/7 Open</span>
                    </div>
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
            );
          })}
        </div>
      </div>

      {/* Direct Google Maps Live Search Shortcuts for Karachi */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-rose-400" />
              <span>{isUrdu ? 'گوگل میپس پر کراچی کے مزید قریبی مراکز دیکھیں:' : 'Direct Live Google Maps Searches for Karachi:'}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isUrdu
                ? 'اپنے علاقے کے تمام ہسپتال، ویمن پولیس چوکی یا میڈیکل اسٹورز گوگل میپس پر تلاش کریں:'
                : 'Instantly query Google Maps app for all Karachi safe spots near your current location:'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => openKarachiGoogleMapsSearch('Police station')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-white"
          >
            <span>🚓</span>
            <span>{isUrdu ? 'کراچی کے تمام پولیس اسٹیشن' : 'All Karachi Police Posts'}</span>
          </button>

          <button
            onClick={() => openKarachiGoogleMapsSearch('Hospital emergency')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-white"
          >
            <span>🏥</span>
            <span>{isUrdu ? 'کراچی کے تمام ایمرجنسی ہسپتال' : 'All Karachi Hospitals (ER)'}</span>
          </button>

          <button
            onClick={() => openKarachiGoogleMapsSearch('24 hour pharmacy')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-white"
          >
            <span>💊</span>
            <span>{isUrdu ? 'کراچی 24 گھنٹے فارمیسی' : 'All Karachi 24/7 Pharmacies'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
