import api from '../../../utils/api';

/**
 * login – Authenticate user and store JWT tokens.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise} resolves with response data containing access_token and refresh_token
 */
export function login(email, password) {
  return api.post('/api/auth/login', { email, password })
    .then((response) => {
      const { access_token, refresh_token } = response.data;
      if (access_token) localStorage.setItem('access_token', access_token);
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
      return response.data;
    });
}
