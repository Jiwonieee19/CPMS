import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ViewAccountModal({ isOpen, onClose, staffId }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);

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
        if (staffId) {
            // Fetch staff data based on staffId
            // This is a placeholder - replace with actual API call
            const mockStaffData = {
                firstName: 'ABCD',
                lastName: 'ABCDEFG',
                email: 'ABC123@GMAIL.COM',
                contact: '09090909090',
                password: 'ABCDE123!@#',
                confirmPassword: 'ABCDEFG',
                role: 'STAFF/QA/WA'
            };
            setFormData(mockStaffData);
        }
    }, [staffId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Handle save logic here
        console.log('Saving staff data:', formData);
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
                    <h2 className="text-3xl font-bold text-[#E5B917]">VIEW STAFF INFORMATION</h2>
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
                                FIRST NAME
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                                placeholder="ABCD"
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
                                placeholder="ABC123@GMAIL.COM"
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
                                placeholder="ABCDEFG"
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
                                placeholder="09090909090"
                            />
                        </div>
                    </div>

                    {/* Third Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                PASSWORD
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                                placeholder="ABCDE123!@#"
                            />
                        </div>
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

                    {/* Fourth Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                CONFIRM PASS
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                readOnly
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] cursor-default"
                                placeholder="ABCDEFG"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}