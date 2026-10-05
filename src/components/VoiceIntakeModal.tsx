import React, { useState } from 'react';
import { Mic, MicOff, Radio, Sparkles, X, Check, FileText } from 'lucide-react';

interface VoiceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCase: (caseData: any) => void;
}

const SAMPLE_RADIO_TRANSCRIPTS = [
  {
    title: 'Medic 4: Inbound STEMI / Chest Pain Call',
    text: 'Medic 4 to Dispatch: We are 8 minutes out with a 58-year-old male, Robert. Experiencing acute retrosternal crushing chest pain radiating to left jaw, onset 70 minutes ago while shoveling snow. Associated diaphoresis and nausea. Vitals en route: heart rate 104 regular, blood pressure 168/96, respiratory rate 22, SpO2 94% on room air, temperature 37.1C, pain 8/10. History of hypertension and type 2 diabetes. 12-lead shows 2mm ST elevations in inferior leads. Requesting immediate cath lab team activation.',
  },
  {
    title: 'Medic 12: Geriatric Sepsis & Altered Mental Status',
    text: 'Medic 12 to Base: Inbound from nursing home with an 82-year-old female, Eleanor. Acute onset confusion, non-verbal, combative on arrival. Foley catheter bag contains gross cloudy dark urine. Vitals: heart rate 118, hypotensive with blood pressure 84/52, respiratory rate 26, oxygen saturation 93%, temperature 35.8C, extremities cold with sluggish capillary refill. Suspected septic shock secondary to CAUTI. 500mL saline bolus running wide open.',
  },
  {
    title: 'Medic 7: Pediatric Stridor & Respiratory Distress',
    text: 'Medic 7 to Emergency: Transporting a 3-year-old male, Leo Chen, with acute inspiratory stridor at rest and barking seal cough. High fever at 39.2C. Vitals: heart rate 144, respiratory rate 42, oxygen saturation 91% on room air. Marked subcostal and suprasternal retractions. Child is upright in mother arms, refusing oral fluids. Suspecting severe croup with impending airway compromise.',
  },
];

export const VoiceIntakeModal: React.FC<VoiceIntakeModalProps> = ({
  isOpen,
  onClose,
  onApplyCase,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Speech Recognition handling (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. You can use the radio presets below or type dictation.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMessage('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        setErrorMessage(`Microphone error (${event.error}). You may use simulated transcripts or type directly.`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      setErrorMessage('Could not initialize microphone: ' + err.message);
      setIsRecording(false);
    }
  };

  const handleProcessTranscript = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/triage/parse-dictation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (data.success && data.caseData) {
        onApplyCase(data.caseData);
        onClose();
      } else {
        setErrorMessage(data.error || 'Failed to parse dictation into structured clinical case.');
      }
    } catch (err: any) {
      setErrorMessage('Network or server error while parsing dictation: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Voice Dictation & EMT Radio Handoff
              </h3>
              <p className="text-xs text-slate-500">
                Speak or select an emergency dispatch transcript to auto-extract structured clinical data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Preset Dispatch Samples */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Fast Handoff Transcripts (Click to load):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_RADIO_TRANSCRIPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setTranscript(item.text)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 text-xs transition-all group"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-teal-900 block truncate">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dictation Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Clinical Transcript or Paramedic Radio Audio:
              </label>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
                <span>{isRecording ? 'Listening (Click to stop)' : 'Live Mic Dictation'}</span>
              </button>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={5}
              placeholder="Speak using microphone or paste emergency medic handoff audio transcript here..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono text-slate-800 leading-relaxed"
            />
          </div>

          {errorMessage && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessTranscript}
            disabled={!transcript.trim() || isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting Clinical Entities...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Parse to Patient Record</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
