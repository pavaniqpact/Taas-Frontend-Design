import { z } from 'zod';
import { TECHNOLOGIES } from '@/constants';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, 'Email required').email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

const pwRules = z.string()
  .min(8, 'Min 8 characters')
  .regex(/[A-Z]/, 'Need uppercase')
  .regex(/[a-z]/, 'Need lowercase')
  .regex(/[0-9]/, 'Need number');

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Required'),
  firstName:   z.string().min(1, 'Required'),
  lastName:    z.string().min(1, 'Required'),
  designation: z.string().min(2, 'Required'),
  email:       z.string().min(1, 'Required').email('Invalid email'),
  phone:       z.string().min(7, 'Invalid phone'),
  password:    pwRules,
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
export type RegisterValues = z.infer<typeof registerSchema>;

// ─── Resource ─────────────────────────────────────────────────────────────────
export const resourceSchema = z.object({
  name:         z.string().min(2, 'Name required'),
  technology:   z.enum(TECHNOLOGIES as unknown as [string, ...string[]], { errorMap: () => ({ message: 'Pick a technology' }) }),
  experience:   z.coerce.number().min(0).max(45),
  ratePerHour:  z.coerce.number().min(1, 'Enter a rate').max(500),
  skills:       z.string().min(2, 'Add at least one skill'),
  summary:      z.string().min(10, 'Add a summary').max(600),
  gender:       z.enum(['male','female'], { errorMap: () => ({ message: 'Select gender' }) }),
});
export type ResourceValues = z.infer<typeof resourceSchema>;

// ─── Contact Sales ────────────────────────────────────────────────────────────
export const contactSalesSchema = z.object({
  name:    z.string().min(2, 'Required'),
  company: z.string().min(2, 'Required'),
  email:   z.string().min(1, 'Required').email('Invalid email'),
  message: z.string().min(5, 'Tell us about your need'),
});
export type ContactSalesValues = z.infer<typeof contactSalesSchema>;

// ─── Admin: Create Recruiter ──────────────────────────────────────────────────
export const createRecruiterSchema = z.object({
  firstName:   z.string().min(1, 'Required'),
  lastName:    z.string().min(1, 'Required'),
  email:       z.string().email('Invalid email'),
  companyName: z.string().min(2, 'Required'),
  designation: z.string().min(2, 'Required'),
  phone:       z.string().min(7, 'Required'),
  password:    pwRules,
});
export type CreateRecruiterValues = z.infer<typeof createRecruiterSchema>;

// ─── Password strength ────────────────────────────────────────────────────────
export function passwordStrength(pw: string): { score: number; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return { score: s, label: ['Too weak','Weak','Fair','Strong','Very strong'][s] };
}