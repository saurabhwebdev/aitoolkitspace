'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function NotFound() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.h1 
          className="text-9xl font-bold text-blue-600"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          404
        </motion.h1>
        
        <div className="h-2 w-16 bg-blue-600 mx-auto my-4 rounded-full" />
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-4">
          This page is as lost as my keys on a Monday morning.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Don't worry, even the best explorers get lost sometimes!
        </p>
        
        <Link href="/" passHref>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isHovered ? "Take me home, country roads!" : "Back to Home"}
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
} 