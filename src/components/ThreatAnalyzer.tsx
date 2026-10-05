import React, { useState } from 'react';
import {
  AlertTriangle,
  Mic,
  MicOff,
  Sparkles,
  Send,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  Volume2,
  Check,
  Share2,
} from 'lucide-react';
import { SafetySituationAnalysis } from '../types/safety';

interface ThreatAnalyzerProps {
  language: 'romanUrdu' | 'english';
  location: { lat: number | null; lng: number | null; address?: string };
  onTriggerSOS: () => void;
  onTriggerFakeCall: () => void;
}

const COMMON_SITUATIONS = [
  {
    titleUrdu: 'کوئی موٹرسائیکل یا پیدل پیچھا کر رہا ہے',
    titleEnglish: 'Being followed by someone on foot or bike',
    text: 'A suspicious person on a motorbike is slowly tailing me for the last 2 streets. The street is quiet and getting dark.',
  },
  {
    titleUrdu: 'رکشہ یا ٹیکسی ڈرائیور غیر محفوظ ویران راستے پر مڑ گیا ہے',
    titleEnglish: 'Rickshaw/cab driver taking an unmapped dark alley',
    text: 'The rickshaw driver turned off the main road onto a dark unlit back alley and refused to turn back when I asked him.',
  },
  {
    titleUrdu: 'میرا چھوٹا بچہ اچانک مارکیٹ میں غائب ہو گیا ہے',
    titleEnglish: 'My child suddenly separated in a crowded market',
    text: 'My 6-year-old child wearing a blue shirt let go of my hand in a crowded bazaar 5 minutes ago and is nowhere in sight.',
  },
  {
    titleUrdu: 'گلی یا اسٹاپ پر غیر اخلاقی آوازیں یا ہراسانی',
    titleEnglish: 'Catcalling and harassment at bus stop',
    text: 'A group of men at the corner are blocking my path, passing threatening remarks, and won’t let me walk past.',
  },
];

export const ThreatAnalyzer: React.FC<ThreatAnalyzerProps> = ({
  language,
  location,
  onTriggerSOS,
  onTriggerFakeCall,
}) => {
  const [situationText, setSituationText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SafetySituationAnalysis | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const isUrdu = language === 'romanUrdu';

  const handleAnalyze = async (textToAnalyze = situationText) => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/safety/analyze-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: textToAnalyze,
          location,
          userRole: 'Female / Mother / Child Safety',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data);
      }
    } catch (e) {
      console.error('Threat analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Web Speech recognition for rapid spoken input
  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech-to-text not supported in browser. Please type or tap presets.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (ev: any) => {
        const text = ev.results[0][0].transcript;
        setSituationText(text);
        setIsRecording(false);
        handleAnalyze(text);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      rec.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const handleShareWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Input Box */}
      <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-rose-50 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>{isUrdu ? 'فوری صورتحال کا جائزہ (AI Threat Assessment)' : 'Instant Threat Assessment'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'اپنے ساتھ پیش آنے والا مسئلہ بتائیں — AI فوراً بچاؤ کے اقدامات اور ایس او ایس میسج تیار کرے گا۔'
                : 'Describe your immediate danger or concern. AI generates real-time tactics and ready-to-dispatch alerts.'}
            </p>
          </div>

          <button
            onClick={toggleRecording}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-600" />}
            <span>{isRecording ? (isUrdu ? 'سن رہا ہے...' : 'Listening...') : (isUrdu ? 'بول کر بتائیں' : 'Voice Input')}</span>
          </button>
        </div>

        {/* Quick Situation Presets */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            {isUrdu ? 'عام ہنگامی صورتحال (کلک کریں):' : 'Common Emergency Scenarios (Tap to evaluate):'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMMON_SITUATIONS.map((sit, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSituationText(sit.text);
                  handleAnalyze(sit.text);
                }}
                className="text-left p-3 rounded-2xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 text-xs transition-all group"
              >
                <span className="font-bold text-slate-900 group-hover:text-rose-900 block">
                  {isUrdu ? sit.titleUrdu : sit.titleEnglish}
                </span>
                <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {sit.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-3">
          <textarea
            value={situationText}
            onChange={(e) => setSituationText(e.target.value)}
            rows={3}
            placeholder={
              isUrdu
                ? 'مثلاً: ایک سفید کار پچھلے 10 منٹ سے میرا پیچھا کر رہی ہے، میں اکیلی ہوں اور گلی ویران ہے...'
                : 'e.g. A suspicious car has been following me for 10 minutes, the street is deserted...'
            }
            className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {isUrdu ? 'لائیو لوکیشن اور وقت خود بخود شامل ہوگا' : 'Live location & timestamp automatically attached'}
            </span>

            <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing || !situationText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isUrdu ? 'تجزیہ ہو رہا ہے...' : 'Analyzing Threat...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'حفاظتی تدبیر جانیں (Analyze)' : 'Get AI Action Plan'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Result Display */}
      {analysis && (
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Threat Banner */}
          <div
            className={`p-4 rounded-2xl flex items-center justify-between ${
              analysis.threatLevel === 'critical'
                ? 'bg-rose-600 text-white'
                : analysis.threatLevel === 'high'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-7 h-7" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-90 block">
                  {isUrdu ? 'خطرے کا لیول' : 'Assessed Threat Level'}
                </span>
                <h3 className="text-lg font-black uppercase">
                  {analysis.threatLevel} (Risk Score: {analysis.threatScore}/100)
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onTriggerFakeCall}
                className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-100 transition-colors"
              >
                {isUrdu ? 'فیک کال چلائیں' : 'Trigger Fake Call'}
              </button>
              <button
                onClick={onTriggerSOS}
                className="px-3.5 py-1.5 bg-black/30 hover:bg-black/40 text-white rounded-xl text-xs font-extrabold border border-white/20 transition-colors"
              >
                {isUrdu ? 'ایمرجنسی الارم' : 'Sound Alarm'}
              </button>
            </div>
          </div>

          {/* Immediate Action Advice */}
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1.5">
              {isUrdu ? '⚡ فوری کرنے کا کام (Immediate Action):' : '⚡ Immediate Action Protocol:'}
            </h4>
            <p className="text-sm font-semibold text-rose-950 leading-relaxed">
              {isUrdu ? analysis.immediateActionUrdu : analysis.immediateActionEnglish}
            </p>
          </div>

          {/* Tactical Countermeasures */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              {isUrdu ? 'حفاظتی اقدامات (Tactical Countermeasures):' : 'Tactical Safety Countermeasures:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {analysis.recommendedCountermeasures.map((cm, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-medium">{cm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assertive De-escalation Phrases */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                {isUrdu ? 'بلند آواز میں کہنے والے الفاظ (Deterrent Phrases):' : 'Say These Loudly to Ward Off Harasser:'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isUrdu ? 'پراعتماد اور بلند آواز میں بولیں' : 'Speak assertively'}
              </span>
            </div>
            <div className="space-y-1.5">
              {analysis.deescalationPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white/10 rounded-xl text-xs text-slate-100 font-medium italic border border-white/5"
                >
                  "{phrase}"
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Drafted Emergency WhatsApp Dispatch */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>{isUrdu ? 'تیار شدہ واٹس ایپ ایس او ایس پیغام:' : 'Pre-Formatted Emergency WhatsApp Message:'}</span>
              <span className="text-[11px] font-normal text-emerald-700">Ready to Send</span>
            </div>
            <p className="text-xs text-emerald-950 font-mono bg-white p-3 rounded-xl border border-emerald-200/80 leading-relaxed">
              {analysis.emergencyDispatchMessage}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => handleCopyText(analysis.emergencyDispatchMessage)}
                className="px-3 py-1.5 bg-white hover:bg-emerald-100/50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedMsg ? (isUrdu ? 'کاپی ہوگیا' : 'Copied') : (isUrdu ? 'کاپی کریں' : 'Copy Text')}</span>
              </button>

              <button
                onClick={() => handleShareWhatsApp(analysis.emergencyDispatchMessage)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'واٹس ایپ پر فوری بھیجیں' : 'Send WhatsApp SOS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
