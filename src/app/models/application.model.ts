export interface Applicant {
  nom: string;
  cin: string;
  telephone: string;
  email: string;
}

export interface LoanDetails {
  prixBien: number;
  apport: number;
  duree: number;
  typeBien: string;
}

export interface FinancialSituation {
  revenusMensuels: number;
  chargesMensuelles: number;
}

export type ApplicationStatus =
  | 'Brouillon'
  | 'Soumis'
  | 'Pre-analyse'
  | 'Documents requis'
  | 'Analyse finale'
  | 'Offre generee'
  | 'Signature'
  | 'Accepte'
  | 'Refuse';

export interface Application {
  id?: string;
  reference?: string;
  applicant: Applicant;
  loan: LoanDetails;
  finances: FinancialSituation;
  status: ApplicationStatus;
  createdAt: Date;
}


export const WORKFLOW_STEPS = [
  { status: 'Brouillon', label: 'Brouillon', icon: 'edit' },
  { status: 'Soumis', label: 'Soumis', icon: 'send' },
  { status: 'Pre-analyse', label: 'Pré-analyse', icon: 'auto_fix_high' },
  { status: 'Documents requis', label: 'Documents requis', icon: 'description' },
  { status: 'Analyse finale', label: 'Analyse finale', icon: 'rule' },
  { status: 'Offre generee', label: 'Offre générée', icon: 'document_scanner' },
  { status: 'Signature', label: 'Signature', icon: 'draw' }, // ← ✅ corrigé
  { status: 'Accepte', label: 'Accepté', icon: 'check_circle' },
  { status: 'Refuse', label: 'Refusé', icon: 'cancel' }
] as const;
