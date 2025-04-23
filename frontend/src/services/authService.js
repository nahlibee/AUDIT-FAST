import axios from 'axios';

const API_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8081/api/auth/';

/**
 * Authentication service for interacting with the auth service API
 */
class AuthService {
  /**
   * Login user and save JWT tokens to local storage
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} - Promise with user data
   */
  login(username, password) {
    return axios
      .post(API_URL + 'signin', { username, password })
      .then(response => {
        if (response.data && response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
          return response.data;
        }
        return Promise.reject(new Error('Invalid token received from server'));
      })
      .catch(error => {
        // Make sure we don't store any data on failed login
        localStorage.removeItem('user');
        return Promise.reject(error);
      });
  }

  /**
   * Logout user by removing JWT tokens from local storage
   */
  logout() {
    localStorage.removeItem('user');
  }

  /**
   * Register a new user
   * @param {string} username - Username
   * @param {string} email - Email
   * @param {string} password - Password
   * @returns {Promise} - Promise with registration result
   */
  register(username, email, password) {
    return axios.post(API_URL + 'signup', {
      username,
      email,
      password
    });
  }

  /**
   * Refresh the access token using refresh token
   * @returns {Promise} - Promise with new token
   */
  refreshToken() {
    const user = this.getCurrentUser();
    
    if (!user || !user.refreshToken) {
      return Promise.reject('No refresh token available');
    }

    return axios
      .post(API_URL + 'refreshtoken', { refreshToken: user.refreshToken })
      .then(response => {
        // Update stored user with new token
        user.token = response.data.token;
        localStorage.setItem('user', JSON.stringify(user));
        return response.data;
      });
  }

  /**
   * Get current logged in user from local storage
   * @returns {Object|null} - Current user or null
   */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  /**
   * Check if user is logged in
   * @returns {boolean} - True if user is logged in
   */
  isLoggedIn() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

  /**
   * Check if user has specific role
   * @param {string} roleName - Role to check
   * @returns {boolean} - True if user has role
   */
  hasRole(roleName) {
    const user = this.getCurrentUser();
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(roleName);
  }
}

export default new AuthService(); 