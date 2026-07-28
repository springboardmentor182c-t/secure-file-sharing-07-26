import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SecurityTab = () => {
    const securityData = [
        { month: 'Jan', events: 12 },
        { month: 'Feb', events: 8 },
        { month: 'Mar', events: 15 },
        { month: 'Apr', events: 6 },
        { month: 'May', events: 20 },
        { month: 'Jun', events: 4 },
        { month: 'Jul', events: 7 },
    ];

    const eventBreakdown = [
        { label: 'Failed Logins', count: '47 events', width: '100%', color: 'bg-red-500' },
        { label: 'Suspicious Shares', count: '12 events', width: '45%', color: 'bg-amber-400' },
        { label: 'Policy Violations', count: '8 events', width: '30%', color: 'bg-orange-500' },
        { label: 'Key Rotation Overdue', count: '7 events', width: '25%', color: 'bg-purple-500' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Security Events Over Time Chart */}
            <div className="lg:col-span-2 analytics-card">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Security Events Over Time</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={securityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [`events : ${value}`, '']}
                            />
                            <Area type="monotone" dataKey="events" stroke="#EF4444" strokeWidth={2.5} fill="#FEE2E2" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right: Event Breakdown */}
            <div className="analytics-card">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Event Breakdown</h3>
                <div className="space-y-6">
                    {eventBreakdown.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium text-gray-700">{item.label}</span>
                                <span className="text-gray-400 text-xs">{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className={`${item.color} h-full rounded-full`} style={{ width: item.width }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SecurityTab;