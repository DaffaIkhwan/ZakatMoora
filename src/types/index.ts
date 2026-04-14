export interface Muzakki {
  id: string;
  userId: string;
  nik?: string;
  name: string;
  address?: string;
  phone?: string;
  job?: string;
  institution?: string;
  registeredDate: string;
  user?: User;
  _count?: {
    donations: number;
  };
}

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
  collectedDonations?: number; // Optional total collections
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
    revenue: number; // Omzet (O_t)
    operationalCost?: number; // Biaya Operasional (B_t)
    netIncome?: number; // Pendapatan Bersih (Y_t)
    profit?: number; // Legacy
    employeeCount?: number;
    businessStatus?: 'naik' | 'stabil' | 'turun';
  };
  socialEconomicCondition: {
    monthlyExpenditure: number; // Konsumsi Esensial (C_t)
    monthlyIncome?: number;
    dependentCount?: number;
    housingCondition?: 'baik' | 'sedang' | 'buruk';
    healthCondition?: 'sehat' | 'sakit ringan' | 'sakit berat';
    educationLevel?: 'meningkat' | 'tetap' | 'menurun';
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

export type UserRole = 'super_admin' | 'manajer' | 'surveyor' | 'mustahik' | 'muzakki';

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

export interface MuzakkiDashboardData {
  muzakkiInfo: {
    name: string;
    address?: string;
    phone?: string;
    job?: string;
    institution?: string;
    registeredDate: string;
  };
  hasDonations: boolean;
  poolBalance: number;
  totalDonations: number;
  personalStats: {
    totalDonated: number;
    donationCount: number;
  } | null;
  globalStats: {
    totalDistributed: number;
    totalPrograms: number;
    totalRecipients: number;
  };
  allPrograms: {
    id: string;
    name: string;
    description: string;
    status: string;
    totalBudget: number;
    budgetPerRecipient: number;
    quota: number;
    startDate: string;
    endDate: string;
    allocatedFunds: number;
    mustahiks: {
      id: string;
      name: string;
      amountReceived: number;
      receivedDate: string;
      businessStatus: string;
    }[];
  }[];
}