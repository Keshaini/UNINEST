import React from 'react';
import { X, AlertTriangle, HelpCircle } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "Do you really want to perform this action? This can't be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // danger, warning, info
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: <AlertTriangle className="w-8 h-8 text-rose-400" />,
            buttonClass: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20",
            iconBg: "bg-rose-500/10",
        },
        warning: {
            icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
            buttonClass: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
            iconBg: "bg-amber-500/10",
        },
        info: {
            icon: <HelpCircle className="w-8 h-8 text-indigo-400" />,
            buttonClass: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20",
            iconBg: "bg-indigo-500/10",
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" 
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-slate-900 border border-slate-700/50 rounded-[32px] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden scale-in">
                <div className="absolute top-4 right-4 focus:outline-none">
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 pt-10 text-center">
                    <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        {config.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
                    <p className="text-slate-400 font-medium leading-relaxed mb-8 px-2">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-6 py-3.5 ${config.buttonClass} text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
                .scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default ConfirmationModal;
