// ─── Roles ───────────────────────────────────────────────────────────────────
export type Role = 'client' | 'recruiter' | 'admin';

// ─── Candidate ───────────────────────────────────────────────────────────────
export type Technology =
  | 'AI Engineer' | 'Data Engineer' | '.NET' | 'Java' | 'Python'
  | 'SAP' | 'QE - Functional' | 'QE - Automation' | 'QE - Security' | 'QE - Performance';

export type Availability = 'Available' | 'Engaged' | 'Notice Period';
export type ResourceStatus = 'Active' | 'Pending';

export interface Candidate {
  id: string;
  recruiterId: string;
  name: string;
  photo: string;
  technology: Technology;
  experience: number;       // years
  skills: string[];
  summary: string;
  ratePerHour: number;      // USD/hr
  availability: Availability;
  status: ResourceStatus;
  createdAt: string;        // ISO
  documents: {
    resume: boolean;
    evaluationReport: boolean;
    backgroundReport: boolean;
  };
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  role: Role;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  designation: string;
  phone: string;
}

export type AuthUser = Omit<User, 'password'>;

// ─── Forms ───────────────────────────────────────────────────────────────────
export interface RegisterInput {
  companyName: string;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  phone: string;
  password: string;
}
