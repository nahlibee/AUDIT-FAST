import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/AuthService';
import { authApi, backendApi, analysisApi, setAuthToken } from '../utils/AxiosConfig';

// Define role constants
export const ROLES = {
    AUDITOR: 'auditor',
    MANAGER: 'manager',
    ADMIN: 'admin'
};

// Define role hierarchy
const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AUDITOR],
    [ROLES.MANAGER]: [ROLES.MANAGER, ROLES.AUDITOR],
    [ROLES.AUDITOR]: [ROLES.AUDITOR]
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            // Set Authorization header via our utility
            setAuthToken(currentUser.token);
        }
        setLoading(false);
    }, []);

    // Add token refresh interceptor
    useEffect(() => {
        // Create a common interceptor function for all API instances
        const createInterceptor = (apiInstance) => {
            return apiInstance.interceptors.response.use(
                (res) => res,
                async (error) => {
                    // If error is 401 Unauthorized and we have a refresh token
                    if (error.response?.status === 401 && user?.refreshToken) {
                        try {
                            // Try to refresh the token
                            const rs = await authService.refreshToken();
                            
                            // Update token in all services
                            setAuthToken(rs.token);
                            
                            // Create a new config object for the retry
                            const newConfig = { ...error.config };
                            // Remove any baseURL, it will be added automatically by the instance
                            delete newConfig.baseURL;
                            
                            // Retry the original request with the same instance that made it
                            return apiInstance.request(newConfig);
                        } catch (_error) {
                            // If refresh token fails, logout
                            logout();
                            return Promise.reject(error);
                        }
                    }
                    return Promise.reject(error);
                }
            );
        };
        
        // Add interceptors to all API instances
        const authInterceptor = createInterceptor(authApi);
        const backendInterceptor = createInterceptor(backendApi);
        const analysisInterceptor = createInterceptor(analysisApi);
        
        return () => {
            // Remove interceptors when component unmounts
            authApi.interceptors.response.eject(authInterceptor);
            backendApi.interceptors.response.eject(backendInterceptor);
            analysisApi.interceptors.response.eject(analysisInterceptor);
        };
    }, [user]);

    const login = async (username, password) => {
        try {
            const userData = await authService.login(username, password);
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            // Ensure no partial state is kept on error
            setUser(null);
            // Re-throw the error so the component can handle it
            throw error;
        }
    };

    const register = async (username, email, password, role = ROLES.AUDITOR, firstName,lastName,dateOfBirth,phoneNumber) => {
        try {
            await authService.register(username, email, password, role, firstName,lastName,dateOfBirth,phoneNumber);
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            // Re-throw the error so the component can handle it
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const hasRole = (roleName) => {
        if (!user || !user.roles || user.roles.length === 0) {
            console.log('No user or roles available');
            return false;
        }

        console.log(`Checking for role: ${roleName}, User roles:`, user.roles);

        // Check various role formats
        for (const userRole of user.roles) {
            // Case 1: Direct match
            if (userRole === roleName) {
                console.log(`Found direct match for ${roleName}`);
                return true;
            }
            
            // Case 2: Server-side format with "ROLE_" prefix
            if (typeof userRole === 'string') {
                // Handle ROLE_ADMIN vs admin format
                const normalizedUserRole = userRole.replace('ROLE_', '').toLowerCase();
                const normalizedRoleName = roleName.replace('ROLE_', '').toLowerCase();
                
                if (normalizedUserRole === normalizedRoleName) {
                    console.log(`Found normalized match for ${roleName} as ${normalizedUserRole}`);
                    return true;
                }
            }

            // Case 3: Check role hierarchy
            if (ROLE_HIERARCHY[userRole] && ROLE_HIERARCHY[userRole].includes(roleName)) {
                console.log(`Found role in hierarchy: ${userRole} includes ${roleName}`);
                return true;
            }
            
            // Case 4: Check normalized role hierarchy
            if (typeof userRole === 'string') {
                const normalizedUserRole = userRole.replace('ROLE_', '').toLowerCase();
                if (ROLE_HIERARCHY[normalizedUserRole] && ROLE_HIERARCHY[normalizedUserRole].includes(roleName)) {
                    console.log(`Found normalized role in hierarchy: ${normalizedUserRole} includes ${roleName}`);
                    return true;
                }
            }
        }

        console.log(`Role ${roleName} not found in user roles`);
        return false;
    };

    const isAuditor = () => hasRole(ROLES.AUDITOR);
    const isManager = () => hasRole(ROLES.MANAGER);
    const isAdmin = () => {
        const result = hasRole(ROLES.ADMIN);
        console.log(`isAdmin check result: ${result}`);
        return result;
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        hasRole,
        isAuditor,
        isManager,
        isAdmin,
        isLoggedIn: !!user,
        ROLES
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthContext };