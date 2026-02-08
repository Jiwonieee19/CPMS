import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

export default function EditAccountModal({ isOpen, onClose, staffId, onUpdated }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contact: '+63 9',
        password: '',
        confirmPassword: '',
        role: ''
    });

    const [originalData, setOriginalData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contact: '+63 9',
        role: ''
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

                const loadedData = {
                    firstName: staff.first_name || '',
                    lastName: staff.last_name || '',
                    email: staff.email || '',
                    contact: formatContact(staff.contact || ''),
                    password: '',
                    confirmPassword: '',
                    role: staff.role || ''
                };

                setFormData(loadedData);
                setOriginalData({
                    firstName: loadedData.firstName,
                    lastName: loadedData.lastName,
                    email: loadedData.email,
                    contact: loadedData.contact,
                    role: loadedData.role
                });
            } catch (err) {
                console.error('Error loading staff:', err);
                const errorMsg = 'Failed to load staff data';
                setError(errorMsg);
                toast.error(errorMsg);
                const emptyData = {
                    firstName: '',
                    lastName: '',
                    email: '',
                    contact: contactPrefix,
                    password: '',
                    confirmPassword: '',
                    role: ''
                };
                setFormData(emptyData);
                setOriginalData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    contact: contactPrefix,
                    role: ''
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStaff();
    }, [isOpen, staffId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'contact' ? formatContact(value) : value
        }));
    };

    const hasChanges = () => {
        // If password fields have values, consider it a change
        if (formData.password || formData.confirmPassword) {
            return true;
        }

        // Compare other fields with original data
        return (
            formData.firstName !== originalData.firstName ||
            formData.lastName !== originalData.lastName ||
            formData.email !== originalData.email ||
            formData.contact !== originalData.contact ||
            formData.role !== originalData.role
        );
    };

    const handleSave = () => {
        const saveStaff = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (formData.password || formData.confirmPassword) {
                    if (formData.password !== formData.confirmPassword) {
                        const errorMsg = 'The password confirmation does not match.';
                        setError(errorMsg);
                        toast.error(errorMsg);
                        return;
                    }
                }

                if (formData.email && !formData.email.includes('@')) {
                    const errorMsg = 'The email field must be a valid email address.';
                    setError(errorMsg);
                    toast.error(errorMsg);
                    return;
                }

                // Validate contact number length (must be 9 digits after +63 9)
                const contactDigits = formData.contact.replace(/\D/g, '').slice(2); // Remove all non-digits and skip 63
                if (contactDigits.length !== 10) { // 9 + the leading 9
                    const errorMsg = 'The Contact field must be a valid contact number.';
                    setError(errorMsg);
                    toast.error(errorMsg);
                    return;
                }

                const payload = {
                    staff_firstname: formData.firstName,
                    staff_lastname: formData.lastName,
                    staff_email: formData.email,
                    staff_contact: formData.contact,
                    staff_role: formData.role
                };

                if (formData.password) {
                    payload.staff_password = formData.password;
                    payload.staff_password_confirmation = formData.confirmPassword;
                }

                const csrfToken = document
                    ?.querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content');

                const response = await fetch(`/staffs/${staffId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {})
                    },
                    body: JSON.stringify(payload)
                });

                const responseData = await response.json();

                if (!response.ok) {
                    // If server returned validation errors, show them
                    if (response.status === 422 && responseData.errors) {
                        const errorMessages = Object.entries(responseData.errors)
                            .map(([field, messages]) => messages.join(', '))
                            .join('\n');
                        throw new Error(errorMessages);
                    }
                    // Otherwise show the message from the server
                    throw new Error(responseData.message || `Failed to update staff: ${response.status}`);
                }

                if (onUpdated) {
                    onUpdated();
                }

                toast.success('Staff updated successfully!');
                onClose();
            } catch (err) {
                console.error('Error saving staff:', err);
                const errorMsg = err.message || 'Failed to save staff data';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        if (staffId) {
            saveStaff();
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
                    <h2 className="text-3xl font-bold text-[#E5B917]">EDIT STAFF INFORMATION</h2>
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
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
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
                            />
                        </div>
                        <div>
                            <label className="block text-[#F5F5DC] text-lg font-semibold mb-2">
                                CONTACT
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5DC] text-[#65524F] focus:outline-none focus:ring-4 focus:ring-[#E5B917]"
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
                                <option value="Inventory Manager">Inventory Manager</option>
                                <option value="Account Manager">Account Manager</option>
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
                            onClick={handleSave}
                            disabled={isLoading || !staffId || !hasChanges()}
                            className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}