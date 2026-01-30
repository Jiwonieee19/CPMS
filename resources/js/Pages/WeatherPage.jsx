import { useState } from 'react'
import { Menu, Cloud } from 'lucide-react'
import Sidebar from '../Components/sidebar'

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

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 pt-14 px-14 bg-[#F5F5DC]">
                <h1 className="text-6xl font-extrabold text-[#E5B917] mb-10">
                    WEATHER MONITORING
                </h1>

                {/* ================== TABS ================== */}
                <div className="flex bg-[#3E2723] p-2 rounded-2xl gap-2 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('temperature')}
                        className={`px-10 py-2 rounded-lg font-semibold
                            ${activeTab === 'temperature'
                                ? 'bg-[#E5B917] text-[#3E2723]'
                                : 'text-[#F5F5DC]'}`}
                    >
                        TEMPERATURE
                    </button>

                    <button
                        onClick={() => setActiveTab('humidity')}
                        className={`px-10 py-2 rounded-lg font-semibold
                            ${activeTab === 'humidity'
                                ? 'bg-[#E5B917] text-[#3E2723]'
                                : 'text-[#F5F5DC]'}`}
                    >
                        HUMIDITY
                    </button>

                    <button
                        onClick={() => setActiveTab('wind')}
                        className={`px-10 py-2 rounded-lg font-semibold
                            ${activeTab === 'wind'
                                ? 'bg-[#E5B917] text-[#3E2723]'
                                : 'text-[#F5F5DC]'}`}
                    >
                        WIND
                    </button>
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
