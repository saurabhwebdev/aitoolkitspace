'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getSubmittedTools, approveTool, rejectTool } from '@/lib/firebase-services';
import { Tool } from '@/lib/models';
import { motion } from 'framer-motion';

export default function ToolSubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Tool | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const submittedTools = await getSubmittedTools();
        setSubmissions(submittedTools);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const handleApprove = async (submission: Tool) => {
    if (!submission.id) return;
    
    try {
      setIsProcessing(true);
      await approveTool(submission.id);
      setSubmissions(prev => prev.filter(s => s.id !== submission.id));
    } catch (err) {
      console.error('Error approving tool:', err);
      setError('Failed to approve tool. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (submission: Tool) => {
    if (!submission.id || !rejectionReason) return;
    
    try {
      setIsProcessing(true);
      await rejectTool(submission.id, rejectionReason);
      setSubmissions(prev => prev.filter(s => s.id !== submission.id));
      setSelectedSubmission(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting tool:', err);
      setError('Failed to reject tool. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access this page</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8">Tool Submissions</h1>

          {submissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">No pending submissions</h3>
              <p className="mt-1 text-sm text-gray-500">
                All tool submissions have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start space-x-4">
                    {submission.imageUrl && (
                      <img
                        src={submission.imageUrl}
                        alt={submission.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2">{submission.name}</h2>
                      <p className="text-gray-600 mb-4">{submission.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-medium mb-1">Details</h3>
                          <ul className="text-sm text-gray-600">
                            <li>Category: {submission.category}</li>
                            {submission.subcategory && (
                              <li>Subcategory: {submission.subcategory}</li>
                            )}
                            <li>Website: <a href={submission.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{submission.websiteUrl}</a></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Features</h3>
                          <div className="flex flex-wrap gap-2">
                            {submission.pricing.map((price, index) => (
                              <span
                                key={index}
                                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                              >
                                {price}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleApprove(submission)}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {isProcessing ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejection Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Reject Tool Submission</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting this submission:
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-32 p-2 border rounded-md mb-4"
                  placeholder="Enter rejection reason..."
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setSelectedSubmission(null);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission)}
                    disabled={!rejectionReason || isProcessing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 