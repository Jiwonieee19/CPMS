import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddFreshBeansModal({ isOpen, onClose }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);

    const [formData, setFormData] = useState({
        weight: '',
        from: '',
        quantity: '',
        attachFile: ''
    });

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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdd = () => {
        // Handle add logic here
        console.log('Adding fresh cacao beans:', formData);
        onClose();
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

                {/* Form */}
                <div className="space-y-6">
                    {/* First Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                WEIGHT
                            </label>
                            <input
                                type="text"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                                placeholder="123KG"
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                FROM
                            </label>
                            <input
                                type="text"
                                name="from"
                                value={formData.from}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                                placeholder="SUPPLIER NAME"
                            />
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                QUANTITY
                            </label>
                            <input
                                type="text"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                                placeholder="123"
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                ATTACH FILE
                            </label>
                            <input
                                type="file"
                                name="attachFile"
                                onChange={(e) => setFormData(prev => ({ ...prev, attachFile: e.target.files[0] }))}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#3E2723]"
                            />
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
                            onClick={handleAdd}
                            className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition"
                        >
                            ADD
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}