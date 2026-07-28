import React, { useState } from 'react';

const ReportsTab = () => {
    const [reports, setReports] = useState([
        { id: 1, name: 'Weekly Security Summary', type: 'Security', schedule: 'Every Monday', date: 'Jul 1, 2026', recipients: '3 users' },
        { id: 2, name: 'Monthly Storage Report', type: 'Storage', schedule: '1st of month', date: 'Jul 1, 2026', recipients: '2 users' },
        { id: 3, name: 'Audit Compliance Report', type: 'Audit', schedule: 'Quarterly', date: 'Jun 30, 2026', recipients: '5 users' },
        { id: 4, name: 'User Activity Digest', type: 'Activity', schedule: 'Weekly', date: 'Jul 1, 2026', recipients: '4 users' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReport, setNewReport] = useState({ name: '', type: 'Security', schedule: 'Weekly', recipients: '' });

    const handleCreateReport = (e) => {
        e.preventDefault();
        if (!newReport.name) return;
        
        const created = {
            id: Date.now(),
            name: newReport.name,
            type: newReport.type,
            schedule: newReport.schedule,
            date: 'Just Now',
            recipients: newReport.recipients ? `${newReport.recipients} users` : '1 user'
        };

        setReports([created, ...reports]);
        setIsModalOpen(false);
        setNewReport({ name: '', type: 'Security', schedule: 'Weekly', recipients: '' });
    };

    const handleDownloadCSV = (reportName) => {
        const dummyData = "Report Name,Generated Date,Status\n" + `${reportName},2026-07-28,Success`;
        const blob = new Blob([dummyData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportName.replace(/\s+/g, '_')}.csv`;
        a.click();
    };

    return (
        <div className="analytics-card">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Scheduled Reports</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Automated compliance and system audit reports</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-900 transition-colors shadow-sm"
                >
                    + New Report
                </button>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                            <th className="py-3 px-4">Report Name</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Schedule</th>
                            <th className="py-3 px-4">Last Generated</th>
                            <th className="py-3 px-4">Recipients</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                        {reports.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="py-4 px-4 font-medium text-gray-800">{r.name}</td>
                                <td className="py-4 px-4">
                                    <span className="px-2.5 py-1 bg-stone-100 text-stone-700 font-medium rounded-full text-xs">
                                        {r.type}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-gray-500">{r.schedule}</td>
                                <td className="py-4 px-4 text-gray-500">{r.date}</td>
                                <td className="py-4 px-4 text-gray-500">{r.recipients}</td>
                                <td className="py-4 px-4 text-right font-medium text-stone-700">
                                    <button 
                                        onClick={() => handleDownloadCSV(r.name)}
                                        className="hover:underline hover:text-stone-900 transition-all text-xs bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-md"
                                    >
                                        Download CSV
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* New Report Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-gray-800">Schedule New Report</h4>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        </div>
                        <form onSubmit={handleCreateReport} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Report Name</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Custom Threat Analysis"
                                    value={newReport.name}
                                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                                    <select 
                                        value={newReport.type}
                                        onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                                    >
                                        <option value="Security">Security</option>
                                        <option value="Storage">Storage</option>
                                        <option value="Audit">Audit</option>
                                        <option value="Activity">Activity</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Schedule</label>
                                    <select 
                                        value={newReport.schedule}
                                        onChange={(e) => setNewReport({ ...newReport, schedule: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Recipients</label>
                                <input 
                                    type="number" 
                                    placeholder="e.g. 3"
                                    value={newReport.recipients}
                                    onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-900"
                                >
                                    Save Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsTab;

















