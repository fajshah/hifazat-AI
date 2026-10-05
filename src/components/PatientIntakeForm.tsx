import React, { useState } from 'react';
import { PatientCase, PatientVitals } from '../types/clinical';
import {
  Heart,
  Activity,
  Gauge,
  Thermometer,
  Zap,
  Mic,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  Stethoscope,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface PatientIntakeFormProps {
  patient: PatientCase;
  onChangePatient: (updated: PatientCase) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onOpenVoiceModal: () => void;
}

const COMMON_CHIEF_COMPLAINTS = [
  'Crushing retrosternal chest pain with diaphoresis',
  'Acute respiratory distress & inspiratory stridor',
  'Geriatric acute delirium with cloudy urine & fever',
  'Sudden thunderclap occipital headache & emesis',
  'Rapid deep breathing, vomiting & dehydration',
  'Sudden left-sided facial droop and arm weakness',
];

export const PatientIntakeForm: React.FC<PatientIntakeFormProps> = ({
  patient,
  onChangePatient,
  onAnalyze,
  isAnalyzing,
  onOpenVoiceModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'vitals' | 'history' | 'labs'>('vitals');

  const updateVitals = (key: keyof PatientVitals, val: number) => {
    onChangePatient({
      ...patient,
      vitals: {
        ...patient.vitals,
        [key]: val,
      },
    });
  };

  const updateField = (key: keyof PatientCase, val: any) => {
    onChangePatient({
      ...patient,
      [key]: val,
    });
  };

  // Helper flags for visual cueing on abnormal vitals
  const isHRHigh = patient.vitals.heartRate > 100 || patient.vitals.heartRate < 50;
  const isBPHigh = patient.vitals.bloodPressureSys > 140 || patient.vitals.bloodPressureSys < 90;
  const isHypoxic = patient.vitals.spO2 < 95;
  const isTachypneic = patient.vitals.respiratoryRate > 20 || patient.vitals.respiratoryRate < 10;
  const isFebrile = patient.vitals.temperatureC > 38.0 || patient.vitals.temperatureC < 36.0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <span>Emergency Patient Intake Record</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Electronic Health Record (EHR) Standard</span>
              <span aria-hidden="true">·</span>
              <span>ICD-10 & ESI Protocol Ready</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-teal-600" />
            <span>Voice / Radio Handoff</span>
          </button>
        </div>

        {/* Patient Demographics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Patient Name</label>
            <input
              type="text"
              value={patient.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Age</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={patient.age}
                onChange={(e) => updateField('age', Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <span className="text-xs text-slate-500">yrs</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Gender</label>
            <select
              value={patient.gender}
              onChange={(e) => updateField('gender', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Weight</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={patient.weightKg || 70}
                onChange={(e) => updateField('weightKg', Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <span className="text-xs text-slate-500">kg</span>
            </div>
          </div>
        </div>

        {/* Chief Complaint & HPI */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Chief Complaint (Primary Stated Emergency)
              </label>
              <span className="text-[11px] text-slate-400">High priority weighting</span>
            </div>
            <input
              type="text"
              value={patient.chiefComplaint}
              onChange={(e) => updateField('chiefComplaint', e.target.value)}
              placeholder="e.g., Severe retrosternal chest pain radiating to jaw..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />

            {/* Quick symptom presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_CHIEF_COMPLAINTS.map((complaint, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateField('chiefComplaint', complaint)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-left"
                >
                  {complaint}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              History of Present Illness (HPI) & Onset Chronology
            </label>
            <textarea
              value={patient.hpi}
              onChange={(e) => updateField('hpi', e.target.value)}
              rows={3}
              placeholder="Onset time, progression, aggravating/alleviating factors, associated symptoms..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 leading-relaxed"
            />
          </div>
        </div>

        {/* Sub-tab navigation: Vitals vs History vs Preliminary Labs */}
        <div className="border-b border-slate-200 mb-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('vitals')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              activeSubTab === 'vitals'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Real-Time Vital Signs
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              activeSubTab === 'history'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Medical History & Meds
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('labs')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              activeSubTab === 'labs'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bedside Diagnostics & Labs
          </button>
        </div>

        {/* Tab 1: Real-Time Vital Signs */}
        {activeSubTab === 'vitals' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Heart Rate */}
            <div
              className={`p-3 rounded-xl border ${
                isHRHigh ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Heart Rate</span>
                </span>
                <span className="text-[10px] text-slate-400">60-100</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={patient.vitals.heartRate}
                  onChange={(e) => updateVitals('heartRate', Number(e.target.value))}
                  className="w-16 text-lg font-bold text-slate-900 bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">bpm</span>
              </div>
            </div>

            {/* Blood Pressure */}
            <div
              className={`p-3 rounded-xl border ${
                isBPHigh ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span>Blood Pressure</span>
                </span>
                <span className="text-[10px] text-slate-400">120/80</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={patient.vitals.bloodPressureSys}
                  onChange={(e) => updateVitals('bloodPressureSys', Number(e.target.value))}
                  className="w-12 text-lg font-bold text-slate-900 bg-transparent focus:outline-none"
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="number"
                  value={patient.vitals.bloodPressureDia}
                  onChange={(e) => updateVitals('bloodPressureDia', Number(e.target.value))}
                  className="w-12 text-lg font-bold text-slate-900 bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">mmHg</span>
              </div>
            </div>

            {/* SpO2 */}
            <div
              className={`p-3 rounded-xl border ${
                isHypoxic ? 'border-rose-400 bg-rose-50/70' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-teal-500" />
                  <span>Oxygen (SpO2)</span>
                </span>
                <span className="text-[10px] text-slate-400">&ge;95%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={patient.vitals.spO2}
                  onChange={(e) => updateVitals('spO2', Number(e.target.value))}
                  className="w-16 text-lg font-bold text-slate-900 bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">%</span>
              </div>
            </div>

            {/* Respiratory Rate */}
            <div
              className={`p-3 rounded-xl border ${
                isTachypneic ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Respiration</span>
                </span>
                <span className="text-[10px] text-slate-400">12-20</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={patient.vitals.respiratoryRate}
                  onChange={(e) => updateVitals('respiratoryRate', Number(e.target.value))}
                  className="w-16 text-lg font-bold text-slate-900 bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">/min</span>
              </div>
            </div>

            {/* Temperature */}
            <div
              className={`p-3 rounded-xl border ${
                isFebrile ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                  <span>Body Temp</span>
                </span>
                <span className="text-[10px] text-slate-400">36.5-37.5</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={patient.vitals.temperatureC}
                  onChange={(e) => updateVitals('temperatureC', parseFloat(e.target.value))}
                  className="w-16 text-lg font-bold text-slate-900 bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">&deg;C</span>
              </div>
            </div>

            {/* Pain Score */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-medium">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pain Score</span>
                </span>
                <span className="text-[10px] text-slate-400">0 - 10</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={patient.vitals.painScore}
                  onChange={(e) => updateVitals('painScore', Number(e.target.value))}
                  className="w-16 text-lg font-bold text-slate-900 bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">/10</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Medical History & Meds */}
        {activeSubTab === 'history' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Past Medical History (PMH)
              </label>
              <input
                type="text"
                value={(patient.pmh || []).join(', ')}
                onChange={(e) =>
                  updateField(
                    'pmh',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g. Hypertension, Type 2 Diabetes, Asthmatic (comma separated)..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Current Medications
              </label>
              <input
                type="text"
                value={(patient.medications || []).join(', ')}
                onChange={(e) =>
                  updateField(
                    'medications',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g. Lisinopril 20mg, Metformin 1000mg BID..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Allergies
              </label>
              <input
                type="text"
                value={(patient.allergies || []).join(', ')}
                onChange={(e) =>
                  updateField(
                    'allergies',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g. Penicillin (Anaphylaxis), Sulfa (Rash)..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Preliminary Diagnostics & Labs */}
        {activeSubTab === 'labs' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 mb-2">
              Preliminary bedside testing and lab markers currently available:
            </div>
            {patient.preliminaryLabs && Object.keys(patient.preliminaryLabs).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(patient.preliminaryLabs).map(([k, v]) => (
                  <div key={k} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize">
                      {k.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No preliminary labs loaded. Select a benchmark case or enter values manually.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer: Run AI Triage Engine */}
      <div className="pt-6 mt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing || !patient.chiefComplaint}
          className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Clinical Pathophysiology...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Execute Deep AI Triage & Differential Diagnosis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
