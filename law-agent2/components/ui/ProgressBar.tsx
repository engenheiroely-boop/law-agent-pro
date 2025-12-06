import React from 'react';

/**
 * ProgressBar Component
 * Animated progress bar with optional label and value display
 */
interface ProgressBarProps {
    value: number; // 0-100
    max?: number;
    label?: string;
    showValue?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
    animated?: boolean;
}

const variantColors: Record<string, string> = {
    default: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    accent: 'bg-accent'
};

const sizeHeights: Record<string, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    label,
    showValue = false,
    size = 'md',
    variant = 'accent',
    animated = true
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="w-full">
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1">
                    {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
                    {showValue && (
                        <span className="text-xs font-mono text-slate-500">
                            {percentage.toFixed(0)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeHeights[size]}`}>
                <div
                    className={`
            ${sizeHeights[size]} ${variantColors[variant]} rounded-full
            ${animated ? 'transition-all duration-500 ease-out' : ''}
          `}
                    style={{ width: `${percentage}%` }}
                >
                    {animated && (
                        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
