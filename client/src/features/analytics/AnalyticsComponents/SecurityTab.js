import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SecurityTab = ({ filter }) => {
    const [securityEvents, setSecurityEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);

        // Fetch base URL from the environment configuration
        const baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '';

        // Live API Endpoint call
        axios.get(`${baseUrl}/api/v1/analytics/security?range=${encodeURIComponent(filter || 'Last 30 Days')}`)
            .then((res) => {
                if (res.data) {
                    setSecurityEvents(res.data.events || []);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch security logs:", err);
                setError(true);
                setSecurityEvents([]); // Clear fallback mock data
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filter]);

    return (
        <div className="analytics-card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Security Incident Audit Trail</h3>
            <div className="overflow-x-auto">
                {/* Handle Loading State */}
                {loading ? (
                    <p className="text-gray-500 text-sm py-4">Loading security logs...</p>
                ) : 
                /* Handle Error or Empty State */
                error || securityEvents.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">No security events found for the selected range.</p>
                ) : (
                    /* Render Table if Data Exists */
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                            <tr>
                                <th className="py-3 px-4">Event Type</th>
                                <th className="py-3 px-4">IP Address</th>
                                <th className="py-3 px-4">Timestamp</th>
                                <th className="py-3 px-4">Severity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {securityEvents.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="py-3 px-4 font-medium text-gray-800">{item.event}</td>
                                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{item.ip}</td>
                                    <td className="py-3 px-4 text-xs text-gray-400">{item.time}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                            item.severity === 'High' ? 'bg-red-100 text-red-700' :
                                            item.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {item.severity}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SecurityTab;