import React from 'react';

interface ErrorMessageProps {
    message: string;
    className?: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
    message, 
    className = '', 
    onRetry 
}) => {
    return (
        <div className={`alert alert-danger d-flex align-items-center ${className}`} role="alert">
            <div className="flex-grow-1">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {message}
            </div>
            {onRetry && (
                <button 
                    className="btn btn-outline-danger btn-sm ms-2" 
                    onClick={onRetry}
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
