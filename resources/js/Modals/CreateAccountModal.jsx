import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';
import { useForm } from '@inertiajs/react';

export default function CreateAccountModal({ isOpen, onClose, onCreated, accountsData }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    const { data, setData, post, processing, errors, reset } = useForm({
        staff_firstname: '',
        staff_lastname: '',
        staff_email: '',
        staff_contact: '+63 9',
        staff_password: '',
        staff_password_confirmation: '',
        staff_role: ''
    });

    const contactPrefix = '+63 9';
    const formatContact = (value) => {
        let digits = String(value || '').replace(/\D/g, '');
        if (digits.startsWith('63')) {
            digits = digits.slice(2);
        }
        if (digits.startsWith('9')) {
            digits = digits.slice(1);
        }
        digits = digits.slice(0, 9);
        return `${contactPrefix}${digits}`;
    };

    // Handle mount/unmount with fade/scale transitions
    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
            setError(null);
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
            setError(null);
        }
    }, [isOpen]);

    const handleCreate = (e) => {
        e.preventDefault();

        // Validation
        if (!data.staff_firstname || !data.staff_lastname || !data.staff_email || !data.staff_contact || !data.staff_password || !data.staff_role) {
            const errorMsg = 'All fields are required!';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (data.staff_password !== data.staff_password_confirmation) {
            const errorMsg = 'The password confirmation does not match.';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        // Validate contact number length (must be 9 digits after +63 9)
        const contactDigits = data.staff_contact.replace(/\D/g, '').slice(2); // Remove all non-digits and skip 63
        if (contactDigits.length !== 10) { // 9 + the leading 9
            const errorMsg = 'The Contact field must be a valid contact number.';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        post('/staffs', {
            preserveScroll: true,
            onSuccess: () => {
                setError(null);
                toast.success('Staff account created successfully!');
                reset();
                if (onCreated) {
                    onCreated();
                }
                onClose();
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors).flat().join(', ');
                const message = errorMsg || 'Failed to create staff account';
                setError(message);
                toast.error(message);
            }
        });
    };

    const handleCancel = () => {
        onClose();
    };

    // Get taken unique roles (excluding inactive accounts)
    const getTakenRoles = () => {
        const uniqueRoles = ['Account Manager', 'Inventory Manager', 'Weather Analyst', 'Process Manager', 'Quality Analyst'];
        const takenRoles = new Set();

        if (accountsData && Array.isArray(accountsData)) {
            accountsData.forEach(account => {
                // Only consider active accounts
                if (account.status?.toLowerCase() === 'active') {
                    const role = account.role;
                    if (uniqueRoles.includes(role)) {
                        takenRoles.add(role);
                    }
                }
            });
        }

        return takenRoles;
    };

    const takenRoles = getTakenRoles();

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
                                inputMode="numeric"
                                name="staff_contact"
                                value={data.staff_contact}
                                onChange={(e) => setData('staff_contact', formatContact(e.target.value))}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
                                placeholder="+63 9XXXXXXXXX"
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
                                <option value="Quality Analyst" disabled={takenRoles.has('Quality Analyst')} className={takenRoles.has('Quality Analyst') ? 'opacity-50 cursor-not-allowed' : ''}>Quality Analyst{takenRoles.has('Quality Analyst') ? ' (Taken)' : ''}</option>
                                <option value="Weather Analyst" disabled={takenRoles.has('Weather Analyst')} className={takenRoles.has('Weather Analyst') ? 'opacity-50 cursor-not-allowed' : ''}>Weather Analyst{takenRoles.has('Weather Analyst') ? ' (Taken)' : ''}</option>
                                <option value="Process Manager" disabled={takenRoles.has('Process Manager')} className={takenRoles.has('Process Manager') ? 'opacity-50 cursor-not-allowed' : ''}>Process Manager{takenRoles.has('Process Manager') ? ' (Taken)' : ''}</option>
                                <option value="Inventory Manager" disabled={takenRoles.has('Inventory Manager')} className={takenRoles.has('Inventory Manager') ? 'opacity-50 cursor-not-allowed' : ''}>Inventory Manager{takenRoles.has('Inventory Manager') ? ' (Taken)' : ''}</option>
                                <option value="Account Manager" disabled={takenRoles.has('Account Manager')} className={takenRoles.has('Account Manager') ? 'opacity-50 cursor-not-allowed' : ''}>Account Manager{takenRoles.has('Account Manager') ? ' (Taken)' : ''}</option>
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