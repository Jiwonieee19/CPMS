import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function WeatherNotifyModal({ isOpen, onClose }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
            setInputValue('');
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

    const handleConfirm = () => {
        // Handle confirm action
        console.log('Confirmed with value:', inputValue);
        onClose();
    };

    if (!isRendering) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/85 flex items-center justify-center z-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`bg-[#3E2723] rounded-3xl p-8 w-full max-w-md relative transform transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
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

                {/* 1st Row */}
                <div className="mb-8">
                    <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                        MAXIMUM DRYING DURATION
                    </label>
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                        placeholder="0HR/HRS"
                    />
                </div>
                <div className='mb-8'>
                    <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                        OPTIMAL TIMESTAMP
                    </label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                        placeholder="0AM-0PM"
                    />
                </div>

                {/* 2nd Row */}
                <div className="mb-8">
                    <label className="block text-[#F5F5DC] text-lg font-semibold mb-3">
                        NOTIFICATION MESSAGE
                    </label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                        placeholder="Enter message"
                    />
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-6">
                    <button
                        onClick={handleCancel}
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#F5F5DC] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition"
                    >
                        NOTIFY
                    </button>
                </div>
            </div>
        </div>
    );
}