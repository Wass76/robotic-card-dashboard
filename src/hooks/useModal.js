import { useState, useCallback } from 'react';
import { MODAL_MODES } from '../constants';

export const useModal = (initialMode = null) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [data, setData] = useState(null);

  const open = useCallback((newMode = null, newData = null) => {
    setMode(newMode || initialMode);
    setData(newData);
    setIsOpen(true);
  }, [initialMode]);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation (optional delay)
    setTimeout(() => {
      setData(null);
      setMode(initialMode);
    }, 300);
  }, [initialMode]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    mode,
    data,
    open,
    close,
    toggle,
    setMode,
    setData,
  };
};

