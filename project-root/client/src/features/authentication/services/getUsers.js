import api from '../../../utils/api';

/**
 * getUsers — fetches list of users from the API
 * @param {string} token - Auth token
 * @returns {Promise<Array>} List of users
 */
export const getUsers = async (token) => {
  const response = await api.get('/api/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
