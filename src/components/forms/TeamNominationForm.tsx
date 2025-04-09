'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FormData {
  name: string;
  email: string;
  portfolio: string;
  experience: string;
  reason: string;
}

interface TeamNominationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamNominationForm({ isOpen, onClose }: TeamNominationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    portfolio: '',
    experience: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.reason) {
        throw new Error('Please fill in all required fields');
      }

      // Submit to Firebase
      await addDoc(collection(db, 'team_nominations'), {
        ...formData,
        status: 'PENDING',
        submittedAt: serverTimestamp(),
      });

      // Show success message
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          name: '',
          email: '',
          portfolio: '',
          experience: '',
          reason: '',
        });
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      console.error('Error submitting nomination:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Join Our Team</h3>
            <p className="text-gray-600 mt-2">
              Submit your nomination to be considered for a role at AIToolKit.space
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">Your nomination has been submitted successfully!</p>
              <p className="text-sm">We'll review your application and get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio/LinkedIn URL
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Experience
                </label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your relevant skills and experience"
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Why You'd Like to Join <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us why you're interested in joining AIToolKit.space"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Nomination'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 