// Application-wide constants

// Create React App replaces this expression at build time. Avoid guarding it
// with `typeof process`: browsers do not provide Node's `process`, which made
// deployed builds silently fall back to localhost instead of the public API.
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
