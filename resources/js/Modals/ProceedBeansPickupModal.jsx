import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

export default function ProceedBeansPickupModal({ isOpen, onClose, batchId, onPickedUp }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Handle mount/unmount with fade/scale transitions
    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
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

            const response = await fetch(`/batches/${batchId}/pickup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }

            toast.success('Batch picked up successfully!');
            onClose();

            if (onPickedUp) {
                onPickedUp();
            }
        } catch (err) {
            console.error('Error confirming pickup:', err);
            toast.error(err.message || 'Failed to confirm pickup');
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
                className={`bg-[#3E2723] rounded-3xl p-8 w-full max-w-md relative transform transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#E5B917]">READY FOR PICKUP</h2>
                    <button
                        onClick={onClose}
                        className="text-[#E5B917] hover:text-[#d4a815] transition"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-8">
                    <p className="text-[#F5F5DC] text-lg mb-2">
                        Confirm pickup of this batch by Auro Chocolate?
                    </p>
                    <p className="text-[#E5B917] text-sm font-semibold">
                        Batch ID: {batchId}
                    </p>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-6 mt-8">
                    <button
                        onClick={handleCancel}
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#F5F5DC] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`py-3 rounded-2xl text-xl font-semibold transition ${isLoading
                                ? 'bg-[#311F1C] text-[#65524F] cursor-not-allowed opacity-50'
                                : 'bg-[#311F1C] text-[#E5B917] hover:bg-[#E5B917] hover:text-[#311F1C]'
                            }`}
                    >
                        {isLoading ? 'PROCESSING...' : 'CONFIRM'}
                    </button>
                </div>
            </div>
        </div>
    );
}