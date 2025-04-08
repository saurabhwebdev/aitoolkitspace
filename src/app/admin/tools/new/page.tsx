'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createTool, uploadImage } from '@/lib/firebase-services';
import { Tool, ToolCategory, ToolPricing, ToolStatus } from '@/lib/models';
import { ImageUpload } from '@/components/common/ImageUpload';
import * as XLSX from 'xlsx';

export default function NewTool() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{current: number, total: number} | null>(null);
  const [importResults, setImportResults] = useState<{success: number, failed: number} | null>(null);
  
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
    setLoading(true);
    setError(null);
    
    try {
      // Create the tool - no need to handle image upload separately
      // as it's handled by the ImageUpload component
      const toolData = {
        ...formData,
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        tags: formData.tags || [],
        features: formData.features || [],
        pros: formData.pros || [],
        cons: formData.cons || [],
        alternatives: formData.alternatives || [],
        pricing: formData.pricing || [ToolPricing.FREE]
      };
      
      await createTool(toolData as any);
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/tools');
      }, 1500);
    } catch (err) {
      console.error('Error creating tool:', err);
      setError('Failed to create tool. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to download the Excel template
  const downloadExcelTemplate = () => {
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Create a worksheet with headers
    const headers = [
      'name', 'slug', 'description', 'longDescription', 'imageUrl', 'websiteUrl', 
      'category', 'subcategory', 'pricing', 'tags', 'features', 'pros', 'cons', 
      'alternatives', 'affiliateLink', 'sponsored', 'status', 'featured'
    ];
    
    // Add sample data
    const sampleData = [
      'Sample Tool', 'sample-tool', 'A sample tool description', 'A longer description of the sample tool', 
      'https://example.com/image.jpg', 'https://example.com', 'text', 'subcategory', 
      'free, freemium', 'AI, Chatbot', 'Feature 1, Feature 2', 'Pro 1, Pro 2', 'Con 1, Con 2', 
      'Alternative 1, Alternative 2', 'https://example.com/affiliate', 'false', 'active', 'false'
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Tools Template');
    
    // Generate the Excel file
    XLSX.writeFile(wb, 'tools_import_template.xlsx');
  };

  // Function to handle Excel file import
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setImportProgress(null);
    setImportResults(null);
    
    try {
      // Read the Excel file
      const data = await readExcelFile(file);
      
      if (data.length === 0) {
        setError('No data found in the Excel file.');
        setLoading(false);
        return;
      }
      
      // Process each row
      let successCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < data.length; i++) {
        setImportProgress({ current: i + 1, total: data.length });
        
        try {
          const row = data[i];
          
          // Convert string arrays to actual arrays
          const pricing = row.pricing ? row.pricing.split(',').map((p: string) => p.trim()) : [ToolPricing.FREE];
          const tags = row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [];
          const features = row.features ? row.features.split(',').map((f: string) => f.trim()) : [];
          const pros = row.pros ? row.pros.split(',').map((p: string) => p.trim()) : [];
          const cons = row.cons ? row.cons.split(',').map((c: string) => c.trim()) : [];
          const alternatives = row.alternatives ? row.alternatives.split(',').map((a: string) => a.trim()) : [];
          
          // Create the tool data
          const toolData = {
            name: row.name || '',
            slug: row.slug || row.name?.toLowerCase().replace(/\s+/g, '-') || '',
            description: row.description || '',
            longDescription: row.longDescription || '',
            imageUrl: row.imageUrl || '',
            websiteUrl: row.websiteUrl || '',
            category: row.category || ToolCategory.TEXT,
            subcategory: row.subcategory || '',
            pricing: pricing,
            tags: tags,
            features: features,
            pros: pros,
            cons: cons,
            alternatives: alternatives,
            affiliateLink: row.affiliateLink || '',
            sponsored: row.sponsored === 'true',
            status: row.status || ToolStatus.ACTIVE,
            featured: row.featured === 'true',
            viewCount: 0
          };
          
          // Create the tool
          await createTool(toolData as any);
          successCount++;
        } catch (err) {
          console.error(`Error importing tool at row ${i + 1}:`, err);
          failedCount++;
        }
      }
      
      setImportResults({ success: successCount, failed: failedCount });
      
      // Redirect after a short delay if successful
      if (successCount > 0) {
        setTimeout(() => {
          router.push('/admin/tools');
        }, 2000);
      }
    } catch (err) {
      console.error('Error importing Excel file:', err);
      setError('Failed to import Excel file. Please check the format and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to read Excel file
  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get the first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        reject(err);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Create New Tool</h1>
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
            <span className="font-medium">Tool created successfully! Redirecting...</span>
          </div>
        </motion.div>
      )}

      {importResults && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-6 shadow-sm"
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              Import completed: {importResults.success} tools imported successfully, {importResults.failed} failed.
            </span>
          </div>
        </motion.div>
      )}

      {/* Excel Import Section */}
      <div className="bg-gray-50 p-6 rounded-xl mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bulk Import Tools</h2>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Excel Template
            </button>
            <div className="relative flex-grow">
              <input
                type="file"
                ref={excelFileInputRef}
                onChange={handleExcelImport}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => excelFileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Import Excel File
              </button>
            </div>
          </div>
          
          {importProgress && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Importing tools...</span>
                <span className="text-sm font-medium text-gray-700">{importProgress.current} of {importProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Instructions:</p>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Download the Excel template</li>
              <li>Fill in the tool data in the template</li>
              <li>Save the Excel file</li>
              <li>Click "Import Excel File" to upload and import the tools</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-6"></div>

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
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] font-medium shadow-sm transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Create Tool'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
} 