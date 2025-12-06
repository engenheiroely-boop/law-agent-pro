import React from 'react';

/**
 * Badge Component
 * Reusable status badge with variants for different states
 */
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
    pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    accent: 'bg-accent/10 text-accent border-accent/20'
};

const dotStyles: Record<BadgeVariant, string> = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-sky-500',
    accent: 'bg-accent'
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'sm',
    dot = false,
    pulse = false
}) => {
    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-2 py-0.5'
        : 'text-xs px-2.5 py-1';

    return (
        <span className={`
      inline-flex items-center gap-1.5 font-semibold rounded-full border
      ${variantStyles[variant]} ${sizeClasses}
      transition-all duration-200
    `}>
            {dot && (
                <span className={`
          w-1.5 h-1.5 rounded-full ${dotStyles[variant]}
          ${pulse ? 'animate-pulse' : ''}
        `} />
            )}
            {children}
        </span>
    );
};

export default Badge;
