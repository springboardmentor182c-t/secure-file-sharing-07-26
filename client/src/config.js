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
export const MAX_FILE_SIZE = parseInt(process.env.REACT_APP_MAX_FILE_SIZE, 10) || 100 * 1024 * 1024; // 100MB default
export const ALLOWED_FILE_TYPES = process.env.REACT_APP_ALLOWED_FILE_TYPES?.split(',') || [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
  'txt', 'csv', 'zip', 'rar', 'png', 'jpg', 'jpeg', 'gif'
];
