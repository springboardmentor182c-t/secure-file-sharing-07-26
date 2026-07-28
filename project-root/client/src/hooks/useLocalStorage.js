import { useState, useEffect } from 'react';

/**
 * useLocalStorage – React hook that mirrors a state value in localStorage.
 *
 * @param {string} key - storage key
 * @param {*} initialValue - initial value if nothing in storage
 * @returns {[any, function]} - value and setter function
 */
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('useLocalStorage error reading key', key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = storedValue instanceof Function ? storedValue(storedValue) : storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn('useLocalStorage error saving key', key, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
