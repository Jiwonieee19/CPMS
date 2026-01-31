import { useState } from 'react'
import { Menu, Cloud } from 'lucide-react'
import Sidebar from '../Components/sidebar'
import '../Styles/scrollbar.css'

export default function WeatherPage({ weather }) {

    const [activeTab, setActiveTab] = useState('temperature')

    // ================= REAL WEATHER DATA =================
    const hours = weather?.forecast?.forecastday?.[0]?.hour || [];

    const graphData = hours.map(h => ({
        hour: new Date(h.time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }),
        temperature: Math.round(h.temp_c),
        humidity: h.humidity,
        windSpeed: Math.round(h.wind_kph),
    }));
    // =====================================================

    const getDataForTab = () => {
        return graphData.map(item => ({
            hour: item.hour,
            value:
                activeTab === 'temperature'
                    ? item.temperature
                    : activeTab === 'humidity'
                        ? item.humidity
                        : item.windSpeed
        }));
    };

    const displayData = getDataForTab();

    const today = new Date();
    const dateString = `${today.toLocaleString('default', { month: 'short' })} ${today.getDate()} ${today.getFullYear()}`;

    const maxValue =
        activeTab === 'temperature'
            ? 50
            : activeTab === 'humidity'
                ? 100
                : 50;

    const barWidth = 150;
    const visibleBars = 8;
    const graphHeight = 430;

    const Megaphone = new URL('../Assets/icons/icon-megaphone.png', import.meta.url).href;

    const handleAddItem = () => {
        // Placeholder for add item functionality
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
                            className="relative bg-[#E5B917] p-4 rounded-lg hover:bg-[#3E2723] transition flex items-center justify-center"
                        >
                            <img src={Megaphone} alt="Megaphone" className="w-8 h-8" />
                        </button>
                        <button className="bg-[#E5B917] p-4 rounded-lg hover:bg-[#3E2723] transition">
                            <Menu size={32} className="text-[#F5F5DC]" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* ================== GRAPH ================== */}
                <div className="bg-[#3E2723] text-[#F5F5DC] p-6 rounded-lg">
                    <h2 className="text-3xl font-semibold mb-2 flex items-center gap-2">
                        <Cloud size={40} />
                        HOURLY FORECAST
                    </h2>

                    <p className="text-center text-xl text-[#E5B917] mb-4">
                        {dateString}
                    </p>

                    <div
                        className="border-2 border-[#65524F] rounded overflow-x-auto"
                        style={{ width: `${visibleBars * barWidth}px` }}
                    >
                        <div
                            className="flex items-end h-full gap-2 px-2"
                            style={{ width: `${displayData.length * barWidth}px`, height: graphHeight }}
                        >
                            {displayData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center justify-end h-full" style={{ width: barWidth }}>
                                    <div
                                        className="w-2/3 bg-[#F5F5DC] rounded-t-3xl flex items-start justify-center pt-2"
                                        style={{ height: `${(data.value / maxValue) * 100}%` }}
                                    >
                                        <span className="text-sm font-bold text-[#3E2723]">
                                            {data.value}
                                        </span>
                                    </div>
                                    <span className="text-xs mt-2">{data.hour}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 text-lg">
                        {activeTab === 'temperature' && 'Temperature (°C)'}
                        {activeTab === 'humidity' && 'Humidity (%)'}
                        {activeTab === 'wind' && 'Wind Speed (km/h)'}
                    </div>
                </div>
            </div>
        </div>
    )
}
