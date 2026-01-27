import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ViewLogsModal({ isOpen, onClose, logId }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);

    const [formData, setFormData] = useState({
        logId: '',
        taskDescription: '',
        timeSaved: '',
        date: '',
        performedBy: '',
        type: ''
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

    useEffect(() => {
        if (logId) {
            // Fetch log data based on logId
            // This is a placeholder - replace with actual API call
            const mockLogData = {
                logId: logId,
                taskDescription: 'skcasacascac;aslca;slcac;aca;claclakcmacmac;acmcas;ca;ccm;lacm;a;clasc;lasmcamac;alcmac; ' + logId,
                timeSaved: '08:30 AM',
                date: '2026-01-27',
                performedBy: 'Admin User',
                type: 'Weather Log'
            };
            setFormData(mockLogData);
        }
    }, [logId]);

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
                    <h2 className="text-3xl font-bold text-[#E5B917]">VIEW LOG DETAILS</h2>
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
                                LOG ID
                            </label>
                            <input
                                type="text"
                                value={formData.logId}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                                placeholder="WL-001"
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                TYPE
                            </label>
                            <input
                                type="text"
                                value={formData.type}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                                placeholder="Log Type"
                            />
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                TIMESTAMP SAVED
                            </label>
                            <input
                                type="text"
                                value={formData.timeSaved}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                                placeholder="08:30 AM"
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                PERFORMED BY
                            </label>
                            <input
                                type="text"
                                value={formData.performedBy}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                                placeholder="Admin User"
                            />
                        </div>
                    </div>

                    {/* Third Row */}
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                TASK DESCRIPTION
                            </label>
                            <textarea
                                value={formData.taskDescription}
                                readOnly
                                rows="6"
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default resize-none"
                                placeholder="Temperature Check"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <button
                            onClick={handleCancel}
                            className="py-3 rounded-2xl bg-[#311F1C] text-[#F5F5DC] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition"
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

