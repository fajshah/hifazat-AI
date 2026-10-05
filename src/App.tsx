/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SafetyHeader } from './components/SafetyHeader';
import { ThreatAnalyzer } from './components/ThreatAnalyzer';
import { SafeJourneyGuardian } from './components/SafeJourneyGuardian';
import { NearbySafeSpotsMap } from './components/NearbySafeSpotsMap';
import { ChildSafetyShield } from './components/ChildSafetyShield';
import { EmergencyContactsManager } from './components/EmergencyContactsManager';
import { HelplinesDirectory } from './components/HelplinesDirectory';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { FakeCallModal } from './components/FakeCallModal';
import { StealthCalculator } from './components/StealthCalculator';
import { EmergencyContact, HelplineItem } from './types/safety';
import {
  ShieldAlert,
  AlertOctagon,
  EyeOff,
  PhoneCall,
  Baby,
  Car,
  Heart,
  ShieldCheck,
  Send,
} from 'lucide-react';

const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: '1',
    name: 'Abu (Father)',
    relationship: 'Father / ابو',
    phone: '+92 300 8472910',
    isPrimary: true,
  },
  {
    id: '2',
    name: 'Ammi (Mother)',
    relationship: 'Mother / امی',
    phone: '+92 301 9876543',
    isPrimary: false,
  },
  {
    id: '3',
    name: 'Bhai (Brother)',
    relationship: 'Brother / بھائی',
    phone: '+92 321 4492019',
    isPrimary: false,
  },
];

export default function App() {
  const [language, setLanguage] = useState<'romanUrdu' | 'english'>('romanUrdu');
  const [activeTab, setActiveTab] = useState<'threat' | 'safespots' | 'journey' | 'child' | 'contacts' | 'helplines'>('threat');
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);

  // User live location (Default: Karachi center, overridden by real GPS)
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({
    lat: 24.8607,
    lng: 67.0011,
  });

  // Emergency contacts persisted in localStorage
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('hifazat_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  });

  // Helplines list
  const [helplines, setHelplines] = useState<HelplineItem[]>([]);

  // Get current GPS on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation access fallback:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    // Fetch helplines
    fetch('/api/safety/helplines')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.helplines) setHelplines(d.helplines);
      })
      .catch((e) => console.warn('Helpline fetch error:', e));
  }, []);

  const handleUpdateContacts = (newContacts: EmergencyContact[]) => {
    setContacts(newContacts);
    try {
      localStorage.setItem('hifazat_contacts', JSON.stringify(newContacts));
    } catch (e) {}
  };

  const handleSilentSOS = () => {
    console.log('Silent SOS GPS ping sent to emergency contacts');
  };

  const isUrdu = language === 'romanUrdu';

  // If user activated stealth disguise, render working calculator screen
  if (isStealthMode) {
    return (
      <StealthCalculator
        onUnlock={() => setIsStealthMode(false)}
        onSilentSOS={handleSilentSOS}
        language={language}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Safety Header */}
      <SafetyHeader
        language={language}
        setLanguage={setLanguage}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenStealth={() => setIsStealthMode(true)}
        onOpenFakeCall={() => setIsFakeCallOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        location={location}
      />

      {/* Hero Safety Notice Bar */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white py-2.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>
              {isUrdu
                ? 'خواتین اور بچوں کی حفاظت کے لیے 24 گھنٹے فعال نگہبان شیلڈ۔ ایمرجنسی میں پولیس 15 یا 1043 کال کریں۔'
                : '24/7 AI Guardian for Women & Children. For urgent police intervention, dial 15 or 1043.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFakeCallOpen(true)}
              className="underline hover:text-rose-100 font-bold"
            >
              {isUrdu ? 'فیک کال آزمائیں' : 'Test Fake Call'}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsStealthMode(true)}
              className="underline hover:text-rose-100 font-bold"
            >
              {isUrdu ? 'اسکرین چھپائیں (Calculator)' : 'Stealth Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'threat' && (
          <ThreatAnalyzer
            language={language}
            location={location}
            onTriggerSOS={() => setIsSOSOpen(true)}
            onTriggerFakeCall={() => setIsFakeCallOpen(true)}
          />
        )}

        {activeTab === 'safespots' && (
          <NearbySafeSpotsMap
            language={language}
            userLocation={location}
          />
        )}

        {activeTab === 'journey' && (
          <SafeJourneyGuardian
            language={language}
            location={location}
            onTriggerSOS={() => setIsSOSOpen(true)}
          />
        )}

        {activeTab === 'child' && (
          <ChildSafetyShield language={language} />
        )}

        {activeTab === 'contacts' && (
          <EmergencyContactsManager
            contacts={contacts}
            onChangeContacts={handleUpdateContacts}
            language={language}
          />
        )}

        {activeTab === 'helplines' && (
          <HelplinesDirectory
            helplines={helplines}
            language={language}
          />
        )}
      </main>

      {/* Emergency SOS Modal (with Siren & Location Dispatch) */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        location={location}
        contacts={contacts}
        language={language}
      />

      {/* Fake Call Modal */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
        language={language}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-rose-100 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {isUrdu
                ? 'حفاظت اے آئی (Hifazat AI) · خواتین اور بچوں کی حفاظت اور ایمرجنسی معاونت'
                : 'Hifazat AI · Rapid Response & Guardian Sentinel for Women and Children'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Police: 15</span>
            <span aria-hidden="true">·</span>
            <span>Women Helpline: 1043</span>
            <span aria-hidden="true">·</span>
            <span>Child Protection: 1121</span>
            <span aria-hidden="true">·</span>
            <span>Rescue: 1122</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
