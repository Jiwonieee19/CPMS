import { useState } from 'react';
import companyLogo from '../Assets/company-logo.png';
import loginBackground from '../Assets/login-background.png';

export default function LoginPage() {

    const [formData, setFormData] = useState({
        staffid: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen w-screen bg-cover bg-center bg-no-repeat flex items-center justify-end pr-30"
            style={{ backgroundImage: `url(${loginBackground})` }}>
            <div className="bg-[#4A312D] p-8 rounded-2xl shadow-md w-full max-w-md ">
                {/* <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2> */}
                <div className='bg-[#3E2723] p-8 rounded-xl'>
                    <img src={companyLogo} alt="Company Logo" />
                </div>

                <div className='bg-[#3E2723] rounded-xl mt-6 p-5'>
                    <div className="mb-4">
                        <label htmlFor="staffid" className="block text-[#F5F5DC] text-2xl font-semibold mb-3">
                            STAFF ID
                        </label>
                        <div className="relative">
                            <img
                                src={new URL('../Assets/icons/icon-login-staff.png', import.meta.url).href}
                                alt="Staff ID icon"
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 pointer-events-none"
                            />
                            <input
                                type="staffid"
                                id="staffid"
                                name="staffid"
                                value={formData.staffid}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-2 border border-gray-300 bg-[#F5F5DC] font-medium rounded-lg focus:outline-none focus:ring-4 focus:ring-[#E5B917] focus:border-transparent"
                                placeholder="ENTER YOUR ID"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="block text-[#F5F5DC] text-2xl font-semibold mb-3">
                            PASSWORD
                        </label>
                        <div className="relative">
                            <img
                                src={new URL('../Assets/icons/icon-login-password.png', import.meta.url).href}
                                alt="Password icon"
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 pointer-events-none"
                            />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-2 border border-gray-300 bg-[#F5F5DC] font-medium rounded-lg focus:outline-none focus:ring-4 focus:ring-[#E5B917] focus:border-transparent"
                                placeholder="ENTER YOUR PASSWORD"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <a href="#" className="text-sm text-[#F5F5DC] underline hover:text-[#E5B917] block text-left">
                            FORGOT PASSWORD?
                        </a>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-[#E5B917] text-[#3E2723] text-3xl font-bold pt-2 pb-3 rounded-lg hover:bg-[#F5F5DC] hover:text-[#E5B917] hover:ring-4 hover:ring-[#E5B917] transition duration-200"
                    >
                        LOGIN
                    </button>
                </div>
            </div>
        </div>
    );
}