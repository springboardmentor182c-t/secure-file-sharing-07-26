// Application-wide constants

const configuredApiBaseUrl = process.env.REACT_APP_API_URL;

if (!configuredApiBaseUrl) {
  throw new Error('REACT_APP_API_URL must be configured before the frontend is built.');
}

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SETTINGS: '/settings',
};

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};
