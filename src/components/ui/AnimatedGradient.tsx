'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedGradientProps {
  children: React.ReactNode;
  className?: string;
}

// Define the keyframe animation directly
const keyframes = `
@keyframes gradientAnimation {
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

@keyframes pulseAnimation {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.9;
  }
}
`;

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ children, className = '' }) => {
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
  const primaryGradientStyle = prefersReducedMotion
    ? { backgroundSize: '100%', backgroundPosition: '0 0' }
    : {
        backgroundSize: '300% 300%',
        animation: 'gradientAnimation 8s ease infinite',
        WebkitAnimation: 'gradientAnimation 8s ease infinite',
        MozAnimation: 'gradientAnimation 8s ease infinite'
      };

  const secondaryGradientStyle = prefersReducedMotion
    ? { backgroundSize: '100%', backgroundPosition: '0 0' }
    : {
        backgroundSize: '300% 300%',
        animation: 'gradientAnimation 12s ease infinite alternate',
        WebkitAnimation: 'gradientAnimation 12s ease infinite alternate',
        MozAnimation: 'gradientAnimation 12s ease infinite alternate'
      };

  const pulseStyle = prefersReducedMotion
    ? { opacity: 0.8 }
    : {
        animation: 'pulseAnimation 4s ease-in-out infinite',
        WebkitAnimation: 'pulseAnimation 4s ease-in-out infinite',
        MozAnimation: 'pulseAnimation 4s ease-in-out infinite'
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(120,80,255,0.6)] ${className}`}
    >
      {/* Base color to ensure there's always a visible background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-blue-700 to-pink-700"></div>
      
      {/* Primary animated gradient - vibrant colors */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#ff00cc] via-[#3333ff] via-[#00ffff] to-[#ff9966]"
        style={primaryGradientStyle}
      ></div>
      
      {/* Secondary animated gradient with different timing for depth effect */}
      <div 
        className="absolute inset-0 opacity-80 bg-gradient-to-br from-[#ff4500] via-[#9400d3] to-[#00bfff]"
        style={secondaryGradientStyle}
      ></div>
      
      {/* Third animated gradient layer for more depth */}
      <div 
        className="absolute inset-0 opacity-60 bg-gradient-to-tr from-[#ffcc00] via-[#cc00ff] to-[#00ccff]"
        style={{
          ...secondaryGradientStyle,
          animationDelay: '-3s',
          WebkitAnimationDelay: '-3s',
          MozAnimationDelay: '-3s'
        }}
      ></div>
      
      {/* Light streaks overlay */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)] mix-blend-overlay"
        style={pulseStyle}
      ></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedGradient; 