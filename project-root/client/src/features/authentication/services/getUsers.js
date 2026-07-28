import api from '../../../utils/api';

/**
 * getUsers – Retrieves all users (admin endpoint).
 * Returns a promise resolving to an array of user objects.
 */
export function getUsers(params = {}) {
  return api.get('/api/admin/users', { params });
}
