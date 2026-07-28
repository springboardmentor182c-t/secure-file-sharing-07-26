// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ReportsTab = () => {
//     const [reports, setReports] = useState([]);

//     useEffect(() => {
//         axios.get('http://localhost:8000/api/v1/analytics/reports')
//             .then((res) => {
//                 if (res.data) {
//                     setReports(res.data.reports || []);
//                 }
//             })
//             .catch((err) => {
//                 console.error("Failed to fetch reports:", err);
//                 setReports([
//                     { id: 'REP-001', name: 'Monthly_Storage_Audit_July.pdf', date: '2026-07-28', status: 'Ready' },
//                     { id: 'REP-002', name: 'Security_Threat_Matrix_Q2.pdf', date: '2026-07-15', status: 'Ready' }
//                 ]);
//             });
//     }, []);

//     const handleGenerateReport = (type) => {
//         axios.post('http://localhost:8000/api/v1/analytics/reports', { report_type: type })
//             .then(() => alert(`${type} report generation triggered!`))
//             .catch(() => alert(`Triggered ${type} report generation (Mock)`));
//     };

//     return (
//         <div className="analytics-card space-y-6">
//             <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-bold text-gray-800">Exportable Analytics Reports</h3>
//                 <button 
//                     onClick={() => handleGenerateReport('Custom Audit')}
//                     className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-700 shadow-sm"
//                 >
//                     + Generate New Report
//                 </button>
//             </div>

//             <div className="space-y-3">
//                 {reports.map((report) => (
//                     <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-stone-400 transition-all">
//                         <div>
//                             <h4 className="text-sm font-bold text-gray-800">{report.name}</h4>
//                             <p className="text-xs text-gray-400 mt-0.5">ID: {report.id} • Generated on {report.date}</p>
//                         </div>
//                         <button className="text-xs font-semibold px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100">
//                             Download PDF
//                         </button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default ReportsTab;




import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportsTab = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Fetch base URL from the .env file
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        setLoading(true);
        setError(false);

        axios.get(`${baseUrl}/api/v1/analytics/reports`)
            .then((res) => {
                if (res.data) {
                    setReports(res.data.reports || []);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch reports:", err);
                setError(true);
                setReports([]); // Cleared dummy data, defaults to an empty array
            })
            .finally(() => {
                setLoading(false);
            });
    }, [baseUrl]);

    const handleGenerateReport = (type) => {
        axios.post(`${baseUrl}/api/v1/analytics/reports`, { report_type: type })
            .then(() => alert(`${type} report generation triggered successfully!`))
            .catch((err) => {
                console.error("Failed to generate report:", err);
                // Removed the "Mock" alert and replaced it with a real error message
                alert(`Failed to trigger ${type} report generation. Please try again later.`);
            });
    };

    return (
        <div className="analytics-card space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Exportable Analytics Reports</h3>
                <button 
                    onClick={() => handleGenerateReport('Custom Audit')}
                    className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-700 shadow-sm"
                >
                    + Generate New Report
                </button>
            </div>

            <div className="space-y-3">
                {/* Handle Loading, Error, and Empty States Gracefully */}
                {loading ? (
                    <p className="text-gray-500 text-sm">Loading reports...</p>
                ) : error || reports.length === 0 ? (
                    <p className="text-gray-500 text-sm">No reports available at the moment.</p>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-stone-400 transition-all">
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">{report.name}</h4>
                                <p className="text-xs text-gray-400 mt-0.5">ID: {report.id} • Generated on {report.date}</p>
                            </div>
                            <button className="text-xs font-semibold px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100">
                                Download PDF
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReportsTab;