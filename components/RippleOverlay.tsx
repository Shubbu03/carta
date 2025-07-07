"use client";

import React, { useEffect } from 'react';

interface RippleOverlayProps {
  isVisible: boolean;
  centerX: number;
  centerY: number;
  targetTheme?: string;
}

export default function RippleOverlay({ 
  isVisible, 
  centerX, 
  centerY, 
  targetTheme 
}: RippleOverlayProps) {
  const rippleId = `ripple-${Date.now()}`;

  useEffect(() => {
    if (!isVisible) return;

    const maxRadius = Math.sqrt(
      Math.pow(Math.max(centerX, window.innerWidth - centerX), 2) +
      Math.pow(Math.max(centerY, window.innerHeight - centerY), 2)
    ) + 100;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes ${rippleId} {
        0% {
          width: 0;
          height: 0;
          opacity: 0;
        }
        10% {
          opacity: 0.8;
        }
        50% {
          opacity: 0.9;
        }
        100% {
          width: ${maxRadius * 2}px;
          height: ${maxRadius * 2}px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isVisible, centerX, centerY, rippleId]);

  if (!isVisible) return null;

  const rippleColor = targetTheme === 'dark' ? '#0a0a0a' : '#ffffff';

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: centerX,
          top: centerY,
          width: 0,
          height: 0,
          backgroundColor: rippleColor,
          transform: 'translate(-50%, -50%)',
          animation: `${rippleId} 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards`
        }}
      />
    </div>
  );
} 