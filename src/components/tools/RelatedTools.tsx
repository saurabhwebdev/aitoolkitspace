'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tool, ToolCategory } from '@/lib/models';
import { getToolsByCategory } from '@/lib/firebase-services';

interface RelatedToolsProps {
  currentTool: Tool;
  limit?: number;
}

export default function RelatedTools({ currentTool, limit = 3 }: RelatedToolsProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedTools = async () => {
      try {
        setLoading(true);
        const categoryTools = await getToolsByCategory(currentTool.category as ToolCategory);
        // Filter out the current tool and limit the results
        const relatedTools = categoryTools
          .filter(tool => tool.id !== currentTool.id)
          .slice(0, limit);
        setTools(relatedTools);
      } catch (err) {
        console.error('Error fetching related tools:', err);
        setError('Failed to load related tools');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedTools();
  }, [currentTool.id, currentTool.category, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show any error state in the related tools section
  }

  if (tools.length === 0) {
    return null; // Don't show the section if there are no related tools
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
      <div className="space-y-4">
        {tools.map((tool) => (
          <Link href={`/tools/${tool.slug}`} key={tool.id}>
            <motion.div
              whileHover={{ y: -2 }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {tool.imageUrl ? (
                <img
                  src={tool.imageUrl}
                  alt={tool.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No img</span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{tool.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{tool.description}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
} 