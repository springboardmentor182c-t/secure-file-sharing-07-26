// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import StorageTab from './AnalyticsComponents/StorageTab';
// import DownloadsTab from './AnalyticsComponents/DownloadsTab';
// import SecurityTab from './AnalyticsComponents/SecurityTab';
// import ReportsTab from './AnalyticsComponents/ReportsTab';
// import './analytics.css';

// const Analytics = () => {
//     const [activeTab, setActiveTab] = useState('storage');
//     const [globalFilter, setGlobalFilter] = useState('Last 30 Days');
//     const [lastSync, setLastSync] = useState('Just Now');

//     // Dynamic state for summary cards
//     const [summary, setSummary] = useState({
//         total_storage_gb: 42.8,
//         storage_change_gb: 8.3,
//         active_links: 3841,
//         links_change_pct: 12.0,
//         total_downloads: 284,
//         downloads_change: 34,
//         security_alerts: 47,
//         alerts_change_pct: -18.0
//     });

//     // Fetch summary metrics from FastAPI backend
//     const fetchSummaryData = () => {
//         setLastSync('Refreshing...');
//         axios.get(`http://localhost:8000/api/v1/analytics/summary?range=${encodeURIComponent(globalFilter)}`)
//             .then((response) => {
//                 setSummary(response.data);
//                 setLastSync('Just Now');
//             })
//             .catch((error) => {
//                 console.error("Failed to fetch analytics summary:", error);
//                 setLastSync('Sync Failed');
//             });
//     };

//     useEffect(() => {
//         fetchSummaryData();
//     }, [globalFilter]);

//     const handleRefreshData = () => {
//         fetchSummaryData();
//     };

//     const handleExportOverview = () => {
//         const overviewContent = `Metric,Value,Trend\nTotal Storage,${summary.total_storage_gb} GB,+${summary.storage_change_gb} GB\nActive Links,${summary.active_links},+${summary.links_change_pct}%\nTotal Downloads,${summary.total_downloads},+${summary.downloads_change}\nSecurity Alerts,${summary.security_alerts},${summary.alerts_change_pct}%`;
//         const blob = new Blob([overviewContent], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `Analytics_Summary_${globalFilter.replace(/\s+/g, '_')}.csv`;
//         a.click();
//     };

//     return (
//         <div className="analytics-wrapper">
//             {/* Header with Global Date Filter & Sync Status */}
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
//                 <div>
//                     <h1 className="analytics-title mb-0">Analytics</h1>
//                     <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
//                         <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
//                         <span>Live Sync Status: {lastSync}</span>
//                         <button onClick={handleRefreshData} className="hover:text-stone-800 underline ml-1">
//                             ↻ Sync
//                         </button>
//                     </div>
//                 </div>

//                 {/* Date Range Picker & Export Action Bar */}
//                 <div className="flex items-center space-x-3">
//                     <select 
//                         value={globalFilter}
//                         onChange={(e) => setGlobalFilter(e.target.value)}
//                         className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:border-stone-800"
//                     >
//                         <option value="Last 7 Days">Last 7 Days</option>
//                         <option value="Last 30 Days">Last 30 Days</option>
//                         <option value="Last 6 Months">Last 6 Months</option>
//                         <option value="Last 1 Year">Last 1 Year</option>
//                     </select>

//                     <button 
//                         onClick={handleExportOverview}
//                         className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg shadow-sm transition-colors"
//                     >
//                         <span>⤓</span>
//                         <span>Export Data</span>
//                     </button>
//                 </div>
//             </div>
            
//             {/* Top 4 Metric Summary Cards */}
//             <div className="metrics-grid">
//                 <div className="metric-card">
//                     <p className="text-gray-500 text-sm font-medium">Total Storage</p>
//                     <h2 className="text-2xl font-bold text-gray-800 mt-1">{summary.total_storage_gb} GB</h2>
//                     <span className="text-green-600 text-xs font-semibold">↗ +{summary.storage_change_gb} GB</span>
//                 </div>
//                 <div className="metric-card">
//                     <p className="text-gray-500 text-sm font-medium">Active Links</p>
//                     <h2 className="text-2xl font-bold text-gray-800 mt-1">{summary.active_links?.toLocaleString()}</h2>
//                     <span className="text-green-600 text-xs font-semibold">↗ +{summary.links_change_pct}%</span>
//                 </div>
//                 <div className="metric-card">
//                     <p className="text-gray-500 text-sm font-medium">Total Downloads</p>
//                     <h2 className="text-2xl font-bold text-gray-800 mt-1">{summary.total_downloads}</h2>
//                     <span className="text-green-600 text-xs font-semibold">↗ +{summary.downloads_change}</span>
//                 </div>
//                 <div className="metric-card">
//                     <p className="text-gray-500 text-sm font-medium">Security Alerts</p>
//                     <h2 className="text-2xl font-bold text-gray-800 mt-1">{summary.security_alerts}</h2>
//                     <span className="text-red-600 text-xs font-semibold">↘ {summary.alerts_change_pct}%</span>
//                 </div>
//             </div>

//             {/* Tabs Navigation */}
//             <div className="tabs-nav">
//                 {['storage', 'downloads', 'security', 'reports'].map((tab) => (
//                     <button
//                         key={tab}
//                         onClick={() => setActiveTab(tab)}
//                         className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
//                     >
//                         {tab}
//                     </button>
//                 ))}
//             </div>

//             {/* Tab Content Area */}
//             <div className="tab-content-area">
//                 {activeTab === 'storage' && <StorageTab filter={globalFilter} />}
//                 {activeTab === 'downloads' && <DownloadsTab filter={globalFilter} />}
//                 {activeTab === 'security' && <SecurityTab filter={globalFilter} />}
//                 {activeTab === 'reports' && <ReportsTab />}
//             </div>
//         </div>
//     );
// };

// export default Analytics;





import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StorageTab from './AnalyticsComponents/StorageTab';
import DownloadsTab from './AnalyticsComponents/DownloadsTab';
import SecurityTab from './AnalyticsComponents/SecurityTab';
import ReportsTab from './AnalyticsComponents/ReportsTab';
import './analytics.css';

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('storage');
    const [globalFilter, setGlobalFilter] = useState('Last 30 Days');
    const [lastSync, setLastSync] = useState('Just Now');

    // Dynamic state initialized with 0 to prevent flashing dummy data
    const [summary, setSummary] = useState({
        total_storage_gb: 0,
        storage_change_gb: 0,
        active_links: 0,
        links_change_pct: 0,
        total_downloads: 0,
        downloads_change: 0,
        security_alerts: 0,
        alerts_change_pct: 0
    });

    // Fetch base URL from the .env file
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

    // Fetch summary metrics from FastAPI backend
    const fetchSummaryData = () => {
        setLastSync('Refreshing...');
        axios.get(`${baseUrl}/api/v1/analytics/summary?range=${encodeURIComponent(globalFilter)}`)
            .then((response) => {
                if (response.data) {
                    setSummary(response.data);
                }
                setLastSync('Just Now');
            })
            .catch((error) => {
                console.error("Failed to fetch analytics summary:", error);
                setLastSync('Sync Failed');
            });
    };

    useEffect(() => {
        fetchSummaryData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalFilter]);

    const handleRefreshData = () => {
        fetchSummaryData();
    };

    const handleExportOverview = () => {
        const getSign = (val) => (val > 0 ? '+' : '');
        const overviewContent = `Metric,Value,Trend
Total Storage,${summary.total_storage_gb} GB,${getSign(summary.storage_change_gb)}${summary.storage_change_gb} GB
Active Links,${summary.active_links},${getSign(summary.links_change_pct)}${summary.links_change_pct}%
Total Downloads,${summary.total_downloads},${getSign(summary.downloads_change)}${summary.downloads_change}
Security Alerts,${summary.security_alerts},${getSign(summary.alerts_change_pct)}${summary.alerts_change_pct}%`;
        
        const blob = new Blob([overviewContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Analytics_Summary_${globalFilter.replace(/\s+/g, '_')}.csv`;
        a.click();
    };

    // Helper function to dynamically render trend arrows and colors
    const renderTrend = (value, unit = '') => {
        const num = Number(value) || 0;
        const colorClass = num >= 0 ? 'text-green-600' : 'text-red-600';
        const arrow = num >= 0 ? '↗' : '↘';
        const displayValue = num > 0 ? `+${num}` : num; // automatically handles negative signs
        
        return (
            <span className={`${colorClass} text-xs font-semibold`}>
                {arrow} {displayValue}{unit}
            </span>
        );
    };

    return (
        <div className="analytics-wrapper">
            {/* Header with Global Date Filter & Sync Status */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <h1 className="analytics-title mb-0">Analytics</h1>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${lastSync === 'Sync Failed' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
                        <span>Live Sync Status: {lastSync}</span>
                        <button onClick={handleRefreshData} className="hover:text-stone-800 underline ml-1">
                            ↻ Sync
                        </button>
                    </div>
                </div>

                {/* Date Range Picker & Export Action Bar */}
                <div className="flex items-center space-x-3">
                    <select 
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:border-stone-800"
                    >
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="Last 6 Months">Last 6 Months</option>
                        <option value="Last 1 Year">Last 1 Year</option>
                    </select>

                    <button 
                        onClick={handleExportOverview}
                        className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg shadow-sm transition-colors"
                    >
                        <span>⤓</span>
                        <span>Export Data</span>
                    </button>
                </div>
            </div>
            
            {/* Top 4 Metric Summary Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <p className="text-gray-500 text-sm font-medium">Total Storage</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{summary.total_storage_gb} GB</h2>
                    {renderTrend(summary.storage_change_gb, ' GB')}
                </div>
                <div className="metric-card">
                    <p className="text-gray-500 text-sm font-medium">Active Links</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{summary.active_links?.toLocaleString()}</h2>
                    {renderTrend(summary.links_change_pct, '%')}
                </div>
                <div className="metric-card">
                    <p className="text-gray-500 text-sm font-medium">Total Downloads</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{summary.total_downloads?.toLocaleString()}</h2>
                    {renderTrend(summary.downloads_change)}
                </div>
                <div className="metric-card">
                    <p className="text-gray-500 text-sm font-medium">Security Alerts</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{summary.security_alerts?.toLocaleString()}</h2>
                    {renderTrend(summary.alerts_change_pct, '%')}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="tabs-nav">
                {['storage', 'downloads', 'security', 'reports'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content Area */}
            <div className="tab-content-area">
                {activeTab === 'storage' && <StorageTab filter={globalFilter} />}
                {activeTab === 'downloads' && <DownloadsTab filter={globalFilter} />}
                {activeTab === 'security' && <SecurityTab filter={globalFilter} />}
                {activeTab === 'reports' && <ReportsTab />}
            </div>
        </div>
    );
};

export default Analytics;