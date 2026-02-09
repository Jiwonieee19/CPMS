import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const parseAlertAction = (action) => {
    if (!action) return { postponeDuration: 'N/A', postponeTimestamp: 'N/A' };
    const durationMatch = action.match(/Postpone\s*Duration:\s*([^|]+)/i);
    const timestampMatch = action.match(/Postpone\s*Timestamp:\s*(.+)$/i);

    return {
        postponeDuration: durationMatch ? durationMatch[1].trim() : 'N/A',
        postponeTimestamp: timestampMatch ? timestampMatch[1].trim() : 'N/A',
    };
};

const parseReportAction = (action) => {
    if (!action) return { maxDuration: 'N/A', optimalTime: 'N/A' };
    const durationMatch = action.match(/Max\s*Duration:\s*([^,]+)/i);
    const optimalMatch = action.match(/Optimal\s*Time:\s*([^,]+)/i);

    return {
        maxDuration: durationMatch ? durationMatch[1].trim() : 'N/A',
        optimalTime: optimalMatch ? optimalMatch[1].trim() : 'N/A',
    };
};

const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const getStartTime = (range) => {
    if (!range || range === 'N/A') return 'N/A';
    const parts = range.split('-').map((part) => part.trim()).filter(Boolean);
    return parts.length > 0 ? parts[0] : 'N/A';
};

export default function WeatherGeneralNotificationModal({ isOpen, onClose, notification }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsRendering(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isRendering || !notification) return null;

    const isAlert = notification.type === 'alert';
    const { postponeDuration, postponeTimestamp } = parseAlertAction(notification.action);
    const { maxDuration, optimalTime } = parseReportAction(notification.action);
    const displayTimestamp = isAlert ? postponeTimestamp : optimalTime;

    return (
        <div
            className={`fixed inset-0 bg-black/85 flex items-center justify-center z-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`bg-[#3E2723] rounded-3xl p-8 w-full max-w-2xl relative transform transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#E5B917]">
                        {isAlert ? 'WEATHER ALERT' : 'WEATHER NOTIFICATION'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#E5B917] hover:text-[#d4a815] transition"
                        aria-label="Close weather notification"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>

                <div className="space-y-6 text-[#F5F5DC]">
                    <div>
                        <div className="text-lg font-semibold text-[#E5B917] mb-2">MESSAGE</div>
                        <div className="bg-[#311F1C] rounded-2xl px-4 py-3 text-lg">
                            {notification.message || 'N/A'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-semibold text-[#E5B917] mb-1">TYPE</div>
                            <div className="bg-[#311F1C] rounded-2xl px-4 py-3 text-lg text-lg">
                                {isAlert ? 'Alert' : 'Notify'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[#E5B917] mb-1">DATE & TIME</div>
                            <div className="bg-[#311F1C] rounded-2xl px-4 py-3 text-lg">
                                {formatDateTime(notification.createdAt)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-semibold text-[#E5B917] mb-1">
                                {isAlert ? 'POSTPONE DURATION' : 'DRYING DURATION'}
                            </div>
                            <div className="bg-[#311F1C] rounded-2xl px-4 py-3 text-lg">
                                {isAlert ? postponeDuration : maxDuration}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[#E5B917] mb-1">
                                {isAlert ? 'POSTPONE TIMESTAMP' : 'OPTIMAL TIMESTAMP'}
                            </div>
                            <div className="bg-[#311F1C] rounded-2xl px-4 py-3 text-lg">
                                {displayTimestamp || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-semibold text-[#E5B917] mb-1">START TIME</div>
                            <div className="bg-[#311F1C] rounded-2xl px-4 py-3 text-lg">
                                {getStartTime(displayTimestamp)}
                            </div>
                        </div>
                        {isAlert && (
                            <div>
                                <div className="text-sm font-semibold text-[#E5B917] mb-1">SEVERITY</div>
                                <div className="bg-[#311F1C] rounded-2xl px-4 py-3 text-lg">
                                    {(notification.severity || 'N/A').toUpperCase()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
