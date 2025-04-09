'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import TeamNominationForm from '@/components/forms/TeamNominationForm';
import AnimatedGradient from '@/components/ui/AnimatedGradient';
import AnimatedTextGradient from '@/components/ui/AnimatedTextGradient';

export default function About() {
  const [isNominationModalOpen, setIsNominationModalOpen] = useState(false);

  const openNominationModal = () => {
    setIsNominationModalOpen(true);
  };

  const closeNominationModal = () => {
    setIsNominationModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Team Nomination Modal */}
      <TeamNominationForm isOpen={isNominationModalOpen} onClose={closeNominationModal} />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <AnimatedTextGradient>About AIToolKit.space</AnimatedTextGradient>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mt-6">
              We help you navigate the rapidly evolving world of AI tools and solutions
            </p>
        </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
          >
            <AnimatedGradient className="w-full py-16 md:py-20">
              <div className="flex items-center justify-center h-full">
                <div className="text-white max-w-2xl px-6">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-shadow-lg">Curating the Best AI Tools Since 2023</h2>
                  <p className="text-lg md:text-xl text-center text-shadow-lg">
                    In a world where new AI tools emerge daily, we're your trusted guide to finding the ones that truly matter.
                  </p>
                </div>
              </div>
            </AnimatedGradient>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <AnimatedTextGradient>Our Mission</AnimatedTextGradient>
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              AIToolKit.space is dedicated to simplifying the complex landscape of AI tools by providing a comprehensive, user-friendly directory where professionals can discover the perfect solutions for their specific needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {missionPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="h-2 bg-blue-600"></div>
                <div className="p-8">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                    {point.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
                  <p className="text-gray-600">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <AnimatedTextGradient>Our Values</AnimatedTextGradient>
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {values.map((value, index) => (
              <motion.div
                  key={value.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start"
                >
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Target Audience Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <AnimatedTextGradient>Who We Serve</AnimatedTextGradient>
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              Our platform is designed to support professionals across various fields who want to leverage the power of AI in their work.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {audiences.map((audience, index) => (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto text-2xl">
                  {audience.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{audience.title}</h3>
                <p className="text-gray-600">{audience.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <AnimatedTextGradient>Our Team</AnimatedTextGradient>
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              Meet the passionate individuals behind AIToolKit.space who are committed to helping you discover the perfect AI tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl overflow-hidden shadow-lg text-center group ${member.isCallToAction ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
                onClick={member.isCallToAction ? openNominationModal : undefined}
              >
                <div className={`aspect-square w-full relative ${member.isCallToAction ? 'bg-gradient-to-b from-blue-200 to-white' : 'bg-gradient-to-b from-blue-100 to-white'} overflow-hidden`}>
                  <div className={`absolute inset-0 flex items-center justify-center ${member.isCallToAction ? 'text-blue-600' : 'text-blue-600 text-opacity-20'} group-hover:scale-110 transition-transform duration-500`}>
                    <span className="text-[120px] font-bold">{member.initials}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 mb-4">{member.role}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex justify-center space-x-4">
                    {member.isCallToAction ? (
                      <button 
                        onClick={openNominationModal}
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Submit Nomination
                      </button>
                    ) : (
                      member.links.map((link, i) => (
                        <a 
                          key={i}
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          {link.icon}
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <AnimatedGradient className="w-full py-16 md:py-20">
            <div className="flex items-center justify-center h-full">
              <div className="text-white max-w-2xl px-6">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-shadow-lg">Ready to Discover the Best AI Tools?</h2>
                <p className="text-xl mb-8 text-center text-shadow-lg">
                  Explore our curated collection of AI tools and find the perfect solutions to enhance your workflow.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/tools" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
                    Explore Tools
                  </Link>
                  <Link href="/contact" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-colors">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedGradient>
        </div>
      </section>
    </div>
  );
}

const missionPoints = [
  {
    title: 'Curate Excellence',
    description: 'We carefully review and select only the most valuable and effective AI tools available, saving you time and ensuring quality.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  },
  {
    title: 'Connect & Educate',
    description: 'We bridge the gap between tool creators and users, while providing context and insights to help you make informed decisions.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    title: 'Simplify Discovery',
    description: 'We organize AI tools in an intuitive way, making it easy to find exactly what you need for your specific use case.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  },
];

const values = [
  {
    title: 'Quality Over Quantity',
    description: 'We focus on listing tools that truly deliver value rather than attempting to catalog every AI solution available.',
  },
  {
    title: 'User-Centric Approach',
    description: 'Every feature and decision is made with our users in mind, ensuring an intuitive and helpful experience.',
  },
  {
    title: 'Continuous Improvement',
    description: 'We regularly update our directory and refine our platform based on user feedback and emerging trends.',
  },
  {
    title: 'Transparency',
    description: 'We provide clear, unbiased information about each AI tool, including limitations and ideal use cases.',
  },
  {
    title: 'Accessibility',
    description: 'We strive to make information about AI tools accessible to everyone, regardless of technical expertise.',
  },
  {
    title: 'Innovation Focus',
    description: 'We stay ahead of AI trends to bring you the latest and most effective tools that drive meaningful innovation.',
  },
];

const audiences = [
  {
    title: 'Developers & Engineers',
    description: 'Accelerate your development workflow with AI-powered coding assistants, testing tools, and automation solutions.',
    icon: '👩‍💻',
  },
  {
    title: 'Marketers & Content Creators',
    description: 'Enhance your content strategy with AI tools for writing, SEO optimization, image generation, and campaign analysis.',
    icon: '📱',
  },
  {
    title: 'Researchers & Analysts',
    description: 'Leverage AI for data analysis, literature review, experiment design, and research acceleration.',
    icon: '🔬',
  },
  {
    title: 'Business Professionals',
    description: 'Improve productivity and decision-making with AI tools for automation, insights, and business intelligence.',
    icon: '💼',
  },
];

// Replace with real team data when available
const teamMembers = [
  {
    name: 'Saurabh Thakur',
    role: 'Founder & CEO',
    bio: 'AI enthusiast with a passion for making advanced technology accessible to everyone.',
    initials: 'ST',
    links: [
      { icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>, url: '#' },
      { icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/></svg>, url: '#' },
    ],
  },
  {
    name: 'Join Our Team',
    role: 'Become a Team Member',
    bio: "We're looking for talented individuals passionate about AI. Click here to submit your application and join our mission.",
    initials: '➕',
    links: [],
    isCallToAction: true,
  },
]; 