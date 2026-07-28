import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DownloadsTab = () => {
    const downloadData = [
        { month: 'Jan', downloads: 420 },
        { month: 'Feb', downloads: 580 },
        { month: 'Mar', downloads: 510 },
        { month: 'Apr', downloads: 680 },
        { month: 'May', downloads: 740 },
        { month: 'Jun', downloads: 820 },
        { month: 'Jul', downloads: 900 },
    ];

    return (
        <div className="analytics-card">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Download Trends</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={downloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`downloads : ${value}`, '']}
                        />
                        <Bar dataKey="downloads" fill="#57534E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DownloadsTab;