import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

export default function ProceedProcessModal({ isOpen, onClose, process, onComplete }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    // Determine completed status based on current process status
    const getCompletedStatus = () => {
        if (!process) return 'Completed';
        if (process.status === 'Fermenting') return 'Fermented';
        if (process.status === 'Drying') return 'Dried';
        return 'Completed';
    };

    // Handle mount/unmount with fade/scale transitions
    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
            setError(null);
            // allow next paint to apply visible classes
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsRendering(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!process || !process.process_id) {
                const errorMsg = 'Invalid process selected';
                setError(errorMsg);
                toast.error(errorMsg);
                setIsLoading(false);
                return;
            }

            const response = await fetch(`/processes/${process.process_id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({
                    process_id: process.process_id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }

            if (onComplete) {
                onComplete();
            }

            toast.success('Batch completed and returned to inventory!');
            onClose();
        } catch (err) {
            console.error('Error completing process:', err);
            const errorMsg = err.message || 'Failed to complete process';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isRendering) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/85 flex items-center justify-center z-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`bg-[#3E2723] rounded-3xl p-8 w-full max-w-lg relative transform transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#E5B917]">PROCEED TO INVENTORY</h2>
                    <button
                        onClick={onClose}
                        className="text-[#E5B917] hover:text-[#d4a815] transition"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-200">
                        {error}
                    </div>
                )}

                {/* Content */}
                <div className="mb-8">
                    <p className="text-[#F5F5DC] text-lg mb-2">
                        Complete processing and return this batch to inventory?
                    </p>
                    <div className="bg-[#311F1C] p-4 rounded-lg">
                        <p className="text-[#F5F5DC] text-sm font-semibold">
                            Batch ID: {process?.id || 'N/A'}
                        </p>
                        <p className="text-[#E5B917] text-sm mt-2">
                            Current Status: {process?.status || 'Unknown'} → Next: {getCompletedStatus()}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-6 mt-8">
                    <button
                        onClick={handleCancel}
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#F5F5DC] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'COMPLETING...' : 'CONFIRM'}
                    </button>
                </div>
            </div>
        </div>
    );
}