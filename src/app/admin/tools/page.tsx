'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllTools, deleteTool, getToolsCount, searchTools } from '@/lib/firebase-services';
import { Tool, ToolStatus, ToolCategory, ToolPricing } from '@/lib/models';

export default function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalToolsCount, setTotalToolsCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const toolsPerPage = 10; // Number of tools to display per page

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        
        // If we have a search term, use the search functionality
        if (searchTerm.trim()) {
          setIsSearching(true);
          const searchResults = await searchTools(searchTerm);
          
          // Apply any other filters client-side
          let filtered = searchResults;
          
          if (filterCategory !== 'all') {
            filtered = filtered.filter(tool => tool.category === filterCategory);
          }
          
          if (filterStatus !== 'all') {
            filtered = filtered.filter(tool => tool.status === filterStatus);
          }
          
          // Apply sorting
          filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
              case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
              case 'category':
                comparison = (a.category || '').localeCompare(b.category || '');
                break;
              case 'status':
                comparison = (a.status || '').localeCompare(b.status || '');
                break;
              case 'views':
                comparison = (a.viewCount || 0) - (b.viewCount || 0);
                break;
              case 'date':
                const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.toMillis?.() || 0);
                const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.toMillis?.() || 0);
                comparison = dateA - dateB;
                break;
              default:
                comparison = a.name.localeCompare(b.name);
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
          });
          
          setTools(filtered);
          setFilteredTools(filtered);
          setTotalToolsCount(filtered.length);
        } else {
          // Regular initial load without search
          setIsSearching(false);
          
          // Get total count first
          const count = await getToolsCount();
          setTotalToolsCount(count);
          
          // Only fetch the needed page size that matches the UI pagination
          const toolsData = await getAllTools(1, toolsPerPage, {
            category: filterCategory,
            status: filterStatus,
            searchTerm: searchTerm,
            sortBy: sortBy,
            sortOrder: sortOrder
          });
          setTools(toolsData);
          setFilteredTools(toolsData);
        }
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  useEffect(() => {
    // When filter criteria change, reset to page 1 and fetch data again
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // If already on page 1, fetch with the new filters
      const fetchFiltered = async () => {
        try {
          setLoading(true);
          
          // For search term, use the specialized search function
          if (searchTerm.trim()) {
            setIsSearching(true);
            const searchResults = await searchTools(searchTerm);
            
            // Apply any other filters client-side
            let filtered = searchResults;
            
            if (filterCategory !== 'all') {
              filtered = filtered.filter(tool => tool.category === filterCategory);
            }
            
            if (filterStatus !== 'all') {
              filtered = filtered.filter(tool => tool.status === filterStatus);
            }
            
            // Apply sorting
            filtered.sort((a, b) => {
              let comparison = 0;
              
              switch (sortBy) {
                case 'name':
                  comparison = a.name.localeCompare(b.name);
                  break;
                case 'category':
                  comparison = (a.category || '').localeCompare(b.category || '');
                  break;
                case 'status':
                  comparison = (a.status || '').localeCompare(b.status || '');
                  break;
                case 'views':
                  comparison = (a.viewCount || 0) - (b.viewCount || 0);
                  break;
                case 'date':
                  const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.toMillis?.() || 0);
                  const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.toMillis?.() || 0);
                  comparison = dateA - dateB;
                  break;
                default:
                  comparison = a.name.localeCompare(b.name);
              }
              
              return sortOrder === 'asc' ? comparison : -comparison;
            });
            
            setTools(filtered);
            setFilteredTools(filtered);
            setTotalToolsCount(filtered.length);
          } else {
            // Regular filtering without search
            setIsSearching(false);
            
            // Get updated count with filters
            const count = await getToolsCount({
              category: filterCategory,
              status: filterStatus
            });
            setTotalToolsCount(count);
            
            // Fetch filtered data
            const toolsData = await getAllTools(1, toolsPerPage, {
              category: filterCategory,
              status: filterStatus,
              searchTerm: searchTerm,
              sortBy: sortBy,
              sortOrder: sortOrder
            });
            setTools(toolsData);
            setFilteredTools(toolsData);
          }
        } catch (err) {
          console.error('Error fetching tools:', err);
          setError('Failed to load tools. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      if (!loading) {
        fetchFiltered();
      }
    }
  }, [searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  // Handle page navigation
  const handlePageChange = async (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setLoading(true);
    
    try {
      // If searching, we need to handle pagination differently
      if (isSearching && searchTerm.trim()) {
        // We already have all search results, just update what's shown
        setCurrentPage(pageNumber);
      } else {
        // Regular pagination
        const toolsData = await getAllTools(pageNumber, toolsPerPage, {
          category: filterCategory,
          status: filterStatus,
          searchTerm: searchTerm,
          sortBy: sortBy,
          sortOrder: sortOrder
        });
        setTools(toolsData);
        setFilteredTools(toolsData);
      }
    } catch (err) {
      console.error('Error fetching tools for page:', err);
      setError('Failed to load tools for this page. Please try again.');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate pagination items with ellipsis
  const getPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're near the start or end
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 4);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      items.push('ellipsis-start');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push('ellipsis-end');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(totalPages);
    }
    
    return items;
  };

  // Get current page tools - update to handle search results properly
  const getCurrentPageTools = () => {
    if (isSearching) {
      // For search results, paginate client-side
      const startIndex = (currentPage - 1) * toolsPerPage;
      const endIndex = Math.min(startIndex + toolsPerPage, filteredTools.length);
      return filteredTools.slice(startIndex, endIndex);
    } else {
      // For regular filtering, we're already showing the right page from the server
      return filteredTools;
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalToolsCount / toolsPerPage);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      await deleteTool(id);
      setTools(tools.filter(tool => tool.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting tool:', err);
      setError('Failed to delete tool. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: ToolStatus) => {
    switch (status) {
      case ToolStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ToolStatus.BETA:
        return 'bg-blue-100 text-blue-800';
      case ToolStatus.DISCONTINUED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Tools</h1>
        <Link href="/admin/tools/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Tool
          </motion.button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="flex">
              <input
                type="text"
                id="search"
                placeholder="Search by name, description or tags"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && document.getElementById('searchButton')?.click()}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
              />
              <button
                id="searchButton"
                onClick={() => {
                  // Force refresh with current search term
                  const fetchFiltered = async () => {
                    try {
                      setLoading(true);
                      
                      if (searchTerm.trim()) {
                        setIsSearching(true);
                        const searchResults = await searchTools(searchTerm);
                        
                        // Apply any other filters client-side
                        let filtered = searchResults;
                        
                        if (filterCategory !== 'all') {
                          filtered = filtered.filter(tool => tool.category === filterCategory);
                        }
                        
                        if (filterStatus !== 'all') {
                          filtered = filtered.filter(tool => tool.status === filterStatus);
                        }
                        
                        // Apply sorting
                        filtered.sort((a, b) => {
                          let comparison = 0;
                          
                          switch (sortBy) {
                            case 'name':
                              comparison = a.name.localeCompare(b.name);
                              break;
                            case 'category':
                              comparison = (a.category || '').localeCompare(b.category || '');
                              break;
                            case 'status':
                              comparison = (a.status || '').localeCompare(b.status || '');
                              break;
                            case 'views':
                              comparison = (a.viewCount || 0) - (b.viewCount || 0);
                              break;
                            case 'date':
                              const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.toMillis?.() || 0);
                              const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.toMillis?.() || 0);
                              comparison = dateA - dateB;
                              break;
                            default:
                              comparison = a.name.localeCompare(b.name);
                          }
                          
                          return sortOrder === 'asc' ? comparison : -comparison;
                        });
                        
                        setTools(filtered);
                        setFilteredTools(filtered);
                        setTotalToolsCount(filtered.length);
                        setCurrentPage(1);
                      } else {
                        // If search is cleared, reset to normal view
                        setIsSearching(false);
                        
                        // Get total count first
                        const count = await getToolsCount({
                          category: filterCategory,
                          status: filterStatus
                        });
                        setTotalToolsCount(count);
                        
                        // Fetch filtered data
                        const toolsData = await getAllTools(1, toolsPerPage, {
                          category: filterCategory,
                          status: filterStatus,
                          searchTerm: '',
                          sortBy: sortBy,
                          sortOrder: sortOrder
                        });
                        setTools(toolsData);
                        setFilteredTools(toolsData);
                        setCurrentPage(1);
                      }
                    } catch (err) {
                      console.error('Error searching tools:', err);
                      setError('Failed to search tools. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  };
                  
                  fetchFiltered();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  onClick={() => {
                    // Clear search and reset
                    setSearchTerm('');
                    setIsSearching(false);
                    
                    const fetchReset = async () => {
                      try {
                        setLoading(true);
                        
                        // Get total count first
                        const count = await getToolsCount({
                          category: filterCategory,
                          status: filterStatus
                        });
                        setTotalToolsCount(count);
                        
                        // Fetch filtered data
                        const toolsData = await getAllTools(1, toolsPerPage, {
                          category: filterCategory,
                          status: filterStatus,
                          searchTerm: '',
                          sortBy: sortBy,
                          sortOrder: sortOrder
                        });
                        setTools(toolsData);
                        setFilteredTools(toolsData);
                        setCurrentPage(1);
                      } catch (err) {
                        console.error('Error resetting search:', err);
                        setError('Failed to reset search. Please try again.');
                      } finally {
                        setLoading(false);
                      }
                    };
                    
                    fetchReset();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
            {isSearching && filteredTools.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Found {filteredTools.length} matching tools
              </p>
            )}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              {Object.values(ToolCategory).map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              {Object.values(ToolStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex">
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
              >
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="status">Status</option>
                <option value="views">Views</option>
                <option value="date">Date Created</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tools.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">No tools found. Create your first tool to get started.</p>
          <Link href="/admin/tools/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Tool
            </motion.button>
          </Link>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-gray-600">No tools match your search criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageTools().map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        {tool.imageUrl ? (
                          <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {tool.description}
                        </div>
                        {tool.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{tool.category}</div>
                    {tool.subcategory && (
                      <div className="text-xs text-gray-500 capitalize">{tool.subcategory}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(tool.status)}`}>
                      {tool.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {tool.pricing?.map((price) => (
                        <span key={price} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {price}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tool.viewCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/admin/tools/${tool.id}/edit`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </motion.button>
                      </Link>
                      <button
                        onClick={() => handleDelete(tool.id!)}
                        className={`${deleteConfirm === tool.id ? 'text-red-600 hover:text-red-900' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        {deleteConfirm === tool.id ? 'Confirm' : 'Delete'}
                      </button>
                      {deleteConfirm === tool.id && (
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <p className="text-sm text-gray-500 mb-4 md:mb-0">
                Showing {(currentPage - 1) * toolsPerPage + 1} to {Math.min(currentPage * toolsPerPage, totalToolsCount)} of {totalToolsCount} tools
              </p>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-md flex items-center ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                    aria-label="Previous page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {getPaginationItems().map((item, index) => (
                    item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                      <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item as number)}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === item
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                        aria-label={`Page ${item}`}
                        aria-current={currentPage === item ? 'page' : undefined}
                      >
                        {item}
                      </button>
                    )
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-md flex items-center ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                    aria-label="Next page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 