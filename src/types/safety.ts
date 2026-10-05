export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface SafetySituationAnalysis {
  threatLevel: 'critical' | 'high' | 'moderate' | 'caution';
  threatScore: number;
  immediateActionUrdu: string;
  immediateActionEnglish: string;
  recommendedCountermeasures: string[];
  emergencyDispatchMessage: string;
  deescalationPhrases: string[];
}

export interface HelplineItem {
  name: string;
  number: string;
  category: string;
  description: string;
  descriptionUrdu: string;
}

export interface MissingChildReport {
  childName: string;
  childAge: number;
  gender: string;
  lastSeenLocation: string;
  clothing: string;
  distinguishingFeatures?: string;
  contactNumber: string;
  imageUrl?: string;
  createdAt: string;
}

export interface SafeJourneyState {
  isActive: boolean;
  destination: string;
  vehicleDetails: string;
  durationMinutes: number;
  startedAt: number;
  expectedArrival: number;
}
