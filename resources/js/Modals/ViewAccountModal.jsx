import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ViewAccountModal({ isOpen, onClose, staffId }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        password: '',
        confirmPassword: '',
        role: ''
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
        const fetchStaff = async () => {
            if (!isOpen || !staffId) return;

            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`/staffs/${staffId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch staff: ${response.status}`);
                }

                const data = await response.json();
                const staff = data.staff || {};

                setFormData({
                    firstName: staff.first_name || '',
                    lastName: staff.last_name || '',
                    email: staff.email || '',
                    contact: staff.contact || '',
                    password: '',
                    confirmPassword: '',
                    role: staff.role || ''
                });
            } catch (err) {
                console.error('Error loading staff:', err);
                setError('Failed to load staff data');
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    contact: '',
                    password: '',
                    confirmPassword: '',
                    role: ''
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStaff();
    }, [isOpen, staffId]);

    const handleClose = () => {
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
                    <h2 className="text-3xl font-bold text-[#E5B917]">VIEW STAFF INFORMATION</h2>
                    <button
                        onClick={onClose}
                        className="text-[#E5B917] hover:text-[#d4a815] transition"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>

                {/* Form */}
                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                <div className="space-y-6">
                    {/* First Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                FIRST NAME
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                EMAIL
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                            />
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                LAST NAME
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                CONTACT
                            </label>
                            <input
                                type="tel"
                                name="contact"
                                value={formData.contact}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                            />
                        </div>
                    </div>

                    {/* Third Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                ROLE
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                disabled
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                            >
                                <option value="">Select Role</option>
                                <option value="Staff">Staff</option>
                                <option value="Quality Analyst">Quality Analyst</option>
                                <option value="Weather Analyst">Weather Analyst</option>
                                <option value="Process Manager">Process Manager</option>
                                <option value="Logs Manager">Logs Manager</option>
                            </select>
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <button
                            onClick={handleClose}
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