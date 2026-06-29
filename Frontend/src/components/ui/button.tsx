import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'sheen bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_6px_18px_-6px_rgba(5,150,105,0.6)] hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_10px_26px_-8px_rgba(5,150,105,0.7)] hover:-translate-y-0.5',
        outline:
          'border border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:bg-white hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        destructive:
          'sheen bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_6px_18px_-6px_rgba(225,29,72,0.6)] hover:from-rose-500 hover:to-rose-700 hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
);
Button.displayName = 'Button';
