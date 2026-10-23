'use client';

import { useRouter } from 'next/navigation';
import { Beaker, X } from 'lucide-react';
import { useState } from 'react';

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-2.5 min-w-0">
        <Beaker className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-amber-300 text-xs font-medium">
          <span className="font-bold">Demo Mode</span> — Dashboard is showing static placeholder data.
          Live sensor feed is temporarily disconnected.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-300 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
