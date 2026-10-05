import React, { useState } from 'react';
import { PatientCase, PatientVitals, WhatIfSimulationResult } from '../types/clinical';
import {
  Sliders,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Zap,
  ShieldCheck,
  Activity,
  Heart,
  Gauge,
  Thermometer,
} from 'lucide-react';

interface WhatIfSimulatorProps {
  patient: PatientCase;
  onApplyVitalsToPatient: (vitals: PatientVitals) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  patient,
  onApplyVitalsToPatient,
}) => {
  const [vitals, setVitals] = useState<PatientVitals>({ ...patient.vitals });
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSliderChange = (param: keyof PatientVitals, value: number) => {
    setVitals((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const runSimulation = async (simVitals = vitals) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/triage/whatif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPatient: patient,
          modifiedVitals: simVitals,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Quick Crisis Presets
  const applyPreset = (presetName: string) => {
    let newVitals: PatientVitals;
    if (presetName === 'hypoxia') {
      newVitals = { ...vitals, spO2: 82, respiratoryRate: 36, heartRate: 124 };
    } else if (presetName === 'shock') {
      newVitals = { ...vitals, bloodPressureSys: 78, bloodPressureDia: 46, heartRate: 136 };
    } else if (presetName === 'hypertensive') {
      newVitals = { ...vitals, bloodPressureSys: 215, bloodPressureDia: 125, painScore: 10 };
    } else {
      // Normal
      newVitals = {
        ...vitals,
        heartRate: 74,
        bloodPressureSys: 118,
        bloodPressureDia: 76,
        spO2: 99,
        respiratoryRate: 15,
        temperatureC: 37.0,
        painScore: 2,
      };
    }
    setVitals(newVitals);
    runSimulation(newVitals);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-600" />
            <span>Physiological Stress & What-If Simulation Sandbox</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perturb vital parameters in real time to observe clinical sensitivity, risk escalation, and emergency countermeasures.
          </p>
        </div>

        <button
          onClick={() => runSimulation()}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          {isSimulating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>Recalculate Risk Delta</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Crisis Buttons */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">
          Clinical Stressor Scenarios (Click to Inject):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('hypoxia')}
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-left transition-all"
          >
            <span className="text-xs font-bold text-rose-900 block">Acute Hypoxemic Crash</span>
            <span className="text-[11px] text-rose-700">SpO2 82% · RR 36/min</span>
          </button>

          <button
            onClick={() => applyPreset('shock')}
            className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-left transition-all"
          >
            <span className="text-xs font-bold text-purple-900 block">Septic / Cardiogenic Shock</span>
            <span className="text-[11px] text-purple-700">BP 78/46 · HR 136 bpm</span>
          </button>

          <button
            onClick={() => applyPreset('hypertensive')}
            className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-all"
          >
            <span className="text-xs font-bold text-amber-900 block">Hypertensive Emergency</span>
            <span className="text-[11px] text-amber-700">BP 215/125 · Pain 10/10</span>
          </button>

          <button
            onClick={() => applyPreset('normal')}
            className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-all"
          >
            <span className="text-xs font-bold text-emerald-900 block">Physiologic Normalization</span>
            <span className="text-[11px] text-emerald-700">SpO2 99% · BP 118/76</span>
          </button>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
        {/* Heart Rate Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Heart Rate:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{vitals.heartRate} bpm</span>
          </div>
          <input
            type="range"
            min="40"
            max="190"
            value={vitals.heartRate}
            onChange={(e) => handleSliderChange('heartRate', Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>40 Bradycardia</span>
            <span>Normal 60-100</span>
            <span>190 Tachycardia</span>
          </div>
        </div>

        {/* Systolic BP Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Systolic Blood Pressure:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{vitals.bloodPressureSys} mmHg</span>
          </div>
          <input
            type="range"
            min="60"
            max="230"
            value={vitals.bloodPressureSys}
            onChange={(e) => handleSliderChange('bloodPressureSys', Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>60 Hypotension</span>
            <span>Normal 110-120</span>
            <span>230 Malignant HTN</span>
          </div>
        </div>

        {/* SpO2 Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Gauge className="w-3.5 h-3.5 text-teal-500" />
              <span>Oxygen Saturation (SpO2):</span>
            </span>
            <span className={`font-mono font-bold ${vitals.spO2 < 90 ? 'text-rose-600' : 'text-slate-900'}`}>
              {vitals.spO2}%
            </span>
          </div>
          <input
            type="range"
            min="70"
            max="100"
            value={vitals.spO2}
            onChange={(e) => handleSliderChange('spO2', Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>70% Severe Hypoxia</span>
            <span>Normal &ge;95%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Respiratory Rate Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Zap className="w-3.5 h-3.5 text-cyan-500" />
              <span>Respiratory Rate:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{vitals.respiratoryRate}/min</span>
          </div>
          <input
            type="range"
            min="8"
            max="50"
            value={vitals.respiratoryRate}
            onChange={(e) => handleSliderChange('respiratoryRate', Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>8 Bradypnea</span>
            <span>Normal 12-20</span>
            <span>50 Tachypnea</span>
          </div>
        </div>
      </div>

      {/* Simulation Result Output */}
      {simulationResult && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Simulation Outcome:
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-rose-600 text-white">
                New Triage: {simulationResult.newTriageCategory}
              </span>
              <span
                className={`text-xs font-bold ${
                  simulationResult.triageShift === 'Escalated'
                    ? 'text-rose-600'
                    : 'text-emerald-600'
                }`}
              >
                ({simulationResult.triageShift})
              </span>
            </div>

            <button
              onClick={() => onApplyVitalsToPatient(vitals)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs"
            >
              Apply Simulated Vitals to EHR
            </button>
          </div>

          <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">Risk Delta Summary:</span>
            <p className="leading-relaxed">{simulationResult.riskDeltaSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-rose-200">
              <span className="font-bold text-rose-900 block mb-1">Newly Emerged Critical Hazards:</span>
              <ul className="space-y-1">
                {simulationResult.newCriticalHazards.map((h, i) => (
                  <li key={i} className="text-rose-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-white rounded-xl border border-teal-200">
              <span className="font-bold text-teal-900 block mb-1">Emergency Countermeasures:</span>
              <ul className="space-y-1">
                {simulationResult.emergencyCountermeasures.map((c, i) => (
                  <li key={i} className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
