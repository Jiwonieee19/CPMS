import { useState } from 'react'
import { Menu, Cloud } from 'lucide-react'
import Sidebar from '../Components/sidebar'


export default function WeatherPage() {

    const [activeTab, setActiveTab] = useState('temperature')
    const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false)
    const [isAddBeanModalOpen, setIsAddBeanModalOpen] = useState(false)
    const [scrollPosition, setScrollPosition] = useState(0)

    const Megaphone = new URL('../Assets/icons/icon-megaphone.png', import.meta.url).href;

    const maxValue = 50;
    const barWidth = 150; // Width per bar including gap
    const visibleBars = 8; // Number of bars visible at once
    const graphHeight = 430; // Height of the graph area in pixels

    // Generate hourly data (12am to 11pm = 24 hours)
    const hours = Array.from({ length: 24 }, (_, i) => {
        if (i === 0) return '12am';
        if (i < 12) return `${i}am`;
        if (i === 12) return '12pm';
        return `${i - 12}pm`;
    });

    const getGraphData = () => {
        // Generate random values for each hour
        return hours.map((hour, index) => ({
            hour,
            value: Math.floor(Math.random() * 50) + 10
        }));
    };

    const graphData = getGraphData();

    const today = new Date();
    const dateString = `${today.toLocaleString('default', { month: 'short' })} ${today.getDate()} ${today.getFullYear()}`;

    const handleAddItem = () => {
        setIsAddEquipmentModalOpen(true);
    };

    const handleScroll = (e) => {
        setScrollPosition(e.target.scrollLeft);
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 pt-14 px-14 bg-[#F5F5DC]">
                <h1 className="text-6xl font-extrabold text-[#E5B917] mb-10">
                    WEATHER MONITORING
                </h1>

                {/* ================== TABS + SEARCH ================== */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        {/* Tabs */}
                        <div className="flex bg-[#3E2723] p-2 rounded-2xl gap-2">
                            <button
                                onClick={() => setActiveTab('temperature')}
                                className={`px-10 py-2 rounded-lg font-semibold transition
                                    ${activeTab === 'temperature'
                                        ? 'bg-[#E5B917] text-[#3E2723]'
                                        : 'text-[#F5F5DC] hover:bg-[#65524F]'
                                    }`}
                            >
                                TEMPERATURE
                            </button>

                            <button
                                onClick={() => setActiveTab('humidity')}
                                className={`px-10 py-2 rounded-lg font-semibold transition
                                    ${activeTab === 'humidity'
                                        ? 'bg-[#E5B917] text-[#3E2723]'
                                        : 'text-[#F5F5DC] hover:bg-[#65524F]'
                                    }`}
                            >
                                HUMIDITY
                            </button>

                            <button
                                onClick={() => setActiveTab('wind')}
                                className={`px-10 py-2 rounded-lg font-semibold transition
                                    ${activeTab === 'wind'
                                        ? 'bg-[#E5B917] text-[#3E2723]'
                                        : 'text-[#F5F5DC] hover:bg-[#65524F]'
                                    }`}
                            >
                                WIND
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddItem}
                            className="relative bg-[#E5B917] px-3 rounded-lg hover:bg-[#3E2723] transition flex items-center justify-center"
                        >
                            <img src={Megaphone} alt="Megaphone" className="w-10 h-10" />
                        </button>
                        <button className="bg-[#E5B917] p-4 rounded-lg hover:bg-[#3E2723] transition">
                            <Menu size={32} className="text-[#F5F5DC]" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* ================== GRAPH ================== */}
                <div className="bg-[#3E2723] text-[#F5F5DC] p-6 rounded-lg h-3/4">
                    <h2 className="text-3xl font-semibold mb-2 flex items-center gap-2">
                        <Cloud size={40} />
                        HOURLY FORECAST
                    </h2>
                    <div className="border-b-3 mb-4 border-[#65524F]"></div>
                    <div className="text-center mb-4">
                        <p className="text-xl text-[#E5B917]">{dateString}</p>
                    </div>

                    {/* Graph container with proper alignment */}
                    <div className="relative">
                        {/* Y-axis labels - positioned absolutely on the left */}
                        <div className="absolute left-0 top-0" style={{ width: '40px', height: `${graphHeight}px` }}>
                            {[50, 40, 30, 20, 10].map((lineValue) => (
                                <div
                                    key={lineValue}
                                    className="absolute right-2 text-lg text-[#65524F]"
                                    style={{
                                        top: `${((maxValue - lineValue) / maxValue) * graphHeight}px`,
                                        transform: 'translateY(-50%)'
                                    }}
                                >
                                    {lineValue}
                                </div>
                            ))}
                        </div>

                        {/* Scrollable graph area */}
                        <div
                            className="ml-12 border-2 border-[#65524F] rounded overflow-x-auto overflow-y-hidden scroll-smooth"
                            onScroll={handleScroll}
                            style={{
                                width: `${visibleBars * barWidth}px`,
                                height: `${graphHeight + 40}px` // Extra space for x-axis labels
                            }}
                        >
                            <div className="relative" style={{ width: `${graphData.length * barWidth}px`, height: `${graphHeight}px` }}>
                                {/* Horizontal grid lines - these scroll with the content */}
                                {[10, 20, 30, 40, 50].map((lineValue) => (
                                    <div
                                        key={lineValue}
                                        className="absolute w-full border-t border-[#65524F]"
                                        style={{
                                            bottom: `${(lineValue / maxValue) * 100}%`
                                        }}
                                    />
                                ))}

                                {/* Graph bars */}
                                <div className="flex items-end h-full gap-2 px-2">
                                    {graphData.map((data, index) => (
                                        <div key={index} className="flex flex-col items-center justify-end h-full" style={{ width: `${barWidth - 8}px` }}>
                                            <div className="relative w-full flex items-end justify-center" style={{ height: `${graphHeight}px` }}>
                                                <div
                                                    className="w-2/3 bg-[#F5F5DC] rounded-t-3xl relative flex items-start justify-center pt-2"
                                                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                                                >
                                                    <span className="text-sm font-bold text-[#3E2723]">{data.value}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-[#F5F5DC] mt-2 whitespace-nowrap">{data.hour}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row gap-2 mt-4 text-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#F5F5DC] rounded"></div>
                            <span>{activeTab === 'temperature' ? 'Temperature' : activeTab === 'humidity' ? 'Humidity' : 'Wind Speed'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}