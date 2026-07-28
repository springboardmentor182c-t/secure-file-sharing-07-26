import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DownloadsTab = ({ filter }) => {
    const [downloadsData, setDownloadsData] = useState([]);
    const [topFiles, setTopFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);
        
        // Fetch base URL from the .env file
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

        // Live API Endpoint call
        axios.get(`${baseUrl}/api/v1/analytics/downloads?range=${encodeURIComponent(filter || 'Last 30 Days')}`)
            .then((res) => {
                if (res.data) {
                    setDownloadsData(res.data.hourly_trend || []);
                    setTopFiles(res.data.top_downloaded_files || []);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch downloads analytics:", err);
                setError(true); 
                setDownloadsData([]); // Clear data on error
                setTopFiles([]); 
            })
            .finally(() => setLoading(false));
    }, [filter]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 analytics-card">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Download Traffic Trend</h3>
                
                {/* Handle Loading and Error States */}
                {loading ? (
                    <p className="text-gray-500">Loading data...</p>
                ) : error || downloadsData.length === 0 ? (
                    <p className="text-gray-500">No data available for this range.</p>
                ) : (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={downloadsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                                <Bar dataKey="count" fill="#57534E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="analytics-card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Most Downloaded Files</h3>
                
                {/* Handle Loading and Error States */}
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : error || topFiles.length === 0 ? (
                    <p className="text-gray-500">No files found.</p>
                ) : (
                    <div className="space-y-4">
                        {topFiles.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{file.name}</p>
                                    <p className="text-xs text-gray-400">{file.size}</p>
                                </div>
                                <span className="px-2.5 py-1 text-xs font-semibold bg-stone-100 text-stone-800 rounded-md">
                                    {file.downloads} dl
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadsTab;