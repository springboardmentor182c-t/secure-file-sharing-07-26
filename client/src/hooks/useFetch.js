import { useState, useCallback } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';

export default function useFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logoutUser } = useAnalytics();

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logoutUser();
        throw new Error('Session expired. Please log in again.');
      }

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.detail || 'Request failed');
      }

      return data;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, logoutUser]);

  return { request, loading, error };
}
