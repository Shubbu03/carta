import { useState, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';

interface RippleState {
  isAnimating: boolean;
  centerX: number;
  centerY: number;
  targetTheme: string | undefined;
}

export function useRippleTransition() {
  const { theme, setTheme } = useTheme();
  const [rippleState, setRippleState] = useState<RippleState>({
    isAnimating: false,
    centerX: 0,
    centerY: 0,
    targetTheme: undefined
  });

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRippleTransition = useCallback((
    event: React.MouseEvent,
    newTheme: string
  ) => {
    const rect = (event.target as Element).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setRippleState({
      isAnimating: true,
      centerX,
      centerY,
      targetTheme: newTheme
    });

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      setTheme(newTheme);
    }, 400); 

    cleanupTimeoutRef.current = setTimeout(() => {
      setRippleState(prev => ({
        ...prev,
        isAnimating: false
      }));
    }, 800); 
  }, [setTheme]);

  const cleanup = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
  }, []);

  return {
    rippleState,
    startRippleTransition,
    cleanup,
    currentTheme: theme
  };
} 