import React from 'react';
import {
  Shield,
  AlertTriangle,
  EyeOff,
  PhoneCall,
  MapPin,
  Heart,
  Globe,
  Radio,
  Sliders,
  Baby,
  Navigation,
} from 'lucide-react';

interface SafetyHeaderProps {
  language: 'romanUrdu' | 'english';
  setLanguage: (lang: 'romanUrdu' | 'english') => void;
  onOpenSOS: () => void;
  onOpenStealth: () => void;
  onOpenFakeCall: () => void;
  activeTab: 'threat' | 'journey' | 'child' | 'contacts' | 'helplines';
  setActiveTab: (tab: 'threat' | 'journey' | 'child' | 'contacts' | 'helplines') => void;
  location: { lat: number | null; lng: number | null; address?: string };
}

export const SafetyHeader: React.FC<SafetyHeaderProps> = ({
  language,
  setLanguage,
  onOpenSOS,
  onOpenStealth,
  onOpenFakeCall,
  activeTab,
  setActiveTab,
  location,
}) => {
  const isUrdu = language === 'romanUrdu';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Hifazat <span className="text-rose-600 font-extrabold">AI</span>
                </span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  حفاظت
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{isUrdu ? 'خواتین اور بچوں کی ایمرجنسی حفاظت' : 'Women & Child Safety Sentinel'}</span>
                {location.lat && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <MapPin className="w-3 h-3" />
                      <span>GPS Active</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('threat')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'threat'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? 'خطرے کا جائزہ (AI Threat)' : 'Threat AI'}
            </button>

            <button
              onClick={() => setActiveTab('journey')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'journey'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? 'محفوظ سفر (Safe Ride)' : 'Safe Journey'}
            </button>

            <button
              onClick={() => setActiveTab('child')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'child'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? 'بچوں کی حفاظت (Kids Shield)' : 'Child Safety'}
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'contacts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? 'رشتہ دار (Contacts)' : 'Guardians'}
            </button>

            <button
              onClick={() => setActiveTab('helplines')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'helplines'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? 'ہیلپ لائنز (15/1043)' : 'Helplines'}
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(isUrdu ? 'english' : 'romanUrdu')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              title="Change language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{isUrdu ? 'English' : 'اردو / Roman'}</span>
            </button>

            {/* Fake Call Trigger */}
            <button
              onClick={onOpenFakeCall}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Trigger realistic fake incoming call to deter harassers"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{isUrdu ? 'فیک کال' : 'Fake Call'}</span>
            </button>

            {/* Stealth / Calculator Disguise */}
            <button
              onClick={onOpenStealth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Disguise screen as calculator"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isUrdu ? 'چھپائیں (Calculator)' : 'Stealth'}</span>
            </button>

            {/* Giant SOS Hero Button */}
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-rose-600/30 transition-all animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 fill-current" />
              <span>EMERGENCY SOS</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 text-[11px] font-semibold overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('threat')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'threat' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'}`}
          >
            {isUrdu ? 'خطرے کا جائزہ' : 'Threat AI'}
          </button>
          <button
            onClick={() => setActiveTab('journey')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'journey' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'}`}
          >
            {isUrdu ? 'محفوظ سفر' : 'Safe Ride'}
          </button>
          <button
            onClick={() => setActiveTab('child')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'child' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'}`}
          >
            {isUrdu ? 'بچوں کی حفاظت' : 'Kids Shield'}
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'contacts' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'}`}
          >
            {isUrdu ? 'رابطے' : 'Guardians'}
          </button>
          <button
            onClick={() => setActiveTab('helplines')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'helplines' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'}`}
          >
            15 / 1043
          </button>
        </div>
      </div>
    </header>
  );
};
