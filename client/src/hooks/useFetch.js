import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * useFetch – generic data fetching hook.
 *
 * @param {string} url - endpoint (relative to API base)
 * @param {Object} options - optional config (method, body, params)
 * @param {Array} deps - dependency array to re‑fetch when changed
 * @returns {Object} { data, loading, error, refetch }
 */
export default function useFetch(url, options = {}, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const request = options.method?.toUpperCase() === 'POST'
      ? api.post(url, options.body, { params: options.params })
      : api.get(url, { params: options.params });
    request
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return { data, loading, error, refetch: fetchData };
}
