import api from '../../../utils/api';

/**
 * signup — registers a new user
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<{access_token: string, user: object}>}
 */
export const signup = async ({ name, email, password }) => {
  const { data } = await api.post('/api/auth/signup', { name, email, password });
  return data;
};
