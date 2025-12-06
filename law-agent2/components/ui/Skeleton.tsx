import React from 'react';

/**
 * Skeleton Component
 * Placeholder loading animation for content
 */
interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    lines?: number; // For text variant, number of lines
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    lines = 1
}) => {
    const baseStyles = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]';

    const variantStyles = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        card: 'rounded-xl'
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'circular' ? '40px' : variant === 'card' ? '200px' : '20px'),
    };

    if (variant === 'text' && lines > 1) {
        return (
            <div className={`space-y-2 ${className}`}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={`${baseStyles} ${variantStyles.text}`}
                        style={{
                            width: i === lines - 1 ? '75%' : '100%',
                            height: height || '16px'
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        />
    );
};

/**
 * SkeletonCard Component
 * Pre-built skeleton for common card layouts
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-white p-6 rounded-xl border border-slate-200 animate-in fade-in ${className}`}>
        <div className="flex items-start gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={12} />
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <Skeleton variant="text" lines={3} height={12} />
        </div>
    </div>
);

/**
 * SkeletonTable Component
 * Pre-built skeleton for table rows
 */
export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({
    rows = 5,
    className = ''
}) => (
    <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-100">
                <Skeleton variant="circular" width={32} height={32} />
                <div className="flex-1 grid grid-cols-4 gap-4">
                    <Skeleton variant="text" height={14} />
                    <Skeleton variant="text" height={14} />
                    <Skeleton variant="text" height={14} width="80%" />
                    <Skeleton variant="text" height={14} width="60%" />
                </div>
            </div>
        ))}
    </div>
);

export default Skeleton;
