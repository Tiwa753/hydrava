// Simple cookie + localStorage auth for demo purposes.
// Replace with real JWT/session system before production.

const SESSION_KEY = 'hydrava_session';
const DELETED_ACCOUNTS_KEY = 'hydrava_deleted_accounts';

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
  const normalizedStaffId = staffId.toUpperCase();
  const account = DEMO_ACCOUNTS[normalizedStaffId];
  if (!account || account.password !== password || isAccountDeleted(normalizedStaffId)) return null;
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

export function deleteCurrentAccount(): boolean {
  if (typeof window === 'undefined') return false;

  const user = getCurrentUser();
  if (!user) return false;

  const deletedAccounts = getDeletedAccounts();
  if (!deletedAccounts.includes(user.staffId)) {
    localStorage.setItem(DELETED_ACCOUNTS_KEY, JSON.stringify([...deletedAccounts, user.staffId]));
  }
  logout();
  return true;
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

function isAccountDeleted(staffId: string): boolean {
  return getDeletedAccounts().includes(staffId);
}

function getDeletedAccounts(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const deletedAccounts: unknown = JSON.parse(localStorage.getItem(DELETED_ACCOUNTS_KEY) ?? '[]');
    return Array.isArray(deletedAccounts)
      ? deletedAccounts.filter((staffId): staffId is string => typeof staffId === 'string')
      : [];
  } catch {
    return [];
  }
}
