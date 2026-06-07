import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-md border border-rule bg-paper px-3 py-2',
          'font-sans text-sm text-ink',
          'transition-all duration-150 theme-aware appearance-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:border-terracotta',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Custom caret via background-image
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23718096\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center] pr-8',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';

export { Select };
