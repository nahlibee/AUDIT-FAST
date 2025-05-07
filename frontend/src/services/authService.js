import { authApi, setAuthToken } from '../utils/AxiosConfig';

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
    return authApi
      .post('signin', { username, password })
      .then(response => {
        if (response.data && response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
          setAuthToken(response.data.token);
          return response.data;
        }
        return Promise.reject(new Error('Invalid token received from server'));
      })
      .catch(error => {
        // Make sure we don't store any data on failed login
        localStorage.removeItem('user');
        setAuthToken(null);
        return Promise.reject(error);
      });
  }

  /**
   * Logout user by removing JWT tokens from local storage
   */
  logout() {
    localStorage.removeItem('user');
    setAuthToken(null);
  }

  /**
   * Register a new user
   * @param {string} username - Username
   * @param {string} email - Email
   * @param {string} password - Password
   * @param {string} role - User role (default: auditor)
   * @returns {Promise} - Promise with registration result
   */
  register(username, email, password, role = 'auditor',firstName,lastName,dateOfBirth,phoneNumber) {
    return authApi.post('signup', {
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber
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

    return authApi
      .post('refreshtoken', { refreshToken: user.refreshToken })
      .then(response => {
        // Update stored user with new token
        user.token = response.data.token;
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(response.data.token);
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