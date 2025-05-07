// src/components/audit/UserManagement.js
import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import Card from '../common/Card';
import Alert from '../common/Alert';
import DataTable from '../common/DataTable';
import { getButtonClass, getBadgeClass } from '../../utils/StyleUtils';
import axios from 'axios';
import { API_URL } from '../../config/Api';
import { handleApiError } from '../../utils/ErrorHandler';

const UserManagement = () => {
  const { showToast } = useContext(ToastContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'AUDITOR',
    password: '',
    confirmPassword: '',
    isActive: true
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from the API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/audit/users`);
      setUsers(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(`Failed to load users: ${errorMessage}`);
      showToast('error', `Failed to load users: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'AUDITOR',
      password: '',
      confirmPassword: '',
      isActive: true
    });
    setFormErrors({});
    setEditingUser(null);
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    
    // Email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email format is invalid";
    }
    
    // Password requirements (only for new users or password change)
    if (!editingUser || formData.password) {
      if (!editingUser && !formData.password) {
        errors.password = "Password is required";
      } else if (formData.password) {
        if (formData.password.length < 8) {
          errors.password = "Password must be at least 8 characters";
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (create/update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      
      // Prepare data for API (remove confirmPassword field)
      const userData = { ...formData };
      delete userData.confirmPassword;
      
      // If editing, don't send password unless it was changed
      if (editingUser && !userData.password) {
        delete userData.password;
      }
      
      if (editingUser) {
        // Update existing user
        response = await axios.put(`${API_URL}/audit/users/${editingUser.id}`, userData);
        showToast('success', 'User updated successfully');
      } else {
        // Create new user
        response = await axios.post(`${API_URL}/audit/users`, userData);
        showToast('success', 'User created successfully');
      }
      
      // Refresh users list
      await fetchUsers();
      
      // Close form and reset
      setShowForm(false);
      resetForm();
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(`Failed to ${editingUser ? 'update' : 'create'} user: ${errorMessage}`);
      showToast('error', `Failed to ${editingUser ? 'update' : 'create'} user: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle user edit button click
  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '',
      confirmPassword: '',
      isActive: user.isActive !== false // Default to true if not specified
    });
    setEditingUser(user);
    setShowForm(true);
    setFormErrors({});
  };

  // Handle user delete button click (show confirmation)
  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
    setIsDeleting(true);
  };

  // Confirm user deletion
  const confirmDelete = async () => {
    if (!deleteUserId) return;
    
    setLoading(true);
    
    try {
      await axios.delete(`${API_URL}/audit/users/${deleteUserId}`);
      
      // Remove user from local state
      setUsers(users.filter(user => user.id !== deleteUserId));
      
      showToast('success', 'User deleted successfully');
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(`Failed to delete user: ${errorMessage}`);
      showToast('error', `Failed to delete user: ${errorMessage}`);
    } finally {
      setLoading(false);
      setIsDeleting(false);
      setDeleteUserId(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setIsDeleting(false);
    setDeleteUserId(null);
  };

  // Toggle user active status
  const toggleUserStatus = async (userId, currentStatus) => {
    setLoading(true);
    
    try {
      await axios.patch(`${API_URL}/audit/users/${userId}/status`, {
        isActive: !currentStatus
      });
      
      // Update user in local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, isActive: !currentStatus };
        }
        return user;
      }));
      
      showToast('success', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(`Failed to update user status: ${errorMessage}`);
      showToast('error', `Failed to update user status: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // DataTable columns configuration
  const columns = [
    { 
      header: 'Username', 
      accessor: 'username' 
    },
    { 
      header: 'Name', 
      accessor: 'firstName',
      cellRenderer: (value, row) => `${row.firstName} ${row.lastName}`
    },
    { 
      header: 'Email', 
      accessor: 'email' 
    },
    { 
      header: 'Role', 
      accessor: 'role',
      cellRenderer: (value) => {
        let badgeClass;
        switch (value) {
          case 'ADMIN':
            badgeClass = 'bg-purple-100 text-purple-800';
            break;
          case 'MANAGER':
            badgeClass = 'bg-green-100 text-green-800';
            break;
          default:
            badgeClass = 'bg-blue-100 text-blue-800';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
            {value}
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: 'isActive',
      cellRenderer: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value !== false ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'id',
      cellRenderer: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => toggleUserStatus(value, row.isActive !== false)}
            className={`${row.isActive !== false ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}
          >
            {row.isActive !== false ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleDeleteClick(value)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
        
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className={getButtonClass(showForm ? 'secondary' : 'primary')}
        >
          {showForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error}
          className="mt-4"
        />
      )}

      {showForm && (
        <Card title={editingUser ? `Edit User: ${editingUser.username}` : "Add New User"} className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username*
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!!editingUser} // Disable username change for existing users
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                    formErrors.username ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                    formErrors.email ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                    formErrors.firstName ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                    formErrors.lastName ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role*
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                >
                  <option value="AUDITOR">Auditor</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Password (leave blank to keep current)' : 'Password*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                    formErrors.password ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                    formErrors.confirmPassword ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center h-full">
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active account
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className={getButtonClass('outline', false, 'sm')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={getButtonClass('primary', false, 'sm')}
                >
                  {loading 
                    ? (editingUser ? 'Updating...' : 'Creating...') 
                    : (editingUser ? 'Update User' : 'Create User')
                  }
                </button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading && !showForm ? (
          <div className="flex justify-center items-center p-8">
            <div className="loading-spinner mr-3"></div>
            <span>Loading users...</span>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <p className="text-xs text-blue-700 font-medium">TOTAL USERS</p>
                <p className="text-2xl font-bold text-blue-800">{users.length}</p>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-md">
                <p className="text-xs text-purple-700 font-medium">ADMINS</p>
                <p className="text-2xl font-bold text-purple-800">
                  {users.filter(user => user.role === 'ADMIN').length}
                </p>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                <p className="text-xs text-green-700 font-medium">MANAGERS</p>
                <p className="text-2xl font-bold text-green-800">
                  {users.filter(user => user.role === 'MANAGER').length}
                </p>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <p className="text-xs text-yellow-700 font-medium">AUDITORS</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {users.filter(user => user.role === 'AUDITOR').length}
                </p>
              </div>
            </div>
            
            <DataTable
              data={users}
              columns={columns}
              pageSize={10}
              enableSorting={true}
            />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className={getButtonClass('outline', false, 'sm')}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={getButtonClass('danger', false, 'sm')}
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;