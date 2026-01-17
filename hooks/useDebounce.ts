import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value - only updates after delay with no changes
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounce a callback function
 */
export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedCallback, cancel];
};

/**
 * Hook to manage abort controller for cancelling pending requests
 */
export const useAbortController = (): [AbortSignal | undefined, () => void, () => void] => {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, []);

  const getNewSignal = useCallback(() => {
    // Abort any existing request
    abort();
    // Create new controller
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, [abort]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return [controllerRef.current?.signal, getNewSignal, abort];
};

/**
 * Hook to prevent double-clicks by disabling for a period after click
 */
export const usePreventDoubleClick = (
  onClick: () => void,
  lockDurationMs: number = 500
): [() => void, boolean] => {
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    if (isLocked) return;

    setIsLocked(true);
    onClick();

    timeoutRef.current = setTimeout(() => {
      setIsLocked(false);
    }, lockDurationMs);
  }, [isLocked, onClick, lockDurationMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [handleClick, isLocked];
};
