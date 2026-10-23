// Simple cookie + localStorage auth for demo purposes.
// Replace with real JWT/session system before production.

const SESSION_KEY = 'hydrava_session';

export interface StaffUser {
  staffId: string;
  name: string;
  role: 'supervisor' | 'admin';
}

// Hardcoded demo accounts — replace with a real backend auth endpoint
const DEMO_ACCOUNTS: Record<string, { password: string; user: StaffUser }> = {
  'SUP-001': {
    password: 'hydrava123',
    user: { staffId: 'SUP-001', name: 'Supervisor A', role: 'supervisor' },
  },
  'ADM-001': {
    password: 'admin2026',
    user: { staffId: 'ADM-001', name: 'Administrator', role: 'admin' },
  },
};

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function login(staffId: string, password: string): StaffUser | null {
  const account = DEMO_ACCOUNTS[staffId.toUpperCase()];
  if (!account || account.password !== password) return null;
  const userJson = JSON.stringify(account.user);
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, userJson);
    setCookie(SESSION_KEY, userJson);
  }
  return account.user;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    deleteCookie(SESSION_KEY);
  }
}

export function getCurrentUser(): StaffUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StaffUser) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
