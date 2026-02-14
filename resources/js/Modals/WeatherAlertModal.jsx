import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useToast } from '../Components/ToastProvider';
import axios from 'axios';

// Configure axios with CSRF token
axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function WeatherAlertModal({ isOpen, onClose }) {
    const { auth } = usePage().props;
    const toast = useToast();
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [postponeDuration, setPostponeDuration] = useState('');
    const [startTime, setStartTime] = useState('');
    const [postponeTimestamp, setPostponeTimestamp] = useState('');
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('medium');
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

    // Calculate postpone timestamp based on start time and duration
    useEffect(() => {
        if (startTime && postponeDuration) {
            const parsed = parseTime(startTime);
            if (parsed) {
                const duration = parseInt(postponeDuration);
                if (!isNaN(duration) && duration > 0) {
                    const endHours = (parsed.hours + duration) % 24;
                    const startFormatted = formatTime(parsed.hours, parsed.minutes);
                    const endFormatted = formatTime(endHours, parsed.minutes);
                    setPostponeTimestamp(`${startFormatted}-${endFormatted}`);
                } else {
                    setPostponeTimestamp('');
                }
            } else {
                setPostponeTimestamp('');
            }
        } else {
            setPostponeTimestamp('');
        }
    }, [startTime, postponeDuration]);

    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
            setPostponeDuration('');
            setStartTime('');
            setPostponeTimestamp('');
            setMessage('');
            setSeverity('medium');
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
            const errorMsg = 'Please enter alert message';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        // Validate time inputs if both are provided
        if (startTime.trim() && postponeDuration.trim()) {
            if (!postponeTimestamp) {
                const errorMsg = 'Invalid time format. Please use formats like 1pm, 1:00pm, or 13:00';
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }
        }

        setIsLoading(true);
        setError('');

        try {
            // First, create weather data entry to get weather_id
            const weatherDataResponse = await axios.post('/weather-data/store', {
                temperature: 28.5,
                humidity: 75,
                wind_speed: 12.5,
                weather_condition: 'Alert Triggered',
                temperature_end: 29.2,
                humidity_end: 78,
                wind_speed_end: 13.8,
                log_weather_data: false
            });

            const weatherId = weatherDataResponse.data.data.weather_id;

            // Then create the alert with the weather_id
            const response = await axios.post('/weather-alerts/store', {
                alert_message: message,
                alert_severity: severity,
                postpone_duration: postponeDuration || 'N/A',
                postpone_timestamp: postponeTimestamp || 'N/A',
                weather_id: weatherId
            });

            console.log('Alert saved:', response.data);
            toast.success('Weather alert report saved successfully!');
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save alert';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error saving alert:', err);
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
                            POSTPONE DURATION
                        </label>
                        <input
                            type="number"
                            value={postponeDuration}
                            onChange={(e) => setPostponeDuration(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                            placeholder="0HR/HRS"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                            POSTPONE TIME
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
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                            POSTPONE TIMESTAMP
                        </label>
                        <div className={`w-full px-3 py-3 rounded-2xl font-semibold text-center ${postponeTimestamp
                            ? 'bg-[#FF6769] text-[#3E2723]'
                            : 'bg-[#F5F5DC]/20 text-[#F5F5DC] border border-[#E5B917]'
                            }`}>
                            {postponeTimestamp || 'ENTER TIME AND DURATION'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                            SEVERITY LEVEL
                        </label>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723] font-semibold cursor-pointer"
                            disabled={isLoading}
                        >
                            <option value="low">LOW</option>
                            <option value="medium">MEDIUM</option>
                            <option value="high">HIGH</option>
                        </select>
                    </div>
                </div>

                {/* 3rd Row */}
                <div className="mb-8">
                    <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                        ALERT MESSAGE
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
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#FF6769] text-xl font-semibold hover:bg-[#FF6769] hover:text-[#311F1C] transition disabled:opacity-50"
                    >
                        {isLoading ? 'SAVING...' : 'ALERT'}
                    </button>
                </div>
            </div>
        </div>
    );
}