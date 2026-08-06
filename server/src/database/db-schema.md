Enable UUID Support
---------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
------------------------------------------
Users
----------------------------------
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    profile_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    storage_limit BIGINT DEFAULT 5368709120,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
------------------------------------
User Profiles
-----------------------------------------
CREATE TABLE user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(100),
    job_title VARCHAR(100),
    bio TEXT,
    timezone VARCHAR(50),
    country VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
----------------------------------
User Settings
--------------------------------------
CREATE TABLE user_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,

    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    two_factor_auth BOOLEAN DEFAULT FALSE,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
----------------------------------
Authentication Sessions
----------------------------------
CREATE TABLE auth_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
-----------------------------------
Password Reset Tokens
-----------------------------------
CREATE TABLE password_reset_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    reset_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
--------------------------------------
OTP Verification
----------------------------------------
CREATE TABLE otp_verifications (
    otp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
-----------------------------------
Login History
-------------------------------------
CREATE TABLE login_history (
    login_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    device_info TEXT,
    login_status VARCHAR(20),

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
--------------------------------------------------
Folders
--------------------------------------------------
CREATE TABLE folders (
    folder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    folder_name VARCHAR(100) NOT NULL,
    parent_folder UUID,

    FOREIGN KEY (owner_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

    FOREIGN KEY (parent_folder)
    REFERENCES folders(folder_id)
);
------------------------------------------
Files
------------------------------------------
CREATE TABLE files (
    file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    folder_id UUID,

    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    storage_path TEXT NOT NULL,

    encrypted BOOLEAN DEFAULT TRUE,

    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

    FOREIGN KEY (folder_id)
    REFERENCES folders(folder_id)
    ON DELETE SET NULL
);
-------------------------------------
File Sharing
-------------------------------
CREATE TABLE file_shares (
    share_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    file_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    shared_with UUID,

    share_link TEXT UNIQUE,
    access_type VARCHAR(20),

    expiry_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (file_id)
    REFERENCES files(file_id)
    ON DELETE CASCADE,

    FOREIGN KEY (owner_id)
    REFERENCES users(user_id),

    FOREIGN KEY (shared_with)
    REFERENCES users(user_id)
);
------------------------------------
Encryption Keys
----------------------------------------
CREATE TABLE encryption_keys (
    key_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    file_id UUID UNIQUE NOT NULL,

    encryption_algorithm VARCHAR(50),
    key_reference TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (file_id)
    REFERENCES files(file_id)
    ON DELETE CASCADE
);
--------------------------------------
Permissions
---------------------------------------
CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    file_id UUID NOT NULL,
    user_id UUID NOT NULL,

    permission_type VARCHAR(20),

    FOREIGN KEY (file_id)
    REFERENCES files(file_id)
    ON DELETE CASCADE,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
---------------------------------------
Activity Logs
------------------------------------------
CREATE TABLE activity_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    file_id UUID,

    activity VARCHAR(100),
    ip_address VARCHAR(50),

    activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id),

    FOREIGN KEY (file_id)
    REFERENCES files(file_id)
);
--------------------------------------
Notifications
-------------------------------------
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    title VARCHAR(255),
    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);
----------------------------------------
Analytics
---------------------------------
CREATE TABLE analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    total_storage BIGINT DEFAULT 0,
    total_files INT DEFAULT 0,
    active_shares INT DEFAULT 0,
    security_score INT DEFAULT 100,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);
----------------------------------------
Admin Actions
-----------------------------------------
CREATE TABLE admin_actions (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    admin_id UUID NOT NULL,

    action_name VARCHAR(100),
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_id)
    REFERENCES users(user_id)
);
----------------------------------------
Dashboard Summary View
----------------------------------------
CREATE VIEW dashboard_summary AS
SELECT
    u.user_id,
    u.full_name,

    COUNT(DISTINCT f.file_id) AS total_files,

    COALESCE(SUM(f.file_size),0) AS storage_used,

    COUNT(DISTINCT fs.share_id) AS active_shares

FROM users u

LEFT JOIN files f
ON u.user_id = f.owner_id

LEFT JOIN file_shares fs
ON f.file_id = fs.file_id

GROUP BY u.user_id, u.full_name;