/**
 * Shared Custom Hooks
 * 
 * Reusable hooks used across the application
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Modal state management hook
 * @returns {Object} Modal state and control functions
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'create', 'edit', 'view', 'delete', etc.
  const [data, setData] = useState(null);

  const open = useCallback((newMode, newData = null) => {
    setMode(newMode);
    setData(newData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear data after a short delay to allow animations
    setTimeout(() => {
      setMode(null);
      setData(null);
    }, 100);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open(mode, data);
    }
  }, [isOpen, mode, data, open, close]);

  return {
    isOpen,
    mode,
    data,
    open,
    close,
    toggle,
  };
};

/**
 * Debounce hook for search inputs and other delayed operations
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {*} Debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
