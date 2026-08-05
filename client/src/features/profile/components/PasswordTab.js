import React, { useState } from 'react';

const PasswordTab = () => {
    // Empty state initialized
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        // API Call to update password goes here
    };

    return (
        <form onSubmit={handleUpdate} className="max-w-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Change Password</h3>
            
            <div className="space-y-5 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handleInputChange} placeholder="Enter current password" className="pl-10 w-full border border-gray-300 rounded-lg py-2 focus:ring-1 focus:ring-[#57534E] focus:border-[#57534E] text-sm" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handleInputChange} placeholder="Min. 12 characters" className="pl-10 w-full border border-gray-300 rounded-lg py-2 focus:ring-1 focus:ring-[#57534E] focus:border-[#57534E] text-sm" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handleInputChange} placeholder="Repeat new password" className="pl-10 w-full border border-gray-300 rounded-lg py-2 focus:ring-1 focus:ring-[#57534E] focus:border-[#57534E] text-sm" />
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500 mb-6">Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.</p>

            <button type="submit" className="bg-[#57534E] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#44403C] transition flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Update Password
            </button>
        </form>
    );
};

export default PasswordTab;