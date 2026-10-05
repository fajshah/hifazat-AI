export interface PatientVitals {
  heartRate: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  respiratoryRate: number;
  spO2: number;
  temperatureC: number;
  painScore: number;
}

export interface PatientCase {
  id?: string;
  name: string;
  age: number;
  gender: string;
  weightKg?: number;
  chiefComplaint: string;
  hpi: string;
  pmh: string[];
  medications: string[];
  allergies: string[];
  vitals: PatientVitals;
  physicalExam?: string;
  preliminaryLabs?: Record<string, string>;
}

export interface VitalSignAlert {
  parameter: string;
  value: string;
  alert: string;
  severity: 'critical' | 'warning' | 'normal';
}

export interface DifferentialDiagnosis {
  diagnosis: string;
  icd10: string;
  probabilityPct: number;
  pathophysiology: string;
  distinguishingFactors: string;
}

export interface DiagnosticWorkup {
  immediateBedside: string[];
  urgentLabs: string[];
  imaging: string[];
}

export interface GuidelineGrounding {
  source: string;
  summary: string;
  levelOfEvidence: string;
}

export interface PatientCommunicationPlan {
  plainLanguageDiagnosis: string;
  nextSteps: string;
  warningSymptomsToReport: string;
}

export interface TriageResult {
  triageCategory: 'ESI-1' | 'ESI-2' | 'ESI-3' | 'ESI-4' | 'ESI-5' | string;
  triageLevelName: string;
  triageColor: 'red' | 'orange' | 'amber' | 'green' | 'blue' | string;
  recommendedTimeframe: string;
  severityScore: number;
  vitalSignAlerts: VitalSignAlert[];
  redFlags: string[];
  primaryDifferential: DifferentialDiagnosis[];
  diagnosticWorkup: DiagnosticWorkup;
  immediateInterventions: string[];
  guidelineGrounding: GuidelineGrounding;
  patientCommunicationPlan: PatientCommunicationPlan;
  meta?: {
    modelUsed: string;
    latencyMs: number;
    timestamp: string;
  };
}

export interface BenchmarkCase {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  patient: PatientCase;
  goldStandard: {
    expectedEsi: string;
    expectedTriage: string;
    topDiagnosis: string;
    guidelineKey: string;
  };
}

export interface WhatIfSimulationResult {
  newTriageCategory: string;
  triageShift: 'Escalated' | 'De-escalated' | 'Stable' | string;
  riskDeltaSummary: string;
  newCriticalHazards: string[];
  adjustedDifferentialShift: string;
  emergencyCountermeasures: string[];
  simulatedVitals?: PatientVitals;
  latencyMs?: number;
}
