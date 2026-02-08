import { useState, useEffect } from 'react';
import { Cloud, Clock, FileText, Package } from 'lucide-react';
import Sidebar from '../Components/sidebar.jsx';

export default function DashboardPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [processData, setProcessData] = useState([]);
    const [processLoading, setProcessLoading] = useState(true);
    const [logsData, setLogsData] = useState(null);
    const [logsLoading, setLogsLoading] = useState(true);
    const [statusData, setStatusData] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const response = await fetch('/weather-data/latest');
                const result = await response.json();
                if (result.data) {
                    setWeatherData(result.data);
                }
            } catch (error) {
                console.error('Error fetching weather data:', error);
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeatherData();
    }, []);

    useEffect(() => {
        const fetchProcessData = async () => {
            try {
                const response = await fetch('/dashboard/process-overview');
                const result = await response.json();
                if (result.data) {
                    setProcessData(result.data);
                }
            } catch (error) {
                console.error('Error fetching process data:', error);
            } finally {
                setProcessLoading(false);
            }
        };

        fetchProcessData();
    }, []);

    useEffect(() => {
        const fetchLogsData = async () => {
            try {
                const response = await fetch('/dashboard/logs-report');
                const result = await response.json();
                if (result.data) {
                    setLogsData(result.data);
                }
            } catch (error) {
                console.error('Error fetching logs data:', error);
            } finally {
                setLogsLoading(false);
            }
        };

        fetchLogsData();
    }, []);

    useEffect(() => {
        const fetchStatusData = async () => {
            try {
                const response = await fetch('/dashboard/status');
                const result = await response.json();
                if (result.data) {
                    setStatusData(result.data);
                }
            } catch (error) {
                console.error('Error fetching status data:', error);
            } finally {
                setStatusLoading(false);
            }
        };

        fetchStatusData();
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    // Calculate max value dynamically based on data
    const maxValue = processData.length > 0
        ? Math.max(
            50, // minimum scale
            ...processData.flatMap(d => [d.drying, d.fermenting])
        )
        : 50;

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
                                    <span className="text-[#E5B917] ml-2 font-semibold">
                                        {weatherLoading ? '...' : weatherData ? `${weatherData.humidity}%` : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#F5F5DC]">Wind:</span>
                                    <span className="text-[#E5B917] ml-2 font-semibold">
                                        {weatherLoading ? '...' : weatherData ? `${weatherData.wind_speed} m/s` : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#F5F5DC]">Temperature:</span>
                                    <span className="text-[#E5B917] ml-2 font-semibold">
                                        {weatherLoading ? '...' : weatherData ? `${weatherData.temperature}°C` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Process Overview */}
                        <div className="bg-[#3E2723] text-[#F5F5DC] p-6 rounded-lg">
                            <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
                                <Clock size={40} />
                                PROCESS OVERVIEW
                            </h2>
                            <div className="border-b-3 mb-4 border-[#65524F] mb-31"></div>
                            {processLoading ? (
                                <div className="text-center text-lg py-20">Loading...</div>
                            ) : processData.length === 0 ? (
                                <div className="text-center text-lg py-20">No process data available</div>
                            ) : (
                                <div className="relative h-64 flex items-end justify-around gap-2 mt-22">
                                    {/* Horizontal grid lines background */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {[10, 20, 30, 40, 50].map((lineValue) => (
                                            <div key={lineValue} style={{ position: 'absolute', marginLeft: '35px', marginBottom: '40px', bottom: `${(lineValue / maxValue) * 100}%`, width: '95%' }}>
                                                <div className="border-t border-[#65524F] w-full"></div>
                                                <span className="text-lg text-[#65524F] absolute -ml-8 -mt-4">{lineValue}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className='flex flex-row items-center gap-1 flex-1 z-10 ml-8 border-2 border-[#65524F] rounded'>
                                        {/* div above is for border graph */}
                                        {processData.map((data, index) => (
                                            <div key={index} className="flex flex-col items-center gap-1 p-4 flex-1 z-10">
                                                <div className="relative w-full h-70">
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
                                </div>
                            )}
                            <div className="flex flex-row gap-2 mt-4 text-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#F5F5DC] rounded"></div>
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
                            {logsLoading ? (
                                <div className="text-center text-lg py-10">Loading...</div>
                            ) : logsData ? (
                                <div className="space-y-2 text-lg">
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Batch Fermented</span>
                                        <span className="text-[#E5B917] font-semibold">{logsData.batch_fermented ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Batch Dried</span>
                                        <span className="text-[#E5B917] font-semibold">{logsData.batch_dried ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Batch Graded</span>
                                        <span className="text-[#E5B917] font-semibold">{logsData.batch_graded ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Edited Account</span>
                                        <span className="text-[#E5B917] font-semibold">{logsData.account_edited ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">New Account</span>
                                        <span className="text-[#E5B917] font-semibold">{logsData.account_added ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Added Stock on Equipment</span>
                                        <span className="text-[#E5B917] font-semibold">{logsData.stock_added ?? 0}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-lg py-10">No logs data available</div>
                            )}
                        </div>

                        {/* Status */}
                        <div className="bg-[#3E2723] text-[#F5F5DC] p-6 rounded-lg">
                            <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
                                <Package size={40} />
                                STATUS
                            </h2>
                            <div className="border-b-3 mb-4 border-[#65524F]"></div>
                            {statusLoading ? (
                                <div className="text-center text-lg py-10">Loading...</div>
                            ) : statusData ? (
                                <div className="space-y-2 text-lg">
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Process</span>
                                        <span className={`font-semibold ${statusData.process.color === 'yellow' ? 'text-[#E5B917]' :
                                            statusData.process.color === 'green' ? 'text-green-400' :
                                                statusData.process.color === 'red' ? 'text-red-400' :
                                                    'text-gray-400'
                                            }`}>{statusData.process.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Equipments</span>
                                        <span className={`font-semibold ${statusData.equipment.color === 'yellow' ? 'text-[#E5B917]' :
                                            statusData.equipment.color === 'green' ? 'text-green-400' :
                                                statusData.equipment.color === 'red' ? 'text-red-400' :
                                                    'text-gray-400'
                                            }`}>{statusData.equipment.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Staffs</span>
                                        <span className={`font-semibold ${statusData.staff.color === 'yellow' ? 'text-[#E5B917]' :
                                            statusData.staff.color === 'green' ? 'text-green-400' :
                                                statusData.staff.color === 'red' ? 'text-red-400' :
                                                    'text-gray-400'
                                            }`}>{statusData.staff.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#F5F5DC]">Weather</span>
                                        <span className={`font-semibold ${statusData.weather.color === 'yellow' ? 'text-[#E5B917]' :
                                            statusData.weather.color === 'green' ? 'text-green-400' :
                                                statusData.weather.color === 'red' ? 'text-red-400' :
                                                    'text-gray-400'
                                            }`}>{statusData.weather.status}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-lg py-10">No status data available</div>
                            )}
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