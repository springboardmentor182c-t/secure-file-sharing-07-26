import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSharedFiles } from '../services/sharedWithMeService';

export function useSharedFiles() {
  const mounted = useRef(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (mounted.current) { setIsLoading(true); setError(null); }
    try {
      const next = await fetchSharedFiles();
      if (mounted.current) setData(next);
    } catch (requestError) {
      if (mounted.current) setError(requestError);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, error, isLoading, refetch };
}
