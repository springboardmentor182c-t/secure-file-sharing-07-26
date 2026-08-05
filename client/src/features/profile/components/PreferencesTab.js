import React, { useState } from 'react';

const PreferencesTab = () => {
    // Default production state
    const [preferences, setPreferences] = useState({
        timezone: '',
        language: '',
        emailNotifications: false,
        desktopPush: false,
        activityDigest: false,
        showPreviews: false
    });

    const handleToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setPreferences(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // API call to save preferences goes here
    };

    // Reusable Toggle Component
    const ToggleSwitch = ({ label, isChecked, onToggle }) => (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <button 
                type="button"
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#57534E] focus:ring-offset-2 ${isChecked ? 'bg-[#57534E]' : 'bg-gray-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select name="timezone" value={preferences.timezone} onChange={handleSelectChange} className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-1 focus:ring-[#57534E] focus:border-[#57534E] text-sm bg-white">
                        <option value="">Select Timezone</option>
                        {/* Standard Global Timezones */}
                        <option value="UTC-12:00">International Date Line West (UTC-12:00)</option>
                        <option value="UTC-10:00">Hawaii Time (UTC-10:00)</option>
                        <option value="UTC-08:00">Pacific Time - US & Canada (UTC-08:00)</option>
                        <option value="UTC-07:00">Mountain Time - US & Canada (UTC-07:00)</option>
                        <option value="UTC-06:00">Central Time - US & Canada (UTC-06:00)</option>
                        <option value="UTC-05:00">Eastern Time - US & Canada (UTC-05:00)</option>
                        <option value="UTC-03:00">Brasilia Time - South America (UTC-03:00)</option>
                        <option value="UTC+00:00">Greenwich Mean Time / UTC (UTC+00:00)</option>
                        <option value="UTC+01:00">Central European Time (UTC+01:00)</option>
                        <option value="UTC+02:00">Eastern European Time (UTC+02:00)</option>
                        <option value="UTC+04:00">Gulf Standard Time - Dubai (UTC+04:00)</option>
                        <option value="UTC+05:30">India Standard Time (UTC+05:30)</option>
                        <option value="UTC+08:00">China Standard Time - Beijing (UTC+08:00)</option>
                        <option value="UTC+09:00">Japan Standard Time - Tokyo (UTC+09:00)</option>
                        <option value="UTC+10:00">Australian Eastern Time (UTC+10:00)</option>
                        <option value="UTC+12:00">New Zealand Standard Time (UTC+12:00)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select name="language" value={preferences.language} onChange={handleSelectChange} className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-1 focus:ring-[#57534E] focus:border-[#57534E] text-sm bg-white">
                        <option value="">Select Language</option>
                        {/* Standard Global Languages */}
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="es-ES">Español (Spanish)</option>
                        <option value="fr-FR">Français (French)</option>
                        <option value="de-DE">Deutsch (German)</option>
                        <option value="it-IT">Italiano (Italian)</option>
                        <option value="pt-BR">Português (Portuguese)</option>
                        <option value="hi-IN">हिन्दी (Hindi)</option>
                        <option value="zh-CN">中文 (Simplified Chinese)</option>
                        <option value="ja-JP">日本語 (Japanese)</option>
                        <option value="ko-KR">한국어 (Korean)</option>
                        <option value="ar-SA">العربية (Arabic)</option>
                    </select>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-8 space-y-1">
                <ToggleSwitch 
                    label="Email notifications" 
                    isChecked={preferences.emailNotifications} 
                    onToggle={() => handleToggle('emailNotifications')} 
                />
                <ToggleSwitch 
                    label="Desktop push notifications" 
                    isChecked={preferences.desktopPush} 
                    onToggle={() => handleToggle('desktopPush')} 
                />
                <ToggleSwitch 
                    label="Activity digest emails" 
                    isChecked={preferences.activityDigest} 
                    onToggle={() => handleToggle('activityDigest')} 
                />
                <ToggleSwitch 
                    label="Show file previews in list" 
                    isChecked={preferences.showPreviews} 
                    onToggle={() => handleToggle('showPreviews')} 
                />
            </div>

            <button onClick={handleSave} className="bg-[#57534E] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#44403C] transition flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                Save Preferences
            </button>
        </div>
    );
};

export default PreferencesTab;