-- =====================================================
-- TrustShare Database Schema
-- PostgreSQL
-- Part 1 - Authentication & Profile
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ROLES
-- =====================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PERMISSIONS
-- =====================================================

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ROLE PERMISSIONS
-- =====================================================

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY(role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY(permission_id)
        REFERENCES permissions(id)
        ON DELETE CASCADE,

    UNIQUE(role_id, permission_id)
);

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_id UUID,

    username VARCHAR(50) UNIQUE NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    account_status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(account_status IN
        ('ACTIVE','INACTIVE','SUSPENDED')),

    email_verified BOOLEAN DEFAULT FALSE,

    last_login TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY(role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL
);

-- =====================================================
-- USER PROFILES
-- =====================================================

CREATE TABLE user_profiles (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL,

    first_name VARCHAR(100),

    last_name VARCHAR(100),

    phone_number VARCHAR(20),

    profile_photo TEXT,

    bio TEXT,

    date_of_birth DATE,

    address TEXT,

    city VARCHAR(100),

    state VARCHAR(100),

    country VARCHAR(100),

    postal_code VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- USER SESSIONS
-- =====================================================

CREATE TABLE user_sessions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    refresh_token TEXT NOT NULL,

    ip_address VARCHAR(50),

    user_agent TEXT,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- OAUTH ACCOUNTS
-- =====================================================

CREATE TABLE oauth_accounts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    provider VARCHAR(50) NOT NULL,

    provider_user_id VARCHAR(255) NOT NULL,

    access_token TEXT,

    refresh_token TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_oauth_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- PASSWORD RESET TOKENS
-- =====================================================

CREATE TABLE password_reset_tokens (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMP NOT NULL,

    is_used BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reset_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- MFA CODES
-- =====================================================

CREATE TABLE mfa_codes (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    otp_code VARCHAR(10) NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mfa_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_username
ON users(username);

CREATE INDEX idx_user_profiles_user
ON user_profiles(user_id);

CREATE INDEX idx_sessions_user
ON user_sessions(user_id);

CREATE INDEX idx_oauth_user
ON oauth_accounts(user_id);

CREATE INDEX idx_reset_user
ON password_reset_tokens(user_id);

CREATE INDEX idx_mfa_user
ON mfa_codes(user_id);
-- =====================================================
-- PART 2 - FILE MANAGEMENT
-- =====================================================

-- =====================================================
-- FILE CATEGORIES
-- =====================================================

CREATE TABLE file_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FOLDERS
-- =====================================================

CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_id UUID NOT NULL,

    parent_folder_id UUID,

    folder_name VARCHAR(255) NOT NULL,

    description TEXT,

    is_deleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_folder_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_parent_folder
        FOREIGN KEY(parent_folder_id)
        REFERENCES folders(id)
        ON DELETE CASCADE
);

-- =====================================================
-- FILES
-- =====================================================

CREATE TABLE files (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_id UUID NOT NULL,

    folder_id UUID,

    category_id UUID,

    file_name VARCHAR(255) NOT NULL,

    original_name VARCHAR(255) NOT NULL,

    file_extension VARCHAR(20),

    mime_type VARCHAR(100),

    file_size BIGINT NOT NULL,

    storage_path TEXT NOT NULL,

    encrypted_path TEXT,

    checksum VARCHAR(255),

    description TEXT,

    is_deleted BOOLEAN DEFAULT FALSE,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_file_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_file_folder
        FOREIGN KEY(folder_id)
        REFERENCES folders(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_file_category
        FOREIGN KEY(category_id)
        REFERENCES file_categories(id)
        ON DELETE SET NULL
);

-- =====================================================
-- FILE VERSIONS
-- =====================================================

CREATE TABLE file_versions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    file_id UUID NOT NULL,

    version_number INTEGER NOT NULL,

    storage_path TEXT NOT NULL,

    encrypted_path TEXT,

    checksum VARCHAR(255),

    uploaded_by UUID NOT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_version_file
        FOREIGN KEY(file_id)
        REFERENCES files(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_version_user
        FOREIGN KEY(uploaded_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- FILE TAGS
-- =====================================================

CREATE TABLE file_tags (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tag_name VARCHAR(100) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FILE TAG MAPPING
-- =====================================================

CREATE TABLE file_tag_mapping (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    file_id UUID NOT NULL,

    tag_id UUID NOT NULL,

    CONSTRAINT fk_mapping_file
        FOREIGN KEY(file_id)
        REFERENCES files(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_mapping_tag
        FOREIGN KEY(tag_id)
        REFERENCES file_tags(id)
        ON DELETE CASCADE,

    UNIQUE(file_id, tag_id)
);

-- =====================================================
-- FILE COMMENTS
-- =====================================================

CREATE TABLE file_comments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    file_id UUID NOT NULL,

    user_id UUID NOT NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_file
        FOREIGN KEY(file_id)
        REFERENCES files(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- FAVORITE FILES
-- =====================================================

CREATE TABLE favorite_files (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    file_id UUID NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorite_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorite_file
        FOREIGN KEY(file_id)
        REFERENCES files(id)
        ON DELETE CASCADE,

    UNIQUE(user_id, file_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_files_owner
ON files(owner_id);

CREATE INDEX idx_files_folder
ON files(folder_id);

CREATE INDEX idx_files_category
ON files(category_id);

CREATE INDEX idx_versions_file
ON file_versions(file_id);

CREATE INDEX idx_comments_file
ON file_comments(file_id);

CREATE INDEX idx_comments_user
ON file_comments(user_id);

CREATE INDEX idx_favorites_user
ON favorite_files(user_id);

CREATE INDEX idx_folder_owner
ON folders(owner_id);
-- =====================================================
-- PART 3 - SECURE SHARING
-- =====================================================

CREATE TABLE share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    created_by UUID NOT NULL,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('public','private')),
    password_hash TEXT,
    expires_at TIMESTAMP,
    max_downloads INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE share_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_link_id UUID NOT NULL,
    user_id UUID NOT NULL,
    can_view BOOLEAN DEFAULT TRUE,
    can_download BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_share BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (share_link_id) REFERENCES share_links(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE(share_link_id, user_id)
);

CREATE TABLE share_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_link_id UUID NOT NULL,
    invited_email VARCHAR(255) NOT NULL,
    invited_user_id UUID,
    invitation_status VARCHAR(20) DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,

    FOREIGN KEY (share_link_id) REFERENCES share_links(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE share_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_link_id UUID NOT NULL,
    user_id UUID,
    ip_address VARCHAR(45),
    device_info TEXT,
    action VARCHAR(20),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (share_link_id) REFERENCES share_links(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE folder_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL,
    shared_by UUID NOT NULL,
    shared_with UUID NOT NULL,
    permission_level VARCHAR(20) DEFAULT 'view',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    FOREIGN KEY(shared_by) REFERENCES users(id),
    FOREIGN KEY(shared_with) REFERENCES users(id)
);

-- =====================================================
-- ENCRYPTION & SECURITY
-- =====================================================

CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    key_identifier VARCHAR(255) UNIQUE,
    encryption_algorithm VARCHAR(50) DEFAULT 'AES-256',
    key_version INTEGER DEFAULT 1,
    encrypted_key TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE key_rotation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encryption_key_id UUID NOT NULL,
    old_key_version INTEGER,
    new_key_version INTEGER,
    rotated_by UUID,
    rotation_reason TEXT,
    rotated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(encryption_key_id) REFERENCES encryption_keys(id),
    FOREIGN KEY(rotated_by) REFERENCES users(id)
);

CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    file_id UUID,
    event_type VARCHAR(100),
    severity VARCHAR(20),
    description TEXT,
    ip_address VARCHAR(45),
    device_info TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(file_id) REFERENCES files(id)
);

CREATE INDEX idx_share_links_file ON share_links(file_id);
CREATE INDEX idx_share_permissions_user ON share_permissions(user_id);
CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_file ON security_events(file_id);
-- =====================================================
-- PART 4 - ACTIVITY MONITOR
-- =====================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    file_id UUID,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50),
    description TEXT,
    ip_address VARCHAR(45),
    device_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE SET NULL
);

CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    login_status VARCHAR(20),
    ip_address VARCHAR(45),
    device_info TEXT,
    location VARCHAR(255),

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE file_access_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    user_id UUID NOT NULL,
    access_type VARCHAR(30),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),

    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performed_by UUID,
    entity_name VARCHAR(100),
    entity_id UUID,
    action VARCHAR(50),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(performed_by) REFERENCES users(id)
);

CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    search_query TEXT NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255),
    message TEXT,
    notification_type VARCHAR(50),
    related_entity VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    file_share_notifications BOOLEAN DEFAULT TRUE,
    download_notifications BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- ANALYTICS
-- =====================================================

CREATE TABLE user_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    total_storage BIGINT DEFAULT 0,
    used_storage BIGINT DEFAULT 0,
    remaining_storage BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50),
    report_date DATE,
    total_uploads INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ADMIN
-- =====================================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(updated_by) REFERENCES users(id)
);

-- =====================================================
-- FINAL INDEXES
-- =====================================================

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_file ON activity_logs(file_id);

CREATE INDEX idx_login_user ON login_history(user_id);

CREATE INDEX idx_access_file ON file_access_history(file_id);
CREATE INDEX idx_access_user ON file_access_history(user_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE INDEX idx_storage_user ON user_storage(user_id);

-- =====================================================
-- END OF TRUSTSHARE DATABASE SCHEMA
-- =====================================================
