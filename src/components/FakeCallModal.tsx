import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneOff,
  User,
  Mic,
  Volume2,
  Shield,
  X,
} from 'lucide-react';
import {
  startPhoneRingtone,
  stopPhoneRingtone,
  speakCallLine,
} from '../utils/audioAlerts';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'romanUrdu' | 'english';
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [callerType, setCallerType] = useState<'father' | 'brother' | 'police'>('father');
  const [seconds, setSeconds] = useState(0);
  const [callerData, setCallerData] = useState<{
    callerName: string;
    phoneNum: string;
    dialogLines: string[];
  }>({
    callerName: 'Abu (Father)',
    phoneNum: '+92 300 8472910',
    dialogLines: [
      'Haan beta, main chowk pe khara hoon, tum kahan tak pohanchi ho?',
      'Main bike pe bas 2 minute main samne araha hoon.',
      'Aap wahi rukna kisi roshni wali dukan k bahar, main araha hoon.',
    ],
  });

  const isUrdu = language === 'romanUrdu';

  // Ringtone lifecycle
  useEffect(() => {
    if (isOpen) {
      setCallState('ringing');
      setSeconds(0);
      startPhoneRingtone();
      // Fetch caller data from server
      fetch('/api/safety/fake-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerType }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setCallerData(data);
          }
        })
        .catch((e) => console.warn('Fake call load error:', e));
    } else {
      stopPhoneRingtone();
    }

    return () => {
      stopPhoneRingtone();
    };
  }, [isOpen, callerType]);

  // Call timer lifecycle
  useEffect(() => {
    let interval: any = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  if (!isOpen) return null;

  const handleAnswerCall = () => {
    stopPhoneRingtone();
    setCallState('connected');
    // Speak first line of dialogue automatically
    if (callerData.dialogLines && callerData.dialogLines.length > 0) {
      speakCallLine(callerData.dialogLines[0]);
    }
  };

  const handleDeclineOrEnd = () => {
    stopPhoneRingtone();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  const handleReplayVoice = (line: string) => {
    speakCallLine(line);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm h-[640px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-[40px] border border-slate-800 shadow-2xl p-6 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Top caller selection tabs */}
        {callState === 'ringing' && (
          <div className="flex items-center justify-center gap-1.5 p-1 bg-white/10 rounded-xl mb-4 text-[11px] font-semibold">
            <button
              onClick={() => setCallerType('father')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                callerType === 'father' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300'
              }`}
            >
              Abu (Father)
            </button>
            <button
              onClick={() => setCallerType('brother')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                callerType === 'brother' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300'
              }`}
            >
              Bhai (Brother)
            </button>
            <button
              onClick={() => setCallerType('police')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                callerType === 'police' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300'
              }`}
            >
              Police (15)
            </button>
          </div>
        )}

        {/* Caller Info */}
        <div className="text-center mt-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border-2 border-slate-500/50 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-12 h-12 text-slate-200" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            {callerData.callerName}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {callerData.phoneNum}
          </p>

          <p className="text-sm font-semibold text-rose-400 mt-2 animate-pulse">
            {callState === 'ringing'
              ? (isUrdu ? 'کال آرہی ہے...' : 'Incoming Call...')
              : formatTimer(seconds)}
          </p>
        </div>

        {/* Connected state: Simulated spoken dialogue lines */}
        {callState === 'connected' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 my-2 text-xs space-y-2 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              {isUrdu ? 'اسپیکر کی آواز (کلک کر کے دوبارہ سنوائیں):' : 'Spoken Voice Script (Tap to speak aloud):'}
            </span>
            <div className="space-y-1.5">
              {callerData.dialogLines.map((line, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReplayVoice(line)}
                  className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 transition-all text-slate-200 flex items-center justify-between group"
                >
                  <span className="italic leading-snug">"{line}"</span>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 opacity-60 group-hover:opacity-100 ml-1" />
                </button>
              ))}
            </div>

            <div className="pt-1 text-[10px] text-slate-400">
              {isUrdu ? 'آپ اونچی آواز میں کہیں: "جی میں سامنے آرہی ہوں!"' : 'Reply loudly: "Yes, I see you right ahead!"'}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mb-4">
          {callState === 'ringing' ? (
            <div className="flex items-center justify-around">
              {/* Decline */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleDeclineOrEnd}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 transition-transform active:scale-95"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-xs text-slate-400">
                  {isUrdu ? 'مسترد کریں' : 'Decline'}
                </span>
              </div>

              {/* Accept */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleAnswerCall}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/40 transition-transform active:scale-95 animate-bounce"
                >
                  <Phone className="w-7 h-7 fill-current" />
                </button>
                <span className="text-xs text-slate-400">
                  {isUrdu ? 'جواب دیں' : 'Answer'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <button
                onClick={handleDeclineOrEnd}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 transition-transform active:scale-95"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
