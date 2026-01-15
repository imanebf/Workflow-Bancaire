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
