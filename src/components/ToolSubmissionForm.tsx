'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Tool, ToolPricing, ToolStatus } from '@/lib/models';
import { submitTool } from '@/lib/firebase-services';

export default function ToolSubmissionForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    websiteUrl: '',
    category: '',
    subcategory: '',
    pricing: [] as ToolPricing[],
    tags: [] as string[],
    features: [] as string[],
    pros: [] as string[],
    cons: [] as string[],
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newTool: Partial<Tool> = {
        ...formData,
        status: ToolStatus.BETA,
        featured: false,
        viewCount: 0,
        sponsored: false,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      };

      await submitTool(newTool);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        description: '',
        longDescription: '',
        websiteUrl: '',
        category: '',
        subcategory: '',
        pricing: [],
        tags: [],
        features: [],
        pros: [],
        cons: [],
        imageUrl: '',
      });
    } catch (err) {
      console.error('Error submitting tool:', err);
      setError('Failed to submit tool. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInput = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) => {
    const values = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  if (!user) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Please sign in to submit a tool.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Submit a Tool</h2>
        {submitSuccess ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Tool submitted successfully!</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tool Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Short Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700">
                Detailed Description *
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                required
                rows={4}
                value={formData.longDescription}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                Website URL *
              </label>
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                required
                value={formData.websiteUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              >
                <option value="">Select a category</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="data">Data</option>
                <option value="productivity">Productivity</option>
                <option value="coding">Coding</option>
                <option value="research">Research</option>
                <option value="education">Education</option>
                <option value="marketing">Marketing</option>
                <option value="project management">Project Management</option>
                <option value="customer support">Customer Support</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                Subcategory
              </label>
              <input
                type="text"
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="pricing" className="block text-sm font-medium text-gray-700">
                Pricing (comma-separated) *
              </label>
              <input
                type="text"
                id="pricing"
                name="pricing"
                required
                placeholder="free, freemium, paid, subscription, enterprise"
                value={formData.pricing.join(', ')}
                onChange={(e) => handleArrayInput(e, 'pricing')}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                placeholder="AI, machine learning, automation"
                value={formData.tags.join(', ')}
                onChange={(e) => handleArrayInput(e, 'tags')}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="features" className="block text-sm font-medium text-gray-700">
                Features (comma-separated)
              </label>
              <input
                type="text"
                id="features"
                name="features"
                placeholder="Feature 1, Feature 2, Feature 3"
                value={formData.features.join(', ')}
                onChange={(e) => handleArrayInput(e, 'features')}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="pros" className="block text-sm font-medium text-gray-700">
                Pros (comma-separated)
              </label>
              <input
                type="text"
                id="pros"
                name="pros"
                placeholder="Pro 1, Pro 2, Pro 3"
                value={formData.pros.join(', ')}
                onChange={(e) => handleArrayInput(e, 'pros')}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="cons" className="block text-sm font-medium text-gray-700">
                Cons (comma-separated)
              </label>
              <input
                type="text"
                id="cons"
                name="cons"
                placeholder="Con 1, Con 2, Con 3"
                value={formData.cons.join(', ')}
                onChange={(e) => handleArrayInput(e, 'cons')}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Tool'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 