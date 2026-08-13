import { API_BASE_URL } from '../../../data/constants';

/**
 * signup — registers a new user
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<{access_token: string, user: object}>}
 */
export const signup = async ({ name, email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    let msg = 'Signup failed';
    if (Array.isArray(err.detail)) {
      msg = err.detail.map(d => d.msg || JSON.stringify(d)).join('. ');
    } else if (typeof err.detail === 'object' && err.detail !== null) {
      msg = err.detail.msg || JSON.stringify(err.detail);
    } else if (typeof err.detail === 'string') {
      msg = err.detail;
    }
    throw new Error(msg);
  }

  return response.json();
};
