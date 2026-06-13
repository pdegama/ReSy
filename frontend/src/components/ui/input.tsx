import * as React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-transparent bg-[#f4f0e9] px-3 py-2 text-sm text-[#37352f] outline-none shadow-[inset_0_0_0_1px_rgba(55,53,47,0.03)] transition duration-150 ease-out placeholder:text-[#a69d92] hover:bg-[#f0ebe3] focus:bg-white focus:shadow-[inset_0_0_0_1px_rgba(47,111,104,0.24),0_0_0_3px_rgba(47,111,104,0.09)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#211e19] dark:text-[#f4f1ea] dark:placeholder:text-[#7f766b] dark:shadow-[inset_0_0_0_1px_rgba(244,241,234,0.035)] dark:hover:bg-[#26221d] dark:focus:bg-[#191815] dark:focus:shadow-[inset_0_0_0_1px_rgba(76,145,136,0.3),0_0_0_3px_rgba(76,145,136,0.13)]',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
