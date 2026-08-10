const readApiBaseUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
  return configuredUrl?.trim() || "";
};

export const BASE_URL = readApiBaseUrl();