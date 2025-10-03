import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-scholiax-purple text-white hover:bg-scholiax-purple/90 shadow-lg hover:shadow-xl',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl',
        outline:
          'border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-scholiax-purple hover:bg-scholiax-purple/10 text-gray-700 hover:text-gray-900',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm hover:shadow-md',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-600',
        link: 'text-scholiax-purple underline-offset-4 hover:underline hover:text-scholiax-purple/80',
        success: 'bg-scholiax-teal text-white hover:bg-scholiax-teal/90 shadow-lg hover:shadow-xl',
        warning: 'bg-scholiax-lavender text-white hover:bg-scholiax-lavender/90 shadow-lg hover:shadow-xl',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
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
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
