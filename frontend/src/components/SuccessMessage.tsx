import React, { useEffect } from 'react';

interface SuccessMessageProps {
    message: string;
    className?: string;
    onDismiss?: () => void;
    autoHide?: boolean;
    hideDelay?: number;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
    message, 
    className = '', 
    onDismiss,
    autoHide = true,
    hideDelay = 3000
}) => {
    useEffect(() => {
        if (autoHide && onDismiss) {
            const timer = setTimeout(() => {
                onDismiss();
            }, hideDelay);

            return () => clearTimeout(timer);
        }
    }, [autoHide, hideDelay, onDismiss]);

    return (
        <div className={`alert alert-success d-flex align-items-center ${className}`} role="alert">
            <div className="flex-grow-1">
                <i className="bi bi-check-circle-fill me-2"></i>
                {message}
            </div>
            {onDismiss && (
                <button 
                    type="button" 
                    className="btn-close" 
                    onClick={onDismiss}
                    aria-label="Close"
                ></button>
            )}
        </div>
    );
};

export default SuccessMessage;
