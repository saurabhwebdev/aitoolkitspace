'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About AIToolKit.space</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted directory for discovering and evaluating AI tools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              AIToolKit.space is dedicated to helping professionals, creators, and businesses discover 
              and evaluate the best AI tools for their needs. We curate and organize AI tools across 
              various categories, making it easier to find the right solution.
            </p>
            <p className="text-gray-600">
              Through our platform, we aim to accelerate AI adoption by providing a trusted, 
              SEO-optimized directory that connects users with innovative AI solutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
            <ul className="space-y-4">
              {values.map((value, index) => (
                <motion.li
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-start"
                >
                  <span className="text-blue-600 mr-2">•</span>
                  <div>
                    <h3 className="font-semibold">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Target Audience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Who We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {audiences.map((audience, index) => (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  {audience.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{audience.title}</h3>
                <p className="text-gray-600">{audience.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const values = [
  {
    title: 'Quality First',
    description: 'We carefully curate and verify each AI tool to ensure it meets our high standards.',
  },
  {
    title: 'User Focus',
    description: 'We prioritize user experience and make it easy to find the right AI tools.',
  },
  {
    title: 'Innovation',
    description: 'We stay ahead of AI trends to bring you the latest and most effective tools.',
  },
  {
    title: 'Transparency',
    description: 'We provide clear, unbiased information about each AI tool we list.',
  },
];

const audiences = [
  {
    title: 'Developers & Creators',
    description: 'Find AI tools to enhance your development workflow and creative projects.',
    icon: '👩‍💻',
  },
  {
    title: 'Marketers',
    description: 'Discover AI solutions for content creation, analytics, and campaign optimization.',
    icon: '📊',
  },
  {
    title: 'Researchers',
    description: 'Access cutting-edge AI tools for research and experimentation.',
    icon: '🔬',
  },
  {
    title: 'Businesses',
    description: 'Explore AI integrations to improve productivity and innovation.',
    icon: '🏢',
  },
]; 