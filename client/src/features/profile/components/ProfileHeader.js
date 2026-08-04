import React, { useRef } from 'react';

const ProfileHeader = ({ userData, onAvatarChange }) => {
    // Reference for hidden file input
    const fileInputRef = useRef(null);

    // Fallback logic in case data takes time to load or is missing
    const initials = userData?.firstName && userData?.lastName 
        ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}` 
        : 'U'; // Default 'U' for User

    const handleButtonClick = () => {
        // Trigger click on hidden file input
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Call parent function or handle upload logic here
            if (onAvatarChange) {
                onAvatarChange(file);
            } else {
                console.log("Selected file:", file);
                alert("Photo selected! You can hook this up to your backend upload API.");
            }
        }
    };

    return (
        <div className="flex items-center justify-between p-6 bg-stone-50 rounded-xl border border-stone-100 mb-8">
            <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-[#57534E] text-white rounded-full flex items-center justify-center text-xl font-bold uppercase overflow-hidden">
                    {userData?.avatarUrl ? (
                        <img src={userData.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {userData?.firstName || ''} {userData?.lastName || ''}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {userData?.role || ''} {userData?.role ? '·' : ''} VaultShare Enterprise
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-xs">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">
                            {userData?.status || 'Inactive'}
                        </span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md font-medium">
                            {userData?.role || 'User'}
                        </span>
                        <span className="text-gray-400 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Member since {userData?.joinDate || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
            />

            {/* Edit Photo Button */}
            <button 
                onClick={handleButtonClick}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Edit Photo
            </button>
        </div>
    );
};

export default ProfileHeader;