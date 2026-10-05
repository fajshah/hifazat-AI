import React, { useState } from 'react';
import { TriageResult, PatientCase } from '../types/clinical';
import {
  ShieldAlert,
  AlertOctagon,
  Clock,
  Layers,
  FileCheck,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Sliders,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Activity,
  HeartCrack,
} from 'lucide-react';

interface TriageResultsViewProps {
  result: TriageResult;
  patient: PatientCase;
  onOpenWhatIf: () => void;
}

export const TriageResultsView: React.FC<TriageResultsViewProps> = ({
  result,
  patient,
  onOpenWhatIf,
}) => {
  const [copiedNote, setCopiedNote] = useState(false);
  const [selectedDiffIndex, setSelectedDiffIndex] = useState(0);

  const getEsiBadgeStyle = (category: string) => {
    switch (category) {
      case 'ESI-1':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          badgeBg: 'bg-rose-600',
          badgeText: 'text-white',
          text: 'text-rose-900',
          label: 'Level 1 · Resuscitation (Immediate Life Threat)',
        };
      case 'ESI-2':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          badgeBg: 'bg-amber-600',
          badgeText: 'text-white',
          text: 'text-amber-900',
          label: 'Level 2 · Emergent (High Risk / Severe Pain)',
        };
      case 'ESI-3':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          badgeBg: 'bg-yellow-600',
          badgeText: 'text-white',
          text: 'text-yellow-900',
          label: 'Level 3 · Urgent (Requires Multiple Resources)',
        };
      case 'ESI-4':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          badgeBg: 'bg-blue-600',
          badgeText: 'text-white',
          text: 'text-blue-900',
          label: 'Level 4 · Less Urgent (Single Resource)',
        };
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          badgeBg: 'bg-emerald-600',
          badgeText: 'text-white',
          text: 'text-emerald-900',
          label: 'Level 5 · Non-Urgent (No Resources Needed)',
        };
    }
  };

  const badgeStyle = getEsiBadgeStyle(result.triageCategory);

  const handleCopyClinicalNote = () => {
    const noteText = `=== PULSETRIAGE AI CLINICAL REPORT ===
Patient: ${patient.name} (${patient.age}y ${patient.gender})
Chief Complaint: ${patient.chiefComplaint}
Vitals: HR ${patient.vitals.heartRate}, BP ${patient.vitals.bloodPressureSys}/${patient.vitals.bloodPressureDia}, RR ${patient.vitals.respiratoryRate}, SpO2 ${patient.vitals.spO2}%, Temp ${patient.vitals.temperatureC}C

TRIAGE RATING: ${result.triageCategory} - ${result.triageLevelName}
Bedside Target Timeframe: ${result.recommendedTimeframe}
Severity Score: ${result.severityScore}/100

TOP DIFFERENTIAL DIAGNOSES:
${result.primaryDifferential
  .map(
    (d, i) =>
      `${i + 1}. ${d.diagnosis} (${d.probabilityPct}%) [ICD-10: ${d.icd10}]
   - Pathophysiology: ${d.pathophysiology}
   - Distinguishing Factors: ${d.distinguishingFactors}`
  )
  .join('\n\n')}

CRITICAL RED FLAGS:
${result.redFlags.map((rf) => `- ${rf}`).join('\n')}

IMMEDIATE INTERVENTIONS:
${result.immediateInterventions.map((int) => `- ${int}`).join('\n')}

DIAGNOSTIC WORKUP:
- Bedside: ${result.diagnosticWorkup.immediateBedside.join(', ')}
- STAT Labs: ${result.diagnosticWorkup.urgentLabs.join(', ')}
- Imaging: ${result.diagnosticWorkup.imaging.join(', ')}

GUIDELINE REFERENCE:
${result.guidelineGrounding.source} (${result.guidelineGrounding.levelOfEvidence})
${result.guidelineGrounding.summary}

PATIENT COMMUNICATION:
${result.patientCommunicationPlan.plainLanguageDiagnosis}
`;

    navigator.clipboard.writeText(noteText);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Triage Decision Banner */}
      <div className={`p-5 rounded-2xl border ${badgeStyle.bg} ${badgeStyle.border} relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl ${badgeStyle.badgeBg} ${badgeStyle.badgeText} flex flex-col items-center justify-center font-extrabold shadow-sm`}>
              <span className="text-sm uppercase tracking-wider opacity-85 leading-none">ESI</span>
              <span className="text-xl leading-none mt-0.5">{result.triageCategory.replace('ESI-', '')}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-extrabold ${badgeStyle.text} tracking-tight`}>
                  {result.triageLevelName || result.triageCategory}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {badgeStyle.label}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Target: {result.recommendedTimeframe}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>Calculated Acuity Score: <strong>{result.severityScore}/100</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenWhatIf}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Vitals Stress</span>
            </button>
            <button
              onClick={handleCopyClinicalNote}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNote ? 'Copied Note' : 'Export Note'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vital Sign Alerts & Red Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vital Sign Anomalies */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Physiologic Vital Alerts</span>
          </h4>
          {result.vitalSignAlerts && result.vitalSignAlerts.length > 0 ? (
            <div className="space-y-2">
              {result.vitalSignAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="font-semibold">{alert.parameter}: {alert.value}</span>
                  <span className="text-[11px] font-medium">{alert.alert}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-3 text-center">
              All monitored vital parameters are within normal physiological bounds.
            </div>
          )}
        </div>

        {/* Immediate Red Flags */}
        <div className="p-4 bg-rose-50/40 border border-rose-200/80 rounded-xl">
          <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>Critical Clinical Hazards & Red Flags</span>
          </h4>
          <ul className="space-y-1.5">
            {result.redFlags.map((flag, idx) => (
              <li key={idx} className="text-xs text-rose-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="font-medium">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ranked Differential Diagnosis Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Ranked Differential Diagnosis Matrix</span>
          </h4>
          <span className="text-xs text-slate-500">Bayesian-calibrated clinical likelihood</span>
        </div>

        <div className="space-y-3">
          {result.primaryDifferential.map((diff, idx) => {
            const isSelected = selectedDiffIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedDiffIndex(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/20 shadow-xs ring-1 ring-teal-500/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {diff.diagnosis}
                    </span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      ICD-10: {diff.icd10}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      {diff.probabilityPct}%
                    </span>
                  </div>
                </div>

                {/* Probability Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0 ? 'bg-teal-600' : idx === 1 ? 'bg-cyan-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${diff.probabilityPct}%` }}
                  />
                </div>

                {/* Expanded Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      Pathophysiological Rationale:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {diff.pathophysiology}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      Key Distinguishing Features:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {diff.distinguishingFactors}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prioritized Diagnostic Workup Requisitions */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-teal-600" />
          <span>Prioritized Diagnostic Workup Requisitions</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Bedside STAT */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-2">
              STAT Bedside Diagnostics
            </span>
            <ul className="space-y-1.5">
              {result.diagnosticWorkup.immediateBedside.map((item, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Urgent Labs */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-2">
              STAT Laboratory Requisitions
            </span>
            <ul className="space-y-1.5">
              {result.diagnosticWorkup.urgentLabs.map((item, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Imaging */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider block mb-2">
              Diagnostic Imaging Modalities
            </span>
            <ul className="space-y-1.5">
              {result.diagnosticWorkup.imaging.map((item, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Immediate 15-30 Min Stabilization Bundle */}
      <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl">
        <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>Immediate 15-30 Minute Stabilization Protocol</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {result.immediateInterventions.map((action, i) => (
            <div key={i} className="bg-white p-2.5 rounded-lg border border-teal-100 text-xs text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                {i + 1}
              </span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guideline Grounding & Patient Communication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guideline Grounding */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>Clinical Practice Guideline Alignment</span>
          </h4>
          <div className="text-xs space-y-1.5">
            <div className="font-bold text-slate-800">
              {result.guidelineGrounding.source}
            </div>
            <div className="text-slate-600 leading-relaxed">
              {result.guidelineGrounding.summary}
            </div>
            <div className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded inline-block border border-teal-200">
              {result.guidelineGrounding.levelOfEvidence}
            </div>
          </div>
        </div>

        {/* Patient Communication Plan */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-700" />
            <span>Patient & Family Plain-Language Translation</span>
          </h4>
          <div className="text-xs space-y-2 text-slate-700">
            <p className="italic">
              "{result.patientCommunicationPlan.plainLanguageDiagnosis}"
            </p>
            <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
              <span className="font-bold text-slate-800 block">Next Steps Explained:</span>
              <p className="text-slate-600 mt-0.5">{result.patientCommunicationPlan.nextSteps}</p>
            </div>
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-100 text-[11px] text-rose-900">
              <span className="font-bold block">Warning Signs to Report:</span>
              <p>{result.patientCommunicationPlan.warningSymptomsToReport}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Footer */}
      {result.meta && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Engine Model: {result.meta.modelUsed}</span>
          <span>Inference Latency: {result.meta.latencyMs}ms</span>
          <span>Timestamp: {new Date(result.meta.timestamp).toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
};
