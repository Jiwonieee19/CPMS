import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useToast } from '../Components/ToastProvider';
import axios from 'axios';

// Configure axios with CSRF token
axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function WeatherNotifyModal({ isOpen, onClose }) {
    const { auth } = usePage().props;
    const toast = useToast();
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [maxDuration, setMaxDuration] = useState('');
    const [startTime, setStartTime] = useState('');
    const [optimalTime, setOptimalTime] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Parse time string and return 24-hour format
    const parseTime = (timeStr) => {
        if (!timeStr) return null;

        // Remove spaces and convert to lowercase
        const cleaned = timeStr.toLowerCase().trim().replace(/\s+/g, '');

        // Match patterns like: 1pm, 1:00pm, 13:00, 1p, 01:00
        const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?([ap]m?)?$/);
        if (!match) return null;

        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const meridiem = match[3];

        // Convert to 24-hour format
        if (meridiem && meridiem.startsWith('p') && hours !== 12) {
            hours += 12;
        } else if (meridiem && meridiem.startsWith('a') && hours === 12) {
            hours = 0;
        }

        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
            return { hours, minutes };
        }
        return null;
    };

    // Format time to 12-hour format with AM/PM
    const formatTime = (hours, minutes) => {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return minutes > 0
            ? `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`
            : `${displayHours}${period}`;
    };

    // Calculate end time based on start time and duration
    useEffect(() => {
        if (startTime && maxDuration) {
            const parsed = parseTime(startTime);
            if (parsed) {
                const duration = parseInt(maxDuration);
                if (!isNaN(duration) && duration > 0) {
                    const endHours = (parsed.hours + duration) % 24;
                    const startFormatted = formatTime(parsed.hours, parsed.minutes);
                    const endFormatted = formatTime(endHours, parsed.minutes);
                    setOptimalTime(`${startFormatted}-${endFormatted}`);
                } else {
                    setOptimalTime('');
                }
            } else {
                setOptimalTime('');
            }
        } else {
            setOptimalTime('');
        }
    }, [startTime, maxDuration]);

    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
            setMaxDuration('');
            setStartTime('');
            setOptimalTime('');
            setMessage('');
            setError('');
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsRendering(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleCancel = () => {
        onClose();
    };

    const handleConfirm = async () => {
        // Validate message
        if (!message.trim()) {
            const errorMsg = 'Please enter notification message';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        // Validate time inputs if both are provided
        if (startTime.trim() && maxDuration.trim()) {
            if (!optimalTime) {
                const errorMsg = 'Invalid time format. Please use formats like 1pm, 1:00pm, or 13:00';
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }
        }

        setIsLoading(true);
        setError('');

        try {
            // Create the report
            const response = await axios.post('/weather-reports/store', {
                report_message: message,
                report_action: `Max Duration: ${maxDuration || 'N/A'}, Optimal Time: ${optimalTime || 'N/A'}`
            });

            console.log('Report saved:', response.data);
            toast.success('Weather notification report saved successfully!');
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save report';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error saving report:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isRendering) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/85 flex items-center justify-center z-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`bg-[#3E2723] rounded-3xl p-8 w-full max-w-xl relative transform transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#E5B917]">WEATHER ANALYSIS SUMMARY</h2>
                    <button
                        onClick={onClose}
                        className="text-[#E5B917] hover:text-[#d4a815] transition"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {/* 1st Row */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                            DRYING DURATION
                        </label>
                        <input
                            type="number"
                            value={maxDuration}
                            onChange={(e) => setMaxDuration(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                            placeholder="0HR/HRS"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                            START TIME
                        </label>
                        <input
                            type="text"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                            placeholder="E.G.: 1PM OR 13:00"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                {/* 2nd Row */}
                <div className="mb-8">
                    <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                        OPTIMAL TIMESTAMP
                    </label>
                    <div className={`w-full px-4 py-3 rounded-2xl font-semibold text-center ${optimalTime
                        ? 'bg-[#E5B917] text-[#3E2723]'
                        : 'bg-[#F5F5DC]/20 text-[#F5F5DC] border border-[#E5B917]'
                        }`}>
                        {optimalTime || 'ENTER START TIME AND DURATION'}
                    </div>

                </div>

                {/* 3rd Row */}
                <div className="mb-8">
                    <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                        NOTIFICATION MESSAGE
                    </label>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                        placeholder="ENTER MESSAGE"
                        disabled={isLoading}
                    />
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-6">
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#F5F5DC] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition disabled:opacity-50"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition disabled:opacity-50"
                    >
                        {isLoading ? 'SAVING...' : 'NOTIFY'}
                    </button>
                </div>
            </div>
        </div>
    );
}