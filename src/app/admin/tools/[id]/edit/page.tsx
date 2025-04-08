'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getToolById, updateTool, uploadImage } from '@/lib/firebase-services';
import { Tool, ToolCategory, ToolPricing, ToolStatus } from '@/lib/models';
import { generateSlug } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { ImageUpload } from '@/components/common/ImageUpload';
import React from 'react';

interface PageParams {
  id: string;
}

export default function EditTool({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as any) as PageParams;
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [id, setId] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<Tool>>({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    imageUrl: '',
    websiteUrl: '',
    category: ToolCategory.TEXT,
    subcategory: '',
    pricing: [ToolPricing.FREE],
    tags: [],
    features: [],
    pros: [],
    cons: [],
    alternatives: [],
    affiliateLink: '',
    sponsored: false,
    status: ToolStatus.ACTIVE,
    featured: false
  });

  useEffect(() => {
    setId(resolvedParams.id);
  }, [resolvedParams.id]);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const tool = await getToolById(resolvedParams.id);
        if (tool) {
          setFormData({
            name: tool.name,
            slug: tool.slug,
            description: tool.description,
            longDescription: tool.longDescription || '',
            imageUrl: tool.imageUrl || '',
            websiteUrl: tool.websiteUrl || '',
            category: tool.category || '',
            subcategory: tool.subcategory || '',
            pricing: tool.pricing || '',
            tags: tool.tags || [],
            features: tool.features || [],
            pros: tool.pros || [],
            cons: tool.cons || [],
            alternatives: tool.alternatives || [],
            affiliateLink: tool.affiliateLink || '',
            sponsored: tool.sponsored || false,
            status: tool.status || 'DRAFT',
            featured: tool.featured || false
          });
          setImagePreview(tool.imageUrl || null);
        } else {
          setError('Tool not found');
        }
      } catch (err) {
        console.error('Error fetching tool:', err);
        setError('Failed to load tool data');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [resolvedParams.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [name]: arrayValue }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value as any);
    setFormData(prev => ({ ...prev, [name]: selectedOptions }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUploadComplete = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleImageUploadError = (error: string) => {
    setError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const toolData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name || ''),
        updatedAt: new Date()
      };

      await updateTool(resolvedParams.id, toolData as any);
      setSuccess(true);
      router.push('/admin/tools');
    } catch (err) {
      console.error('Error updating tool:', err);
      setError('Failed to update tool');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Edit Tool</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center transition-colors duration-200 rounded-lg hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm"
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 shadow-sm"
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Tool updated successfully!</span>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tool Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter tool name"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="auto-generated from name if empty"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Short Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Brief description of the tool"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Long Description
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                rows={4}
                placeholder="Detailed description of the tool and its capabilities"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">URLs & Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Website URL *
              </label>
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                required
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="affiliateLink" className="block text-sm font-medium text-gray-700 mb-1">
                Affiliate Link
              </label>
              <input
                type="url"
                id="affiliateLink"
                name="affiliateLink"
                value={formData.affiliateLink}
                onChange={handleInputChange}
                placeholder="https://example.com/affiliate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {Object.values(ToolCategory).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                placeholder="Optional subcategory"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-1">
                Pricing *
              </label>
              <select
                id="pricing"
                name="pricing"
                value={formData.pricing}
                onChange={handleMultiSelectChange}
                multiple
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {Object.values(ToolPricing).map(pricing => (
                  <option key={pricing} value={pricing}>
                    {pricing.charAt(0).toUpperCase() + pricing.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {Object.values(ToolStatus).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Details & Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags?.join(', ')}
                onChange={handleArrayInputChange}
                placeholder="Comma-separated values (e.g. AI, Chatbot, GPT)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <input
                type="text"
                id="features"
                name="features"
                value={formData.features?.join(', ')}
                onChange={handleArrayInputChange}
                placeholder="Comma-separated values (e.g. Chat, Image Generation)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="pros" className="block text-sm font-medium text-gray-700 mb-1">
                Pros
              </label>
              <input
                type="text"
                id="pros"
                name="pros"
                value={formData.pros?.join(', ')}
                onChange={handleArrayInputChange}
                placeholder="Comma-separated values (e.g. Easy to use, Fast)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="cons" className="block text-sm font-medium text-gray-700 mb-1">
                Cons
              </label>
              <input
                type="text"
                id="cons"
                name="cons"
                value={formData.cons?.join(', ')}
                onChange={handleArrayInputChange}
                placeholder="Comma-separated values (e.g. Expensive, Limited features)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="alternatives" className="block text-sm font-medium text-gray-700 mb-1">
                Alternatives
              </label>
              <input
                type="text"
                id="alternatives"
                name="alternatives"
                value={formData.alternatives?.join(', ')}
                onChange={handleArrayInputChange}
                placeholder="Comma-separated values (e.g. Tool X, Tool Y)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex flex-col space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool Image
                </label>
                <ImageUpload
                  onUploadComplete={handleImageUploadComplete}
                  onUploadError={handleImageUploadError}
                  currentImageUrl={formData.imageUrl}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 400x400px, max 5MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Display Options</h2>
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
              />
              <label htmlFor="featured" className="block text-sm text-gray-700">
                Featured Tool
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sponsored"
                name="sponsored"
                checked={formData.sponsored}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
              />
              <label htmlFor="sponsored" className="block text-sm text-gray-700">
                Sponsored
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] font-medium shadow-sm transition-all duration-200"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Update Tool'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
} 