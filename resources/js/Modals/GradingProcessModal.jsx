import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

export default function GradingProcessModal({ isOpen, onClose, batch, onComplete }) {
    const createInitialFormData = (selectedBatch) => ({
        gradeA: '',
        gradeB: '',
        rejected: '',
        totalRacks: selectedBatch?.racks || ''
    });

    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    const [formData, setFormData] = useState(createInitialFormData(batch));

    // Reset form values each time modal opens for a batch
    useEffect(() => {
        if (isOpen) {
            setFormData(createInitialFormData(batch));
            setError(null);
        }
    }, [isOpen, batch?.id, batch?.racks]);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : parseInt(value);
        const totalRacks = parseInt(formData.totalRacks) || 0;

        // Calculate remaining racks
        let gradeA = name === 'gradeA' ? numValue : (parseInt(formData.gradeA) || 0);
        let gradeB = name === 'gradeB' ? numValue : (parseInt(formData.gradeB) || 0);
        let remaining = totalRacks - gradeA - gradeB;

        // Prevent exceeding available racks
        if (remaining < 0) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Calculate remaining racks
    const calculateRemaining = () => {
        const totalRacks = parseInt(formData.totalRacks) || 0;
        const gradeA = parseInt(formData.gradeA) || 0;
        const gradeB = parseInt(formData.gradeB) || 0;
        const rejectValue = calculateRejectValue();
        return totalRacks - gradeA - gradeB - rejectValue;
    };

    // Calculate reject value - shows remaining racks if gradeA or gradeB > 0, otherwise 0
    const calculateRejectValue = () => {
        const totalRacks = parseInt(formData.totalRacks) || 0;
        const gradeA = parseInt(formData.gradeA) || 0;
        const gradeB = parseInt(formData.gradeB) || 0;

        if (gradeA === 0 && gradeB === 0) {
            return 0;
        }
        return totalRacks - gradeA - gradeB;
    };

    // Calculate total boxes (sum of all grades and rejects)
    const calculateTotalBoxes = () => {
        const gradeA = parseInt(formData.gradeA) || 0;
        const gradeB = parseInt(formData.gradeB) || 0;
        const rejectValue = calculateRejectValue();
        return gradeA + gradeB + rejectValue;
    };

    // Check if all grades are 0
    const allGradesZero = () => {
        const gradeA = parseInt(formData.gradeA) || 0;
        const gradeB = parseInt(formData.gradeB) || 0;
        const rejectValue = calculateRejectValue();
        return gradeA === 0 && gradeB === 0 && rejectValue === 0;
    };

    const handleGrade = async () => {
        try {
            setError(null);

            setIsLoading(true);
            const gradeA = parseInt(formData.gradeA) || 0;
            const gradeB = parseInt(formData.gradeB) || 0;
            const rejectValue = calculateRejectValue();
            const totalBoxes = gradeA + gradeB + rejectValue;

            if (!batch || !batch.id) {
                const errorMsg = 'Invalid batch selected';
                setError(errorMsg);
                toast.error(errorMsg);
                setIsLoading(false);
                return;
            }

            const response = await fetch(`/batches/${batch.id}/grade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({
                    grade_a: gradeA,
                    grade_b: gradeB,
                    reject: rejectValue,
                    status: 'Graded',
                    boxes_used: totalBoxes
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 422) {
                    const validationErrors = Object.values(data?.errors || {}).flat();
                    throw new Error(validationErrors.join(', ') || data.message || 'Validation failed');
                }
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }

            toast.success('Batch graded successfully!');

            if (onComplete) {
                onComplete();
            }

            onClose();
        } catch (err) {
            console.error('Error grading batch:', err);
            const errorMsg = err.message || 'Failed to grade batch';
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
                className={`bg-[#3E2723] rounded-3xl p-8 w-full max-w-2xl relative transform transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-[#E5B917]">QUALITY GRADING</h2>
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

                {/* Form */}
                <div className="space-y-6">
                    {/* First Row - View Only */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                BATCH ID
                            </label>
                            <div className="px-4 py-3 rounded-2xl bg-[#F5F5DC]/20 text-[#F5F5DC] border border-[#E5B917]">
                                {batch?.id || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                TOTAL RACKS
                            </label>
                            <div className="px-4 py-3 rounded-2xl bg-[#F5F5DC]/20 text-[#F5F5DC] border border-[#E5B917]">
                                {calculateRemaining()}
                            </div>
                        </div>
                    </div>

                    {/* Second Row - Grade Inputs */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                GRADE A
                            </label>
                            <input
                                type="number"
                                name="gradeA"
                                value={formData.gradeA}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                                placeholder="000"
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                GRADE B
                            </label>
                            <input
                                type="number"
                                name="gradeB"
                                value={formData.gradeB}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                                placeholder="000"
                            />
                        </div>
                    </div>

                    {/* Third Row - View Only */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                REJECT
                            </label>
                            <div className="px-4 py-3 rounded-2xl bg-[#F5F5DC]/20 text-[#F5F5DC] border border-[#E5B917]">
                                {calculateRejectValue()}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                TOTAL BOXES
                            </label>
                            <div className="px-4 py-3 rounded-2xl bg-[#F5F5DC]/20 text-[#F5F5DC] border border-[#E5B917]">
                                {calculateTotalBoxes()}
                            </div>
                        </div>
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
                            onClick={handleGrade}
                            disabled={isLoading}
                            className={`py-3 rounded-2xl text-xl font-semibold transition ${isLoading
                                ? 'bg-[#311F1C] text-[#65524F] cursor-not-allowed opacity-50'
                                : 'bg-[#311F1C] text-[#E5B917] hover:bg-[#E5B917] hover:text-[#311F1C]'
                                }`}
                        >
                            {isLoading ? 'GRADING...' : 'CONFIRM'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}