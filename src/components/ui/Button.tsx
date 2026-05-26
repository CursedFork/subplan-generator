import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-sans font-semibold tracking-wide transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary:
          'bg-terracotta text-paper rounded-md px-5 py-2.5 hover:bg-terracotta/90 active:bg-terracotta/80 shadow-sm hover:shadow',
        outline:
          'border border-rule bg-transparent text-ink rounded-md px-5 py-2.5 hover:border-terracotta hover:text-terracotta hover:bg-terracotta-soft/40',
        ghost:
          'bg-transparent text-ink-soft rounded-md px-4 py-2 hover:text-ink hover:bg-rule/50',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-13 px-7 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
