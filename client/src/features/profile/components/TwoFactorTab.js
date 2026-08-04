import React, { useState } from 'react';

const TwoFactorTab = () => {
    // API ready state defaults
    const [twoFactorStatus, setTwoFactorStatus] = useState({
        isAppEnabled: false,
        isSmsEnabled: false,
        isHardwareKeyEnabled: false
    });

    const isAny2FAEnabled = twoFactorStatus.isAppEnabled || twoFactorStatus.isSmsEnabled || twoFactorStatus.isHardwareKeyEnabled;

    return (
        <div className="max-w-2xl">
            {/* Main Status Banner */}
            <div className={`p-4 rounded-xl border mb-6 flex items-start ${isAny2FAEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`mt-0.5 p-1 rounded-full ${isAny2FAEnabled ? 'text-green-600 bg-green-100' : 'text-gray-500 bg-gray-200'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div className="ml-3 flex-1">
                    <h4 className={`text-sm font-bold ${isAny2FAEnabled ? 'text-green-800' : 'text-gray-700'}`}>
                        {isAny2FAEnabled ? 'Two-Factor Auth Enabled' : 'Two-Factor Auth Disabled'}
                    </h4>
                    <p className={`text-xs mt-1 ${isAny2FAEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {isAny2FAEnabled ? 'Your account is secured with 2FA' : 'Enable 2FA to secure your account'}
                    </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${isAny2FAEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {isAny2FAEnabled ? 'Active' : 'Inactive'}
                </span>
            </div>

            <div className="space-y-4">
                {/* Authenticator App */}
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-sm font-bold text-gray-800">Authenticator App</h4>
                            <p className="text-xs text-gray-500">Google Authenticator / Authy</p>
                        </div>
                    </div>
                    <button className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                        {twoFactorStatus.isAppEnabled ? 'Manage' : 'Set up'}
                    </button>
                </div>

                {/* SMS Verification */}
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-sm font-bold text-gray-800">SMS Verification</h4>
                            <p className="text-xs text-gray-500">Get a code via text message</p>
                        </div>
                    </div>
                    <button className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                        {twoFactorStatus.isSmsEnabled ? 'Manage' : 'Set up'}
                    </button>
                </div>

                {/* Hardware Key */}
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-sm font-bold text-gray-800">Hardware Key</h4>
                            <p className="text-xs text-gray-500">YubiKey / FIDO2</p>
                        </div>
                    </div>
                    <button className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                        {twoFactorStatus.isHardwareKeyEnabled ? 'Manage' : 'Set up'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorTab;