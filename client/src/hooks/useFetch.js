import { useState, useEffect, useCallback } from "react";

export function useFetch(fetchFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchFn()
      .then((result) => setData(result))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [fetchFn]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}