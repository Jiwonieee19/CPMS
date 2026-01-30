import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

export default function ProceedBeansBatchModal({ isOpen, onClose, batch, onProceed }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [equipmentNeeds, setEquipmentNeeds] = useState({});
    const toast = useToast();

    // Determine next stage based on current status
    const getNextStage = () => {
        if (!batch) return 'Processing';
        if (batch.status === 'Fresh') return 'Fermenting';
        if (batch.status === 'Fermented') return 'Drying';
        return 'Processing';
    };

    // Calculate equipment needs based on batch weight and status
    const calculateEquipmentNeeds = () => {
        if (!batch) return {};

        const weight = batch.weight ?? 0;
        const needs = {};

        if (batch.status === 'Fresh') {
            // 1 sack per 50kg, then 2 racks per 1 sack
            const sacksNeeded = Math.ceil(weight / 50);
            needs.racks = sacksNeeded * 2;
        }

        return needs;
    };

    const nextStage = getNextStage();

    // Handle mount/unmount with fade/scale transitions
    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
            setError(null);
            // Calculate equipment needs when modal opens
            const needs = calculateEquipmentNeeds();
            setEquipmentNeeds(needs);
            // allow next paint to apply visible classes
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsRendering(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, batch]);

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!batch || !batch.batch_id) {
                const errorMsg = 'Invalid batch selected';
                setError(errorMsg);
                toast.error(errorMsg);
                return;
            }

            const response = await fetch(`/batches/${batch.batch_id}/proceed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({
                    batch_id: batch.batch_id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }

            if (onProceed) {
                onProceed();
            }

            toast.success(`Batch proceeded to ${nextStage} successfully! Equipment has been deducted from inventory.`);
            onClose();
        } catch (err) {
            console.error('Error proceeding batch:', err);
            const errorMsg = err.message || 'Failed to proceed batch';
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
                className={`bg-[#3E2723] rounded-3xl p-8 w-full max-w-md relative transform transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#E5B917]">PROCEED TO PROCESS</h2>
                    <button
                        onClick={onClose}
                        className="text-[#E5B917] hover:text-[#d4a815] transition"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-200 flex gap-2 items-start">
                        <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                        <div>{error}</div>
                    </div>
                )}

                {/* Content */}
                <div className="mb-8">
                    <p className="text-[#F5F5DC] text-lg mb-2">
                        Proceed this batch to {nextStage} stage?
                    </p>
                    <div className="bg-[#311F1C] p-4 rounded-lg mb-4">
                        <p className="text-[#F5F5DC] text-sm font-semibold">
                            Batch ID: {batch?.id || 'N/A'}
                        </p>
                        <p className="text-[#F5F5DC] text-sm mt-1">
                            Weight: {batch?.weight ?? 0} kg
                        </p>
                        <p className="text-[#E5B917] text-sm mt-2">
                            Current Status: {batch?.status || 'Unknown'} → Next: {nextStage}
                        </p>
                    </div>

                    {/* Equipment Requirements */}
                    {Object.keys(equipmentNeeds).length > 0 && (
                        <div className="bg-[#311F1C] p-4 rounded-lg border border-[#E5B917]/30">
                            <p className="text-[#E5B917] text-sm font-semibold mb-3">
                                Equipment Required:
                            </p>
                            <div className="space-y-2">
                                {Object.entries(equipmentNeeds).map(([equipmentType, quantity]) => (
                                    <div key={equipmentType} className="flex justify-between items-center">
                                        <span className="text-[#F5F5DC] text-sm capitalize">{equipmentType}:</span>
                                        <span className="text-[#E5B917] font-semibold">{quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[#F5F5DC] text-xs mt-3 italic">
                                These items will be deducted from equipment inventory
                            </p>
                        </div>
                    )}
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
                        {isLoading ? 'PROCEEDING...' : 'CONFIRM'}
                    </button>
                </div>
            </div>
        </div>
    );
}