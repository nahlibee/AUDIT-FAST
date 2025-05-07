import { backendApi } from '../utils/AxiosConfig';

/**
 * User service for managing user information
 */
class UserService {
  /**
   * Get all users
   * @param {Object} filters - Optional filters for users
   * @returns {Promise<Array>} - Promise with users
   */
  getAllUsers(filters = {}) {
    return backendApi.get('users', { params: filters })
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching users:', error);
        throw error;
      });
  }

  /**
   * Get users by role
   * @param {string} role - Role to filter by
   * @returns {Promise<Array>} - Promise with users that have the specified role
   */
  getUsersByRole(role) {
    return backendApi.get(`users/role/${role}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching users with role ${role}:`, error);
        throw error;
      });
  }

  /**
   * Get all auditors (users with auditor role)
   * @returns {Promise<Array>} - Promise with auditor users
   */
  getAuditors() {
    return this.getUsersByRole('auditor');
  }

  /**
   * Get all managers (users with manager role)
   * @returns {Promise<Array>} - Promise with manager users
   */
  getManagers() {
    return this.getUsersByRole('manager');
  }

  /**
   * Get a single user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} - Promise with user data
   */
  getUser(id) {
    return backendApi.get(`users/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching user ${id}:`, error);
        throw error;
      });
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} - Promise with current user data
   */
  getCurrentUserProfile() {
    return backendApi.get('users/profile')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching current user profile:', error);
        throw error;
      });
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role to assign
   * @returns {Promise<Object>} - Promise with updated user
   */
  updateUserRole(userId, role) {
    return backendApi.put(`users/${userId}/role`, { role })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error updating role for user ${userId}:`, error);
        throw error;
      });
  }

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Promise with updated user
   */
  updateProfile(userData) {
    return backendApi.put('users/profile', userData)
      .then(response => response.data)
      .catch(error => {
        console.error('Error updating user profile:', error);
        throw error;
      });
  }

  /**
   * Disable a user account
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with operation result
   */
  disableUser(userId) {
    return backendApi.put(`users/${userId}/disable`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error disabling user ${userId}:`, error);
        throw error;
      });
  }

  /**
   * Enable a user account
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with operation result
   */
  enableUser(userId) {
    return backendApi.put(`users/${userId}/enable`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error enabling user ${userId}:`, error);
        throw error;
      });
  }
}

export default new UserService(); 