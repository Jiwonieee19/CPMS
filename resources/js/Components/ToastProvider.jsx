import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TYPE_STYLES = {
    success: {
        bg: 'bg-emerald-600/95',
        border: 'border-emerald-400/70',
        text: 'text-emerald-50'
    },
    warning: {
        bg: 'bg-[#E5B917]',
        border: 'border-[#3E2723]',
        text: 'text-[#3E2723]'
    },
    error: {
        bg: 'bg-rose-600/95',
        border: 'border-rose-400/70',
        text: 'text-rose-50'
    },
    info: {
        bg: 'bg-[#F5F5DC]',
        border: 'border-[#3E2723]',
        text: 'text-[#3E2723]'
    }
};

const buildId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToastNow = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const startExit = useCallback((id, delay = 300) => {
        setToasts((prev) => prev.map((toast) => toast.id === id ? { ...toast, leaving: true } : toast));
        window.setTimeout(() => removeToastNow(id), delay);
    }, [removeToastNow]);

    const showToast = useCallback((message, type = 'info', options = {}) => {
        const id = buildId();
        const duration = options.duration ?? 2000;

        setToasts((prev) => [...prev, { id, message, type, leaving: false }]);

        if (duration > 0) {
            window.setTimeout(() => startExit(id), duration);
        }

        return id;
    }, [startExit]);

    const api = useMemo(() => ({
        success: (message, options) => showToast(message, 'success', options),
        warning: (message, options) => showToast(message, 'warning', options),
        error: (message, options) => showToast(message, 'error', options),
        info: (message, options) => showToast(message, 'info', options)
    }), [showToast]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="pointer-events-none fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 px-4">
                {toasts.map((toast) => {
                    const style = TYPE_STYLES[toast.type] ?? TYPE_STYLES.info;

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto border ${style.bg} ${style.border} ${style.text} shadow-lg backdrop-blur-sm rounded-2xl px-4 py-3 text-base font-semibold transition-all duration-300 ${toast.leaving ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}
                        >
                            {toast.message}
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}
