import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-purple-500 text-white hover:shadow-glow-primary hover:brightness-110",
    secondary: "bg-gradient-to-r from-secondary to-cyan-400 text-background hover:shadow-glow-secondary hover:brightness-110",
    outline: "border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 text-text",
    ghost: "hover:bg-surface-light text-text-muted hover:text-text",
    danger: "bg-gradient-to-r from-accent to-red-400 text-white hover:shadow-glow-accent hover:brightness-110",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-5 py-2 text-sm gap-2",
    lg: "h-12 px-8 text-base gap-2",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
