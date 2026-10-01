import { useCallback, useEffect, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

/**
 * State that is automatically persisted to localStorage.
 *
 * Returns the value, a setter, and a storage error message (or `null`).
 * The setter accepts the same arguments as React's `setState`.
 */
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  validate?: (raw: unknown) => T | null,
): [T, (value: T | ((prev: T) => T)) => void, string | null] {
  const [value, setValue] = useState<T>(() => loadFromStorage(key, fallback, validate));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saveError = saveToStorage(key, value);
    setError(saveError);
  }, [key, value]);

  const setStoredValue = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof next === 'function' ? (next as (prev: T) => T)(prev) : next));
  }, []);

  return [value, setStoredValue, error];
}
