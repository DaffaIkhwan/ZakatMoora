export interface Mustahik {
  id: string;
  name: string;
  address: string;
  phone: string;
  criteria: {
    [key: string]: number;
  };
  subCriteria?: {
    [aspectCode: string]: number; // e.g., C1A, C2A, C2B, C3A, etc.
  };
  businessStatus?: 'naik' | 'stabil' | 'turun';
  registeredDate: string;
}

export interface AidProgram {
  id: string;
  name: string;
  description: string;
  totalBudget: number;
  budgetPerRecipient: number;
  quota: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed';
  selectedCandidates: string[]; // Array of mustahik IDs
  createdAt: string;
}

export interface RecipientHistory {
  id: string;
  mustahikId: string;
  mustahikName: string;
  programId: string;
  programName: string;
  amount: number;
  receivedDate: string;
  mooraScore: number;
  rank: number;
  notes?: string;
}

export interface MonitoringData {
  id: string;
  mustahikId: string;
  mustahikName: string;
  programId: string;
  programName: string;
  monitoringDate: string;
  businessProgress: {
    businessType: string;
    revenue: number;
    profit: number;
    employeeCount: number;
    businessStatus: 'naik' | 'stabil' | 'turun';
  };
  socialEconomicCondition: {
    monthlyIncome: number;
    monthlyExpenditure: number;
    dependentCount: number;
    housingCondition: 'baik' | 'sedang' | 'buruk';
    healthCondition: 'sehat' | 'sakit ringan' | 'sakit berat';
    educationLevel: 'meningkat' | 'tetap' | 'menurun';
  };
  challenges: string;
  achievements: string;
  nextPlan: string;
  surveyor: string;
  notes: string;
}

export interface CandidateWithScore extends Mustahik {
  normalizedCriteria: Record<string, number>;
  avgNormalizedCriteria?: Record<string, number>; // New field for display
  weightedNormalized: Record<string, number>;
  normalizedSubCriteria?: Record<string, number>;
  weightedSubCriteria?: Record<string, number>;
  mooraScore: number;
  rank: number;
}

export type UserRole = 'super_admin' | 'manajer' | 'surveyor' | 'mustahik';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export interface AspectOption {
  label: string;
  value: number;
}

export interface Aspect {
  code: string;
  name: string;
  options: AspectOption[];
}

export interface Criterion {
  code: string;
  name: string;
  weight: number;
  type?: 'benefit' | 'cost'; // Optional, default to benefit
  icon: string; // Store icon name as string for persistence
  color: string;
  description: string;
  aspects: Aspect[];
}