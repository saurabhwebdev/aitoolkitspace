'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  isEditor: boolean;
  createdAt: number;
  lastLoginAt: number;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  useEffect(() => {
    // In a real application, we would fetch users from your database
    // For demonstration purposes, we'll create mock data
    const mockUsers: User[] = [
      {
        uid: '1',
        email: 'admin@aitoolkit.space',
        displayName: 'Admin User',
        photoURL: '',
        isAdmin: true,
        isEditor: true,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        lastLoginAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      },
      {
        uid: '2',
        email: 'editor@aitoolkit.space',
        displayName: 'Editor User',
        photoURL: '',
        isAdmin: false,
        isEditor: true,
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
        lastLoginAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      },
      ...Array(10).fill(0).map((_, i) => ({
        uid: `${i + 3}`,
        email: `user${i + 1}@example.com`,
        displayName: `Test User ${i + 1}`,
        photoURL: '',
        isAdmin: false,
        isEditor: false,
        createdAt: Date.now() - (15 - i) * 24 * 60 * 60 * 1000,
        lastLoginAt: Date.now() - i * 24 * 60 * 60 * 1000,
      })),
    ];

    setUsers(mockUsers);
    setLoading(false);
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleRoleToggle = (userId: string, role: 'admin' | 'editor') => {
    setUsers(
      users.map((u) => {
        if (u.uid === userId) {
          if (role === 'admin') {
            return { ...u, isAdmin: !u.isAdmin };
          } else if (role === 'editor') {
            return { ...u, isEditor: !u.isEditor };
          }
        }
        return u;
      })
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const addNewUser = () => {
    if (!newUserEmail) return;

    const newUser: User = {
      uid: `${users.length + 1}`,
      email: newUserEmail,
      displayName: newUserEmail.split('@')[0],
      photoURL: '',
      isAdmin: newUserRole === 'admin',
      isEditor: newUserRole === 'admin' || newUserRole === 'editor',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    setUsers([...users, newUser]);
    setNewUserEmail('');
    setNewUserRole('user');
    setShowAddUserModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add User
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by email or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsers.map((u) => (
              <tr key={u.uid} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500 bg-gray-300">
                          {u.displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{u.displayName}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(u.lastLoginAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {u.isAdmin && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Admin
                      </span>
                    )}
                    {u.isEditor && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Editor
                      </span>
                    )}
                    {!u.isAdmin && !u.isEditor && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        User
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleRoleToggle(u.uid, 'admin')}
                      className={`${u.isAdmin ? 'text-red-600 hover:text-red-900' : 'text-gray-600 hover:text-gray-900'}`}
                      disabled={u.email === user?.email} // Can't change own role
                    >
                      {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => handleRoleToggle(u.uid, 'editor')}
                      className={`${u.isEditor ? 'text-blue-600 hover:text-blue-900' : 'text-gray-600 hover:text-gray-900'}`}
                      disabled={u.email === user?.email} // Can't change own role
                    >
                      {u.isEditor ? 'Remove Editor' : 'Make Editor'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <div className="mb-4">
              <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="newUserEmail"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="user@example.com"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="newUserRole" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="newUserRole"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addNewUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 