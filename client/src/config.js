// =====================================================
// TrustShare Frontend Configuration
// =====================================================

// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// User Configuration
// TODO: Replace with proper authentication context
// This is a temporary solution for development
export const OWNER_ID = process.env.REACT_APP_OWNER_ID || "aafe9b9d-0109-46fd-b525-33e24d9ee9b5";

// File Upload Configuration
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_FILE_TYPES = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 
  'txt', 'csv', 'zip', 'rar', 'png', 'jpg', 'jpeg', 'gif'
];
