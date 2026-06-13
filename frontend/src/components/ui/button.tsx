import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium transition duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b6d5cf] dark:focus-visible:ring-[#31534d]',
  {
    variants: {
      variant: {
        default:
          'border border-[#2f6f68] bg-[#2f6f68] text-white shadow-sm shadow-teal-950/[0.05] hover:-translate-y-px hover:border-[#285f59] hover:bg-[#285f59] dark:border-[#4c9188] dark:bg-[#3d827a] dark:text-white dark:hover:border-[#62a79d] dark:hover:bg-[#4c9188]',
        secondary:
          'border border-transparent bg-[#f4f0e9] text-[#37352f] shadow-[inset_0_0_0_1px_rgba(55,53,47,0.035),0_1px_2px_rgba(55,53,47,0.02)] hover:-translate-y-px hover:bg-[#eee8df] dark:bg-[#211e19] dark:text-[#f4f1ea] dark:shadow-[inset_0_0_0_1px_rgba(244,241,234,0.045),0_1px_2px_rgba(0,0,0,0.14)] dark:hover:bg-[#2a261f]',
        outline:
          'border border-transparent bg-[#f4f0e9] text-[#37352f] shadow-[inset_0_0_0_1px_rgba(55,53,47,0.055)] hover:-translate-y-px hover:bg-[#eee8df] dark:bg-[#211e19] dark:text-[#f4f1ea] dark:shadow-[inset_0_0_0_1px_rgba(244,241,234,0.06)] dark:hover:bg-[#2a261f]',
        ghost:
          'text-[#6b645c] hover:bg-[#f0ece5] hover:text-[#37352f] dark:text-[#b7afa4] dark:hover:bg-[#23201b] dark:hover:text-[#f4f1ea]',
        destructive:
          'border border-[#b84a3c] bg-[#b84a3c] text-white hover:border-[#a64034] hover:bg-[#a64034]',
      },
      size: {
        default: 'h-9 px-3.5',
        sm: 'h-7 px-2.5 text-xs',
        lg: 'h-10 px-4',
        icon: 'h-9 w-9 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
