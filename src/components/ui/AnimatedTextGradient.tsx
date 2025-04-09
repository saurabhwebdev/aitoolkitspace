'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextGradientProps {
  children: React.ReactNode;
  className?: string;
}

// Define the keyframe animation directly
const keyframes = `
@keyframes textGradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
`;

const AnimatedTextGradient: React.FC<AnimatedTextGradientProps> = ({ children, className = '' }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Add listener to update state if preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    // Add keyframes to document
    const styleElement = document.createElement('style');
    styleElement.innerHTML = keyframes;
    document.head.appendChild(styleElement);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      document.head.removeChild(styleElement);
    };
  }, []);

  // Define animation styles based on motion preference
  const gradientTextStyle = prefersReducedMotion
    ? {} 
    : {
        backgroundSize: '300% 300%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        animation: 'textGradientAnimation 8s ease infinite',
        WebkitAnimation: 'textGradientAnimation 8s ease infinite',
        MozAnimation: 'textGradientAnimation 8s ease infinite',
        backgroundImage: 'linear-gradient(90deg, #ff00cc, #3333ff, #00ffff, #ff9966)',
        color: 'transparent'
      };

  return (
    <span
      className={`inline-block font-bold ${className}`}
      style={gradientTextStyle}
    >
      {children}
    </span>
  );
};

export default AnimatedTextGradient; 