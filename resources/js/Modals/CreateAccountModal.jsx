import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';
import { useForm } from '@inertiajs/react';

export default function CreateAccountModal({ isOpen, onClose }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const toast = useToast();

    const { data, setData, post, processing, errors, reset } = useForm({
        staff_firstname: '',
        staff_lastname: '',
        staff_email: '',
        staff_contact: '',
        staff_password: '',
        staff_password_confirmation: '',
        staff_role: ''
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
            reset();
        }
    }, [isOpen]);

    const handleCreate = (e) => {
        e.preventDefault();

        // Validation
        if (!data.staff_firstname || !data.staff_lastname || !data.staff_email || !data.staff_contact || !data.staff_password || !data.staff_role) {
            toast.warning('All fields are required!');
            return;
        }

        if (data.staff_password !== data.staff_password_confirmation) {
            toast.warning('Passwords do not match!');
            return;
        }

        post('/staffs', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Staff account created successfully!');
                reset();
                onClose();
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors).flat().join(', ');
                toast.error('Error: ' + errorMsg);
            }
        });
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
                                name="staff_firstname"
                                value={data.staff_firstname}
                                onChange={(e) => setData('staff_firstname', e.target.value)}
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
                                name="staff_email"
                                value={data.staff_email}
                                onChange={(e) => setData('staff_email', e.target.value)}
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
                                name="staff_lastname"
                                value={data.staff_lastname}
                                onChange={(e) => setData('staff_lastname', e.target.value)}
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
                                name="staff_contact"
                                value={data.staff_contact}
                                onChange={(e) => setData('staff_contact', e.target.value)}
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
                                name="staff_password"
                                value={data.staff_password}
                                onChange={(e) => setData('staff_password', e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
                                placeholder="ABCDE123!@#"
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                ROLE
                            </label>
                            <select
                                name="staff_role"
                                value={data.staff_role}
                                onChange={(e) => setData('staff_role', e.target.value)}
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
                                name="staff_password_confirmation"
                                value={data.staff_password_confirmation}
                                onChange={(e) => setData('staff_password_confirmation', e.target.value)}
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
                            disabled={processing}
                            className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition disabled:opacity-50"
                        >
                            {processing ? 'CREATING...' : 'CREATE'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}