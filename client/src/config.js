// =====================================================
// TrustShare Frontend Configuration
// =====================================================

// API Configuration
const readApiBaseUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
  return configuredUrl?.trim() || "";
};

export const API_URL = readApiBaseUrl();

// User Configuration
// TODO: Replace with proper authentication context
// This is a temporary solution for development
export const OWNER_ID = process.env.REACT_APP_OWNER_ID?.trim() || "";

// File Upload Configuration
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_FILE_TYPES = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 
  'txt', 'csv', 'zip', 'rar', 'png', 'jpg', 'jpeg', 'gif'
];
