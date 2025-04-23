import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            // Set Authorization header for all requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${currentUser.token}`;
        }
        setLoading(false);
    }, []);

    // Add token refresh interceptor
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (res) => res,
            async (error) => {
                // If error is 401 Unauthorized and we have a refresh token
                if (error.response?.status === 401 && user?.refreshToken) {
                    try {
                        // Try to refresh the token
                        const rs = await authService.refreshToken();
                        
                        // Update axios Authorization header
                        axios.defaults.headers.common['Authorization'] = `Bearer ${rs.token}`;
                        
                        // Retry the original request
                        return axios(error.config);
                    } catch (_error) {
                        // If refresh token fails, logout
                        logout();
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [user]);

    const login = async (username, password) => {
        try {
            const userData = await authService.login(username, password);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            // Ensure no partial state is kept on error
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
            // Re-throw the error so the component can handle it
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            await authService.register(username, email, password);
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
        delete axios.defaults.headers.common['Authorization'];
    };

    const hasRole = (roleName) => {
        return user && user.roles && user.roles.includes(roleName);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        hasRole,
        isLoggedIn: !!user
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