'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Trash2 } from 'lucide-react';
import { deleteCurrentAccount, logout } from '@/lib/auth';

interface AccountActionsProps {
  onAction?: () => void;
}

export function AccountActions({ onAction }: AccountActionsProps) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    onAction?.();
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Delete this demo account from this browser? This will prevent this demo ID from signing in again here. It does not delete data from a server.'
    );
    if (!confirmed || !deleteCurrentAccount()) return;

    onAction?.();
    router.replace('/login');
  };

  return (
    <div className="space-y-1.5">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-red-400/80">
        Account
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
      >
        <LogOut className="h-5 w-5" />
        <span>Log out</span>
      </button>
      <button
        type="button"
        onClick={handleDeleteAccount}
        className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
      >
        <Trash2 className="h-5 w-5" />
        <span>Delete account</span>
      </button>
    </div>
  );
}