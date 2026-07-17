import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * useFetch — generic data fetching hook
 * @param {string} endpoint - API endpoint (relative to base URL)
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {{ data, loading, error, refetch }}
 */
const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.request({
        url: endpoint,
        ...options,
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
