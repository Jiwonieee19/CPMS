import React from 'react';
import companyLogo from '../Assets/company-logo.png';
import HelpSign from '../Assets/Icons/icon-help.png';
import Door from '../Assets/Icons/icon-logout.png';

const LayoutDashboard = new URL('../Assets/icons/icon-dashboard-focus.png', import.meta.url).href;
const CloudSnow = new URL('../Assets/icons/icon-weather.png', import.meta.url).href;
const Clock = new URL('../Assets/icons/icon-process.png', import.meta.url).href;
const Notebook = new URL('../Assets/icons/icon-logs.png', import.meta.url).href;
const Package = new URL('../Assets/icons/icon-inventory.png', import.meta.url).href;
const User = new URL('../Assets/icons/icon-account.png', import.meta.url).href;

const mainNavItems = [

    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },

    {
        title: 'Weather',
        href: '/weather',
        icon: CloudSnow,
    },

    {
        title: 'Process',
        href: '/process',
        icon: Clock,
    },

    {
        title: 'Logs',
        href: '/logs',
        icon: Notebook,
    },

    {
        title: 'Inventory',
        href: '/inventory',
        icon: Package,
    },

    {
        title: 'Accounts',
        href: '/accounts',
        icon: User,
    },

];

export default function Sidebar() {
    const hrefHere = window.location.pathname;

    return (
        <div className="w-94 h-screen bg-[#311F1C] text-3xl text-[#F5F5DC] font-medium p-4">
            <div className='bg-[#3E2723] p-5 my-7 rounded-xl'>
                <img src={companyLogo} alt="Company Logo" className="" />
            </div>
            <nav className="space-y-2">
                {mainNavItems.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl pt-4 pb-5 transition-colors duration-200 ${item.href === hrefHere ? 'bg-[#E5B917] text-[#311F1C]' : 'hover:bg-[#3E2723]'
                            }`}
                    >
                        <img src={item.icon} alt={item.title} className="w-8 h-8 mt-1" />
                        <span>{item.title}</span>
                    </a>
                ))}
            </nav>
            <div className='bg-[#3E2723] p-4 my-1 mt-30 rounded-lg flex items-center justify-start gap-4'>
                <a href="/logout" title="Logout" className="hover:opacity-80 transition-opacity">
                    <img src={Door} alt="Logout Logo" className="w-8 h-8" />
                </a>
                <a href="#" title="Help" className="hover:opacity-80 transition-opacity">
                    <img src={HelpSign} alt="Help Logo" className="w-8 h-8" />
                </a>
            </div>
        </div>
    );
}