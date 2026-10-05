import React, { useState } from 'react';
import { Shield, ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface StealthCalculatorProps {
  onUnlock: () => void;
  onSilentSOS: () => void;
  language: 'romanUrdu' | 'english';
}

export const StealthCalculator: React.FC<StealthCalculatorProps> = ({
  onUnlock,
  onSilentSOS,
  language,
}) => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [acPressCount, setAcPressCount] = useState(0);
  const [silentAlertSent, setSilentAlertSent] = useState(false);

  const isUrdu = language === 'romanUrdu';

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === '0' ? digit : prev + digit));
  };

  const handleClear = () => {
    const newCount = acPressCount + 1;
    setAcPressCount(newCount);

    // If pressed AC 3 times in a row, trigger silent SOS or unlock
    if (newCount >= 3) {
      onUnlock();
      setAcPressCount(0);
      return;
    }

    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
  };

  const handleOp = (op: string) => {
    setPrevVal(parseFloat(display));
    setOperation(op);
    setDisplay('0');
  };

  const handleEquals = () => {
    // Secret Emergency Codes:
    // If user enters '911' or '15' or '1121' and presses '=', it activates silent SOS and unlocks!
    if (display === '911' || display === '15' || display === '1121' || display === '0000') {
      onSilentSOS();
      setSilentAlertSent(true);
      setTimeout(() => {
        onUnlock();
      }, 1200);
      return;
    }

    if (prevVal === null || operation === null) return;
    const current = parseFloat(display);
    let result = 0;
    if (operation === '+') result = prevVal + current;
    if (operation === '-') result = prevVal - current;
    if (operation === '×') result = prevVal * current;
    if (operation === '÷') result = current !== 0 ? prevVal / current : 0;

    setDisplay(String(result));
    setPrevVal(null);
    setOperation(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 select-none max-w-md mx-auto">
      {/* Top Bar with subtle secret hint */}
      <div className="flex items-center justify-between text-slate-700 text-xs pt-2">
        <span className="font-mono text-[11px] opacity-40">CALC v2.4</span>
        <button
          onClick={onUnlock}
          className="opacity-20 hover:opacity-100 text-slate-400 text-[10px] px-2 py-1 rounded"
        >
          {isUrdu ? 'واپس (Back)' : 'Exit Stealth'}
        </button>
      </div>

      {silentAlertSent && (
        <div className="p-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-center text-xs animate-pulse">
          {isUrdu ? 'خفیہ لائیو ایس او ایس بھیج دیا گیا ہے...' : 'Silent Distress GPS Transmitted...'}
        </div>
      )}

      {/* Screen Display */}
      <div className="text-right py-8 px-4">
        <div className="text-white text-5xl font-light font-mono tracking-tight overflow-x-auto whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Calculator Buttons Grid */}
      <div className="grid grid-cols-4 gap-3.5 pb-6">
        <button
          onClick={handleClear}
          className="h-16 rounded-full bg-slate-400 hover:bg-slate-300 text-black text-xl font-medium active:scale-95 transition-transform"
        >
          AC
        </button>
        <button
          onClick={() => setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev))}
          className="h-16 rounded-full bg-slate-400 hover:bg-slate-300 text-black text-xl font-medium active:scale-95 transition-transform"
        >
          +/-
        </button>
        <button
          onClick={() => setDisplay((prev) => String(parseFloat(prev) / 100))}
          className="h-16 rounded-full bg-slate-400 hover:bg-slate-300 text-black text-xl font-medium active:scale-95 transition-transform"
        >
          %
        </button>
        <button
          onClick={() => handleOp('÷')}
          className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-2xl font-medium active:scale-95 transition-transform"
        >
          ÷
        </button>

        {/* 7 8 9 × */}
        <button
          onClick={() => handleDigit('7')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          9
        </button>
        <button
          onClick={() => handleOp('×')}
          className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-2xl font-medium active:scale-95 transition-transform"
        >
          ×
        </button>

        {/* 4 5 6 - */}
        <button
          onClick={() => handleDigit('4')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          6
        </button>
        <button
          onClick={() => handleOp('-')}
          className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-2xl font-medium active:scale-95 transition-transform"
        >
          -
        </button>

        {/* 1 2 3 + */}
        <button
          onClick={() => handleDigit('1')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          3
        </button>
        <button
          onClick={() => handleOp('+')}
          className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-2xl font-medium active:scale-95 transition-transform"
        >
          +
        </button>

        {/* 0 . = */}
        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light pl-7 text-left active:scale-95 transition-transform"
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className="h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl font-light active:scale-95 transition-transform"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-2xl font-medium active:scale-95 transition-transform"
        >
          =
        </button>
      </div>

      <div className="text-center text-[10px] text-slate-700">
        Secret Unlock: Enter <code className="text-slate-500 font-mono">15</code> or <code className="text-slate-500 font-mono">911</code> then tap <code className="text-slate-500 font-mono">=</code>, or tap AC 3 times.
      </div>
    </div>
  );
};
