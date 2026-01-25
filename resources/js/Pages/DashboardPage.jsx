import { useState, useEffect } from 'react';
import { Cloud, Clock, FileText, Package } from 'lucide-react';
import Sidebar from '../Components/sidebar.jsx';

export default function DashboardContent() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const processData = [
        { day: 'SAT', drying: 25, fermenting: 28 },
        { day: 'SUN', drying: 15, fermenting: 30 },
        { day: 'MON', drying: 45, fermenting: 48 },
        { day: 'TUE', drying: 35, fermenting: 25 },
        { day: 'WED', drying: 28, fermenting: 40 },
        { day: 'TODAY', drying: 42, fermenting: 48 }
    ];

    const maxValue = 50;

    return (

        <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 p-14 bg-[#F5F5DC] min-h-screen">
                <h1 className="text-6xl font-extrabold text-[#E5B917] mb-8">DASHBOARD</h1>

                <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
                    {/* Left column: Weather + Process */}
                    <div className="space-y-6">
                        {/* Weather Forecast */}
                        <div className="bg-[#3E2723] text-[#F5F5DC] p-6 rounded-lg">
                            <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
                                <Cloud size={40} />
                                WEATHER FORECAST
                            </h2>
                            <div className="border-b-3 mb-4 border-[#65524F]"></div>
                            <div className="flex justify-between text-lg">
                                <div>
                                    <span className="text-[#F5F5DC]">Humidity:</span>
                                    <span className="text-[#E5B917] ml-2 font-semibold">87%</span>
                                </div>
                                <div>
                                    <span className="text-[#F5F5DC]">Wind:</span>
                                    <span className="text-[#E5B917] ml-2 font-semibold">1.8 m/s</span>
                                </div>
                                <div>
                                    <span className="text-[#F5F5DC]">Temperature:</span>
                                    <span className="text-[#E5B917] ml-2 font-semibold">34°C</span>
                                </div>
                            </div>
                        </div>

                        {/* Process Overview */}
                        <div className="bg-[#3E2723] text-[#F5F5DC] p-6 rounded-lg">
                            <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
                                <Clock size={40} />
                                PROCESS OVERVIEW
                            </h2>
                            <div className="border-b-3 mb-4 border-[#65524F]"></div>
                            <div className="h-64 flex items-end justify-around gap-2 mt-22">
                                {processData.map((data, index) => (
                                    <div key={index} className="flex flex-col items-center gap-1 p-4 flex-1">
                                        <div className="relative w-full h-68">
                                            <div
                                                className="absolute bottom-0 left-0 w-2/3 bg-[#F5F5DC] rounded-t-3xl"
                                                style={{ height: `${(data.fermenting / maxValue) * 100}%` }}
                                            />
                                            <div
                                                className="absolute bottom-0 right-0 w-2/3 bg-[#E5B917] rounded-t-3xl"
                                                style={{ height: `${(data.drying / maxValue) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-[#F5F5DC] mt-2">{data.day}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2 mt-4 text-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#E5B917] rounded"></div>
                                    <span>Batch Fermenting</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#E5B917] rounded"></div>
                                    <span>Batch Drying</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column: Logs + Status + Time */}
                    <div className="space-y-6">
                        {/* Logs Report */}
                        <div className="bg-[#3E2723] text-[#F5F5DC] p-6 rounded-lg">
                            <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
                                <FileText size={40} />
                                LOGS REPORT
                            </h2>
                            <div className="border-b-3 mb-4 border-[#65524F]"></div>
                            <div className="space-y-2 text-lg">
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Batch Fermented</span>
                                    <span className="text-[#E5B917] font-semibold">12</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Batch Dried</span>
                                    <span className="text-[#E5B917] font-semibold">9</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Approved Batch Qlty</span>
                                    <span className="text-[#E5B917] font-semibold">8</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Rejected Batch Qlty</span>
                                    <span className="text-[#E5B917] font-semibold">1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">New Staff Account</span>
                                    <span className="text-[#E5B917] font-semibold">1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Added Equipment</span>
                                    <span className="text-[#E5B917] font-semibold">2</span>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-[#3E2723] text-[#F5F5DC] p-6 rounded-lg">
                            <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
                                <Package size={40} />
                                STATUS
                            </h2>
                            <div className="border-b-3 mb-4 border-[#65524F]"></div>
                            <div className="space-y-2 text-lg">
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Bean Storage</span>
                                    <span className="text-[#E5B917] font-semibold">Normal</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Equipments</span>
                                    <span className="text-red-400 font-semibold">Low</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Staffs</span>
                                    <span className="text-[#E5B917] font-semibold">High</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#F5F5DC]">Weather</span>
                                    <span className="text-[#E5B917] font-semibold">Stable</span>
                                </div>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="bg-[#3E2723] text-[#F5F5DC] p-3.5 rounded-lg">
                            <div className="text-center">
                                <div className="text-4xl font-bold">{formatTime(currentTime)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}