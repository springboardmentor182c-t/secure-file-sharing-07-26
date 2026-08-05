import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is imported
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoTab from './components/PersonalInfoTab';
import PasswordTab from './components/PasswordTab';
import TwoFactorTab from './components/TwoFactorTab';
import PreferencesTab from './components/PreferencesTab';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        status: '',
        joinDate: '',
        phone: '',
        department: '',
        location: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
                // Fetching from your secure backend endpoint we created
                const response = await axios.get(`${baseUrl}/api/v1/users/me`);
                
                setUserData({
                    firstName: response.data.first_name || '',
                    lastName: response.data.last_name || '',
                    email: response.data.email || '',
                    role: response.data.role || '',
                    status: response.data.status || '',
                    joinDate: response.data.join_date || '',
                    phone: response.data.phone_number || '',
                    department: response.data.department || '',
                    location: response.data.location || ''
                });
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const tabs = [
        { id: 'personal', label: 'Personal Info' },
        { id: 'password', label: 'Password' },
        { id: '2fa', label: 'Two-Factor Auth' },
        { id: 'preferences', label: 'Preferences' }
    ];

    if (loading) {
        return <div className="p-6 text-gray-500">Loading profile data...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <ProfileHeader userData={userData} />

            <div className="flex space-x-8 border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 text-sm font-medium transition-colors duration-200 ${
                            activeTab === tab.id
                                ? 'text-[#57534E] border-b-2 border-[#57534E]'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                {activeTab === 'personal' && <PersonalInfoTab userData={userData} />}
                {activeTab === 'password' && <PasswordTab />}
                {activeTab === '2fa' && <TwoFactorTab />}
                {activeTab === 'preferences' && <PreferencesTab />}
            </div>
        </div>
    );
};

export default Profile;