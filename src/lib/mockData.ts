import type { Candidate, User } from '@/types';
import { TECHNOLOGIES, SKILLS_BY_TECH } from '@/constants';

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Female first names — used to assign gender
const FEMALE_NAMES = new Set([
  'Ananya','Diya','Saanvi','Aadhya','Kiara','Anika','Priya','Riya',
  'Sneha','Neha','Pooja','Shreya','Divya','Meera','Tanvi','Ishita',
  'Kavya','Aishwarya','Nisha','Rekha',
]);

const FIRST = [
  'Aarav','Vivaan','Aditya','Arjun','Sai','Reyansh','Krishna','Ishaan','Rohan','Karthik',
  'Ananya','Diya','Saanvi','Aadhya','Kiara','Anika','Priya','Riya','Sneha','Neha',
  'Rahul','Nikhil','Varun','Akash','Deepak','Manish','Sandeep','Vikram','Harsh','Suresh',
  'Pooja','Shreya','Divya','Meera','Tanvi','Ishita','Kavya','Aishwarya','Nisha','Rekha',
];
const LAST = [
  'Sharma','Verma','Patel','Reddy','Nair','Iyer','Menon','Gupta','Joshi','Rao',
  'Kulkarni','Desai','Mehta','Singh','Chopra','Bose','Das','Pillai','Naidu','Khanna',
];
const AVAIL = ['Available','Available','Engaged','Notice Period'] as const;

function buildBatch(recruiterId: string, count: number, startIdx: number): Candidate[] {
  const rand = mulberry32(startIdx * 7919 + 13);
  const out: Candidate[] = [];
  for (let i = 0; i < count; i++) {
    const idx   = startIdx + i;
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last  = LAST[Math.floor(rand() * LAST.length)];
    const name  = `${first} ${last}`;
    const tech  = TECHNOLOGIES[Math.floor(rand() * TECHNOLOGIES.length)];
    const exp   = 2 + Math.floor(rand() * 13);
    const pool  = SKILLS_BY_TECH[tech] ?? [];
    const skills = [...pool].sort(() => rand() - 0.5).slice(0, 4);
    const rate  = 25 + Math.floor(rand() * 70);
    const avail = AVAIL[Math.floor(rand() * AVAIL.length)];
    const status = rand() > 0.18 ? 'Active' : 'Pending' as const;
    const days  = Math.floor(rand() * 220);
    const gender: 'male' | 'female' = FEMALE_NAMES.has(first) ? 'female' : 'male';
    out.push({
      id: `cand-${idx.toString().padStart(3, '0')}`,
      recruiterId,
      name,
      photo: '',        // not used — avatar rendered from gender + id
      gender,
      technology: tech,
      experience: exp,
      skills,
      summary: `${first} is a pre-vetted ${tech} specialist with ${exp} years of hands-on delivery. Cleared Qpact's technical evaluation, background verification and live coding assessment.`,
      ratePerHour: rate,
      availability: avail,
      status,
      createdAt: new Date(Date.now() - days * 86_400_000).toISOString(),
      documents: { resume: true, evaluationReport: rand() > 0.1, backgroundReport: rand() > 0.15 },
    });
  }
  return out;
}

export const seedCandidates: Candidate[] = [
  ...buildBatch('rec-a', 20, 1),
  ...buildBatch('rec-b', 30, 21),
  ...buildBatch('rec-c', 10, 51),
];

export const seedUsers: User[] = [
  {
    id: 'usr-client', role: 'client',
    email: 'client@acme.com', password: 'qpact123',
    firstName: 'Jordan', lastName: 'Hale',
    companyName: 'Acme Corp', designation: 'VP Engineering', phone: '+1 415 555 0142',
  },
  {
    id: 'rec-a', role: 'recruiter',
    email: 'asha@talentbridge.in', password: 'qpact123',
    firstName: 'Asha', lastName: 'Menon',
    companyName: 'TalentBridge', designation: 'Lead Recruiter', phone: '+91 80 4567 1010',
  },
  {
    id: 'rec-b', role: 'recruiter',
    email: 'bhuvan@hirestack.in', password: 'qpact123',
    firstName: 'Bhuvan', lastName: 'Rao',
    companyName: 'HireStack', designation: 'Talent Manager', phone: '+91 80 4567 2020',
  },
  {
    id: 'rec-c', role: 'recruiter',
    email: 'chetan@sourcely.in', password: 'qpact123',
    firstName: 'Chetan', lastName: 'Desai',
    companyName: 'Sourcely', designation: 'Recruitment Specialist', phone: '+91 80 4567 3030',
  },
  {
    id: 'usr-admin', role: 'admin',
    email: 'admin@qpact.io', password: 'admin123',
    firstName: 'Super', lastName: 'Admin',
    companyName: 'Qpact', designation: 'Platform Admin', phone: '+1 800 000 0000',
  },
];
