import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md', 
    text = 'Loading...', 
    className = '' 
}) => {
    const sizeClass = {
        sm: 'spinner-border-sm',
        md: '',
        lg: 'fs-3'
    }[size];

    return (
        <div className={`d-flex flex-column align-items-center justify-content-center p-4 ${className}`}>
            <div className={`spinner-border text-primary ${sizeClass}`} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            {text && (
                <p className="mt-2 mb-0 text-muted">{text}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
