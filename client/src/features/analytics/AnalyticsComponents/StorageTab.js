// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const StorageTab = ({ filter }) => {
//     const [timeRange, setTimeRange] = useState('Last 12 months');
//     const [isOpen, setIsOpen] = useState(false);
//     const [storageData, setStorageData] = useState([]);
//     const [departments, setDepartments] = useState([]);

//     useEffect(() => {
//         axios.get('http://localhost:8000/api/v1/analytics/storage')
//             .then((res) => {
//                 if (res.data) {
//                     setStorageData(res.data.monthly_growth || []);
//                     setDepartments(res.data.department_breakdown || []);
//                 }
//             })
//             .catch((err) => console.error("Error loading storage analytics:", err));
//     }, [filter]);

//     return (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Left: Storage Growth Chart */}
//             <div className="lg:col-span-2 analytics-card">
//                 <div className="flex justify-between items-center mb-6">
//                     <h3 className="text-lg font-bold text-gray-800">Storage Growth (GB)</h3>
//                     <div className="relative">
//                         <button 
//                             onClick={() => setIsOpen(!isOpen)}
//                             className="flex items-center justify-between w-36 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
//                         >
//                             {timeRange} <span className="text-xs">▼</span>
//                         </button>
//                         {isOpen && (
//                             <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//                                 {['Last 12 months', 'Last 6 months'].map((range) => (
//                                     <div 
//                                         key={range}
//                                         onClick={() => { setTimeRange(range); setIsOpen(false); }}
//                                         className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
//                                     >
//                                         {range}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Recharts Area Chart */}
//                 <div className="h-64 w-full">
//                     <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart data={storageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//                             <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
//                             <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
//                             <Tooltip 
//                                 contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
//                                 formatter={(value) => [`Storage : ${value} GB`, '']}
//                             />
//                             <Area type="monotone" dataKey="storage" stroke="#57534E" strokeWidth={2.5} fill="#F7F5F5" />
//                         </AreaChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>

//             {/* Right: By Department Breakdown */}
//             <div className="analytics-card">
//                 <h3 className="text-lg font-bold text-gray-800 mb-6">By Department</h3>
//                 <div className="space-y-6">
//                     {departments.map((dept, index) => (
//                         <div key={index}>
//                             <div className="flex justify-between text-sm mb-1.5">
//                                 <span className="font-medium text-gray-700">{dept.name}</span>
//                                 <span className="text-gray-400 text-xs">{dept.used} / {dept.total} GB</span>
//                             </div>
//                             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
//                                 <div className="bg-stone-600 h-full rounded-full" style={{ width: `${dept.percentage}%` }}></div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StorageTab;




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StorageTab = ({ filter }) => {
    const [timeRange, setTimeRange] = useState('Last 12 months');
    const [isOpen, setIsOpen] = useState(false);
    const [storageData, setStorageData] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);

        // Fetch base URL from the .env file
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

        // Pass timeRange to the API so the dropdown actually filters the backend data
        axios.get(`${baseUrl}/api/v1/analytics/storage?range=${encodeURIComponent(timeRange)}`)
            .then((res) => {
                if (res.data) {
                    setStorageData(res.data.monthly_growth || []);
                    setDepartments(res.data.department_breakdown || []);
                }
            })
            .catch((err) => {
                console.error("Error loading storage analytics:", err);
                setError(true);
                setStorageData([]);
                setDepartments([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filter, timeRange]); // Added timeRange to trigger refetch on dropdown change

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Storage Growth Chart */}
            <div className="lg:col-span-2 analytics-card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Storage Growth (GB)</h3>
                    <div className="relative">
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center justify-between w-36 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            {timeRange} <span className="text-xs">▼</span>
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {['Last 12 months', 'Last 6 months'].map((range) => (
                                    <div 
                                        key={range}
                                        onClick={() => { setTimeRange(range); setIsOpen(false); }}
                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                    >
                                        {range}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recharts Area Chart with Loading/Error States */}
                <div className="h-64 w-full">
                    {loading ? (
                        <p className="text-gray-500 text-sm h-full flex items-center justify-center">Loading storage data...</p>
                    ) : error || storageData.length === 0 ? (
                        <p className="text-gray-500 text-sm h-full flex items-center justify-center">No storage data available.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={storageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`Storage : ${value} GB`, '']}
                                />
                                <Area type="monotone" dataKey="storage" stroke="#57534E" strokeWidth={2.5} fill="#F7F5F5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Right: By Department Breakdown */}
            <div className="analytics-card">
                <h3 className="text-lg font-bold text-gray-800 mb-6">By Department</h3>
                <div className="space-y-6">
                    {loading ? (
                        <p className="text-gray-500 text-sm">Loading department breakdown...</p>
                    ) : error || departments.length === 0 ? (
                        <p className="text-gray-500 text-sm">No department data found.</p>
                    ) : (
                        departments.map((dept, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-gray-700">{dept.name}</span>
                                    <span className="text-gray-400 text-xs">{dept.used} / {dept.total} GB</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-stone-600 h-full rounded-full" style={{ width: `${dept.percentage}%` }}></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default StorageTab;