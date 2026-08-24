import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Logo({ className = '', iconOnly = false, variant = 'dark', size = 'md' }: LogoProps) {
  const textColor = variant === 'dark' ? 'text-primary' : 'text-white';
  
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
    '2xl': 'text-6xl',
  };
  
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  const currentIconSize = iconSizes[size];
  const borderClass = variant === 'dark' ? 'border-primary' : 'border-white';
  const crossClass = variant === 'dark' ? 'bg-primary' : 'bg-white';

  return (
    <div className={`flex items-center gap-2 font-display uppercase tracking-widest ${sizeClasses[size]} ${textColor} ${className}`}>
      {/* Brutalist Medical Cross Logo Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${currentIconSize} bg-accent border-2 ${borderClass}`}>
         <div className={`absolute w-[60%] h-[20%] ${crossClass}`}></div>
         <div className={`absolute w-[20%] h-[60%] ${crossClass}`}></div>
      </div>
      {!iconOnly && <span>CarePoint</span>}
    </div>
  );
}

export function LogoIcon({ className = '', size = 'md', variant = 'dark' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl', variant?: 'dark' | 'light' }) {
  return <Logo className={className} size={size} variant={variant} iconOnly />;
}
