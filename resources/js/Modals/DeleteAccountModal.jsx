import { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

export default function DeleteAccountModal({ isOpen, onClose, staffId, onStatusUpdated }) {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [staffName, setStaffName] = useState('');
    const [staffStatus, setStaffStatus] = useState('active');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

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
                setStaffName('');

                const response = await fetch(`/staffs/${staffId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch staff: ${response.status}`);
                }

                const data = await response.json();
                const staff = data.staff || {};

                setStaffName(staff.fullname || `${staff.first_name || ''} ${staff.last_name || ''}`.trim());
                // Backend returns status with ucfirst (Active/Inactive), convert to lowercase for comparison
                setStaffStatus((staff.status || 'active').toLowerCase());
            } catch (err) {
                console.error('Error loading staff:', err);
                setError('Failed to load staff name');
                setStaffName('');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStaff();
    }, [isOpen, staffId]);

    const handleConfirm = () => {
        const updateStatus = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const newStatus = staffStatus === 'inactive' ? 'active' : 'inactive';

                const csrfToken = document
                    ?.querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content');

                const response = await fetch(`/staffs/${staffId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {})
                    },
                    body: JSON.stringify({ staff_status: newStatus })
                });

                if (!response.ok) {
                    throw new Error(`Failed to update staff: ${response.status}`);
                }

                if (onStatusUpdated) {
                    onStatusUpdated();
                }

                toast.success(`Staff set to ${newStatus} successfully!`);
                onClose();
            } catch (err) {
                console.error('Error updating staff:', err);
                const errorMsg = 'Failed to update staff status';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        if (staffId) {
            updateStatus();
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
                className={`bg-[#3E2723] rounded-3xl p-8 w-full max-w-md relative transform transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#E5B917]">
                        {staffStatus === 'inactive' ? 'ACTIVATE ACCOUNT' : 'DELETE ACCOUNT'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#E5B917] hover:text-[#d4a815] transition"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-8">
                    {error && (
                        <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <p className="text-[#F5F5DC] text-lg mb-2">
                        {staffStatus === 'inactive'
                            ? 'Are you sure you want to activate this account?'
                            : 'Are you sure you want to delete this account?'}
                    </p>
                    <p className="text-[#E5B917] text-sm font-semibold">
                        {isLoading ? 'Loading staff...' : staffName ? `Staff: ${staffName}` : `Staff ID: ${staffId}`}
                    </p>
                    <p className="text-[#F5F5DC] text-sm mt-4">
                        {staffStatus === 'inactive'
                            ? 'This account will be reactivated and can access the system.'
                            : 'This account will be set to inactive and can be reactivated anytime.'}
                    </p>
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
                        onClick={handleConfirm}
                        disabled={isLoading || !staffId}
                        className="py-3 rounded-2xl bg-[#311F1C] text-[#E5B917] text-xl font-semibold hover:bg-[#E5B917] hover:text-[#311F1C] transition"
                    >
                        {isLoading ? 'UPDATING...' : (staffStatus === 'inactive' ? 'ACTIVATE' : 'DELETE')}
                    </button>
                </div>
            </div>
        </div>
    );
}