import api from '../../../utils/api';

/**
 * signup – Register a new user.
 *
 * @param {Object} data - { name, email, password }
 * @returns {Promise} resolves with created user data.
 */
export function signup(data) {
  return api.post('/api/auth/signup', data).then((res) => res.data);
}
