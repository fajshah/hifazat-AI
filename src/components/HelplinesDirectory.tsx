import React from 'react';
import { PhoneCall, Shield, HeartPulse, ShieldAlert, Laptop } from 'lucide-react';
import { HelplineItem } from '../types/safety';

interface HelplinesDirectoryProps {
  helplines: HelplineItem[];
  language: 'romanUrdu' | 'english';
}

export const HelplinesDirectory: React.FC<HelplinesDirectoryProps> = ({
  helplines,
  language,
}) => {
  const isUrdu = language === 'romanUrdu';

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'police':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'women':
        return <Shield className="w-5 h-5 text-pink-600" />;
      case 'children':
        return <HeartPulse className="w-5 h-5 text-amber-600" />;
      case 'cyber':
        return <Laptop className="w-5 h-5 text-blue-600" />;
      default:
        return <PhoneCall className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="pb-4 border-b border-rose-50">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-rose-600" />
          <span>{isUrdu ? 'سرکاری ایمرجنسی ہیلپ لائنز (Emergency Helplines)' : 'Verified Official Helplines'}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isUrdu
            ? 'کسی بھی ہنگامی صورتحال میں مفت فوری مدد کے لیے براہ راست کال ملائیں۔'
            : 'Toll-free, 24/7 direct access to law enforcement, women protection, and rescue units.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {helplines.map((h) => (
          <div
            key={h.number}
            className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-rose-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    {getIcon(h.category)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{h.name}</h3>
                    <span className="text-lg font-black font-mono text-rose-600">{h.number}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {isUrdu ? h.descriptionUrdu : h.description}
              </p>
            </div>

            <a
              href={`tel:${h.number.replace(/[^0-9]/g, '')}`}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isUrdu ? `ڈائل کریں ${h.number}` : `Call ${h.number}`}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
