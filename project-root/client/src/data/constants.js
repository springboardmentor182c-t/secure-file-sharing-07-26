// Application-wide constants

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_URL)) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_URL)) ||
  'http://localhost:8000';

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
