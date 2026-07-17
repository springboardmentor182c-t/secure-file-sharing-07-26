import { LOCAL_STORAGE_KEYS } from '../../../data/constants';
import api from '../../../utils/api';

/**
 * login — authenticates a user and stores the token
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{access_token: string, user: object}>}
 */
export const login = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password });

  // Persist token and user to localStorage
  localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, data.access_token);
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(data.user));

  return data;
};
