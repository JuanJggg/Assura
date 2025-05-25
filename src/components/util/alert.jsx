import React from 'react';
import {AlertTriangle, CheckCircle, XCircle} from 'lucide-react';

const variants = {
    success: {
        icon: <CheckCircle className="h-5 w-5 text-green-600"/>,
        bg: 'bg-green-100',
        text: 'text-green-800',
    },
    error: {
        icon: <XCircle className="h-5 w-5 text-red-600"/>,
        bg: 'bg-red-100',
        text: 'text-red-800',
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600"/>,
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
    },
};

const AlertMessage = ({type = 'success', message, onClose}) => {
    const {icon, bg, text} = variants[type] || variants.success;

    return (
        <div
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md rounded-lg shadow-lg px-4 py-3 flex items-center justify-between ${bg} ${text}`}>
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-medium">{message}</span>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-xs font-bold text-gray-600 hover:underline"
                >
                    Cerrar
                </button>
            )}
        </div>
    );
};

export default AlertMessage;
