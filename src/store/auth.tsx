import { createContext, useContext, useState, type ReactNode, useRef } from 'react';
import type { AuthUser, RegisterInput, Role, User } from '@/types';
import { seedUsers } from '@/lib/mockData';
import { delay } from '@/lib/utils';

// ── Global registry — shared across all provider instances in the same tab ──
// This means admin-added recruiters and self-registered clients are instantly
// visible to login and to admin dashboards.
const _globalRegistry: User[] = [...seedUsers];

export function getGlobalRegistry(): User[] { return _globalRegistry; }
export function pushToRegistry(u: User)     { _globalRegistry.push(u); }
export function updateInRegistry(id: string, patch: Partial<User>) {
  const idx = _globalRegistry.findIndex(u => u.id === id);
  if (idx !== -1) Object.assign(_globalRegistry[idx], patch);
}
export function removeFromRegistry(id: string) {
  const idx = _globalRegistry.findIndex(u => u.id === id);
  if (idx !== -1) _globalRegistry.splice(idx, 1);
}

interface AuthCtx {
  user: AuthUser | null;
  login(email: string, password: string, role: Role): Promise<AuthUser>;
  register(input: RegisterInput): Promise<void>;
  confirmOtp(code: string): Promise<AuthUser>;
  pendingEmail: string | null;
  logout(): void;
}
const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pending = useRef<User | null>(null);

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const s = sessionStorage.getItem('qpact.session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  function persist(u: AuthUser | null) {
    setUser(u);
    if (u) sessionStorage.setItem('qpact.session', JSON.stringify(u));
    else   sessionStorage.removeItem('qpact.session');
  }

  async function login(email: string, password: string, role: Role): Promise<AuthUser> {
    await delay(700);
    const f = _globalRegistry.find(
      u => u.email.toLowerCase() === email.toLowerCase() &&
           u.password === password &&
           u.role === role,
    );
    if (!f) throw new Error(`No ${role} account matches those credentials.`);
    const { password: _, ...safe } = f;
    persist(safe);
    return safe;
  }

  async function register(input: RegisterInput): Promise<void> {
    await delay(800);
    if (_globalRegistry.some(u => u.email.toLowerCase() === input.email.toLowerCase()))
      throw new Error('Account already exists with this email.');
    pending.current = {
      id: `usr-${Math.random().toString(36).slice(2,8)}`,
      role: 'client',
      ...input,
    };
    setPendingEmail(input.email);
  }

  async function confirmOtp(code: string): Promise<AuthUser> {
    await delay(600);
    if (!/^\d{6}$/.test(code)) throw new Error('Enter a 6-digit code.');
    if (code === '000000')     throw new Error('Incorrect code. Try again.');
    if (!pending.current)      throw new Error('No pending registration.');
    // ── Push into global registry so admin sees it immediately ──
    pushToRegistry(pending.current);
    const { password: _, ...safe } = pending.current;
    pending.current = null;
    setPendingEmail(null);
    return safe;
  }

  function logout() { persist(null); }

  return (
    <AuthContext.Provider value={{ user, login, register, confirmOtp, pendingEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
