import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  label,
  className,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  const textMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-medium',
  }[size];

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-blue-500/20 border-t-blue-500 animate-spin',
          sizeMap
        )}
      />
      {label && <p className={cn('text-slate-400 font-mono tracking-wide', textMap)}>{label}</p>}
    </div>
  );
}
