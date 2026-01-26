import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

export default function CreateAccountModal({ isOpen, onClose }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const toast = useToast();

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

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                contact: '',
                password: '',
                confirmPassword: '',
                role: ''
            });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreate = async () => {
        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.contact || !formData.password || !formData.role) {
            toast.warning('All fields are required!');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.warning('Passwords do not match!');
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/staffs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({
                    staff_firstname: formData.firstName,
                    staff_lastname: formData.lastName,
                    staff_email: formData.email,
                    staff_contact: formData.contact,
                    staff_password: formData.password,
                    staff_role: formData.role,
                    staff_status: 'active'
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Staff account created successfully!');
                onClose();
            } else {
                const errorMsg = data.errors
                    ? Object.values(data.errors).flat().join(', ')
                    : (data.message || 'Failed to create account');
                toast.error('Error: ' + errorMsg);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Error: ' + error.message);
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
                    <h2 className="text-3xl font-bold text-[#E5B917]">CREATE NEW ACCOUNT</h2>
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
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
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
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
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
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
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
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
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
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
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
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
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
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
                                placeholder="ABCDEFG"
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
                            onClick={handleCreate}
                            className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition"
                        >
                            CREATE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}