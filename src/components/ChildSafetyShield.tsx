import React, { useState } from 'react';
import {
  Baby,
  Search,
  AlertOctagon,
  Share2,
  Download,
  Shield,
  Key,
  Users,
  CheckCircle,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { MissingChildReport } from '../types/safety';

interface ChildSafetyShieldProps {
  language: 'romanUrdu' | 'english';
}

export const ChildSafetyShield: React.FC<ChildSafetyShieldProps> = ({ language }) => {
  const [activeSubTab, setActiveSubTab] = useState<'alert' | 'rules'>('alert');
  const [childName, setChildName] = useState('Ali Raza');
  const [childAge, setChildAge] = useState(6);
  const [gender, setGender] = useState('Male');
  const [lastSeenLocation, setLastSeenLocation] = useState('Anarkali Bazaar near Juice Corner');
  const [clothing, setClothing] = useState('Yellow T-shirt with cartoon print, blue denim shorts, white joggers');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('Small birthmark on left cheek');
  const [contactNumber, setContactNumber] = useState('+92 300 1234567');
  const [isGenerating, setIsGenerating] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  const isUrdu = language === 'romanUrdu';

  const handleGenerateAlert = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/safety/child-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName,
          childAge,
          gender,
          lastSeenLocation,
          clothing,
          distinguishingFeatures,
          contactNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastResult(data);
      }
    } catch (e) {
      console.warn('Child alert error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsAppPoster = () => {
    const text = `🚨 URGENT MISSING CHILD ALERT:
Child Name: ${childName} (${childAge}y ${gender})
Clothing: ${clothing}
Last Seen: ${lastSeenLocation}
Features: ${distinguishingFeatures}
Contact Parents Immediately: ${contactNumber}
Or Call Police 15 / Child Protection 1121. Please forward in all groups!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-rose-50">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-rose-600" />
            <span>{isUrdu ? 'بچوں کی حفاظت اور ایمرجنسی شیلڈ (Child Protection)' : 'Child Protection Shield'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'گمشدہ بچے کا فوری تلاش پوسٹر بنائیں یا بچوں کو اجنبیوں سے بچاؤ کے بنیادی اصول سکھائیں۔'
              : 'Rapid missing child search broadcast and interactive stranger-danger safety guidelines.'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('alert')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'alert' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {isUrdu ? 'گمشدہ بچہ الرٹ' : 'Missing Child Alert'}
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'rules' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {isUrdu ? 'بچوں کے سیفٹی اصول' : 'Safety Rules'}
          </button>
        </div>
      </div>

      {activeSubTab === 'alert' && (
        <div className="space-y-5">
          {/* Missing Child Intake Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'بچے کا نام (Child Name)' : 'Child Name'}
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'عمر (Age)' : 'Age (Years)'}
              </label>
              <input
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'جنس (Gender)' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
              >
                <option value="Male">Male / لڑکا</option>
                <option value="Female">Female / لڑکی</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'آخری بار دیکھے جانے کی جگہ (Last Seen Location)' : 'Last Seen Spot'}
              </label>
              <input
                type="text"
                value={lastSeenLocation}
                onChange={(e) => setLastSeenLocation(e.target.value)}
                placeholder="e.g. Near gate 2 of Joyland Park"
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'والدین کا فون نمبر (Contact #)' : 'Parent Contact Number'}
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'پہنے ہوئے کپڑے اور جوتے (Clothing Description)' : 'Clothing & Shoes Description'}
              </label>
              <input
                type="text"
                value={clothing}
                onChange={(e) => setClothing(e.target.value)}
                placeholder="e.g. Red kurti, white trousers, pink sandals"
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateAlert}
            disabled={isGenerating || !childName.trim()}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isUrdu ? 'تلاش الرٹ تیار ہو رہا ہے...' : 'Generating Broadcast Poster...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isUrdu ? 'فوری گمشدہ بچہ الرٹ تیار کریں' : 'Generate Missing Child Emergency Broadcast'}</span>
              </>
            )}
          </button>

          {/* Generated Alert Poster */}
          {broadcastResult && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-400 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-6 h-6 text-rose-600" />
                    <div>
                      <h3 className="text-sm font-black text-rose-700 uppercase tracking-wide">
                        {broadcastResult.urgentPosterTitleEnglish}
                      </h3>
                      <p className="text-xs font-bold text-slate-800">
                        {broadcastResult.urgentPosterTitleUrdu}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleShareWhatsAppPoster}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'واٹس ایپ پر فوری فارورڈ کریں' : 'Forward to WhatsApp'}</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-amber-200/80 text-xs text-slate-900 leading-relaxed font-medium">
                  {broadcastResult.broadcastSummary}
                </div>

                {/* 0-30 Minute Search Protocol */}
                <div>
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-2">
                    {isUrdu ? '⏱️ فوری 0 سے 30 منٹ کی تلاشی فہرست (Search Checklist):' : '⏱️ 0-30 Minute Search Protocol:'}
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {broadcastResult.immediate0to30MinChecklist.map((step: string, i: number) => (
                      <li key={i} className="p-2.5 bg-white rounded-xl border border-amber-200 text-slate-800 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Child Safety Rules */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-blue-600" />
              <span>{isUrdu ? 'خفیہ فیملی پاس ورڈ (Safe Word Secret):' : 'The Family Secret Safe Word:'}</span>
            </h3>
            <p className="text-xs text-blue-950 leading-relaxed">
              {isUrdu
                ? 'اپنے بچے کے ساتھ ایک خفیہ لفظ طے کریں (مثلاً "چاندنی" یا "مینگو")۔ اگر کوئی اجنبی کہے کہ "آپ کے ابو نے مجھے آپ کو لینے بھیجا ہے"، بچہ پوچھے کہ ہمارا سیکرٹ پاس ورڈ کیا ہے؟ اگر اجنبی کو نہ پتہ ہو تو بچہ فوراً شور مچائے!'
                : 'Agree on a secret family word (e.g. "Mango" or "Sky"). If anyone approaches the child claiming "your parents sent me to pick you up", the child must demand the safe word. If they cannot answer, the child must scream and run to an adult!'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="font-bold text-slate-900 block mb-1">
                {isUrdu ? 'اگر بچہ بازار یا پارک میں گم ہو جائے' : 'If Separated in a Public Bazaar'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {isUrdu
                  ? 'بچے کو سکھائیں کہ ادھر ادھر نہ بھاگے۔ وہیں کھڑے ہو کر کسی یونیفارم والے پولیس اہلکار، سیکیورٹی گارڈ، یا بچوں کے ساتھ موجود ماں سے مدد مانگے!'
                  : 'Teach the child to stop moving. Look for a uniformed police officer, mall security guard, or another mother with children.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="font-bold text-slate-900 block mb-1">
                {isUrdu ? 'جسمانی حفاظت (Good Touch / Bad Touch)' : 'Personal Space & Body Safety'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {isUrdu
                  ? 'بچے کو سمجھائیں کہ اس کے کپڑوں کے نیچے کا جسم اس کی ذاتی ملکیت ہے۔ کوئی بھی اجنبی اسے ہاتھ نہیں لگا سکتا۔ اگر کوئی ایسا کرے تو زور سے "نہیں" کہے اور ماں باپ کو بتائے۔'
                  : 'Teach children that bathing suit areas are private. If anyone tries to touch or make them feel uncomfortable, shout "NO!", run away, and tell parents without fear.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
