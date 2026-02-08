import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

export default function AddFreshBeansModal({ isOpen, onClose, onAdded }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    const [formData, setFormData] = useState({
        harvest_date: '',
        initial_weight: '',
        supplier_name: ''
    });

    // Handle mount/unmount with fade/scale transitions
    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
            setFormData({ harvest_date: '', initial_weight: '', supplier_name: '' });
            setError(null);
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdd = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Validation
            if (!formData.harvest_date || !formData.initial_weight || !formData.supplier_name) {
                const errorMsg = 'Please fill in all required fields';
                setError(errorMsg);
                toast.error(errorMsg);
                setIsLoading(false);
                return;
            }

            const weight = parseFloat(formData.initial_weight);
            if (isNaN(weight) || weight <= 0) {
                const errorMsg = 'Weight must be a positive number';
                setError(errorMsg);
                toast.error(errorMsg);
                setIsLoading(false);
                return;
            }

            const response = await fetch('/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({
                    harvest_date: formData.harvest_date,
                    initial_weight: weight,
                    supplier_name: formData.supplier_name
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }

            toast.success('Fresh cacao beans batch added successfully!');
            onClose();

            if (onAdded) {
                onAdded();
            }
        } catch (err) {
            console.error('Error adding fresh beans:', err);
            const errorMsg = err.message || 'Failed to add fresh beans';
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
                    <h2 className="text-3xl font-bold text-[#E5B917]">ADD FRESH CACAO BEANS</h2>
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
                    {/* First Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                HARVEST DATE
                            </label>
                            <input
                                type="date"
                                name="harvest_date"
                                value={formData.harvest_date}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                INITIAL WEIGHT (KG)
                            </label>
                            <input
                                type="number"
                                name="initial_weight"
                                value={formData.initial_weight}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                                placeholder="123.50KG"
                                step="0.01"
                                min="0"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                FROM
                            </label>
                            <input
                                type="text"
                                name="supplier_name"
                                value={formData.supplier_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                                placeholder="SUPPLIER NAME"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                INITIAL STATUS
                            </label>
                            <div className="px-4 py-3 rounded-2xl bg-[#F5F5DC]/20 text-[#F5F5DC] border border-[#E5B917]">
                                Fresh
                            </div>
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
                            onClick={handleAdd}
                            className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'ADDING...' : 'ADD'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}