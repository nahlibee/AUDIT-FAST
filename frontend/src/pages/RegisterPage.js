import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { getButtonClass, getCardClass } from '../utils/StyleUtils';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [role, setRole] = useState(ROLES.AUDITOR);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, isLoggedIn, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in and not admin
    useEffect(() => {
        if (isLoggedIn && !isAdmin()) {
            navigate('/');
        }
    }, [isLoggedIn, isAdmin, navigate]);

    const validateForm = () => {
        if (!username || !email || !password || !confirmPassword || !firstName || !lastName || !dateOfBirth|| !phoneNumber) {
            setError('Veuillez remplir tous les champs');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return false;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Veuillez entrer une adresse email valide');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const success = await register(username, email, password, role,firstName, lastName, dateOfBirth, phoneNumber);
            if (success) {
                // If admin is creating a user, stay on the page
                if (isAdmin()) {
                    // Clear form
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setRole(ROLES.AUDITOR);
                    setPhoneNumber('');
                    setFirstName('');
                    setLastName('');
                    setDateOfBirth('');
                    alert('Utilisateur créé avec succès');
                } else {
                    // Regular registration - redirect to login
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            // Handle specific error responses
            if (error.response) {
                if (error.response.status === 400) {
                    if (error.response.data && error.response.data.message) {
                        if (error.response.data.message.includes('username')) {
                            setError("Ce nom d'utilisateur est déjà pris.");
                        } else if (error.response.data.message.includes('email')) {
                            setError("Cette adresse email est déjà utilisée.");
                        } else {
                            setError(error.response.data.message);
                        }
                    } else {
                        setError('Données invalides. Veuillez vérifier vos informations.');
                    }
                } else {
                    setError("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
                }
            } else {
                setError("Une erreur s'est produite. Veuillez vérifier votre connexion.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className={getCardClass('default') + " max-w-md w-full space-y-8"}>
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isAdmin() ? 'Créer un utilisateur' : 'Créer un compte'}
                    </h2>
                    {!isAdmin() && (
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Ou{' '}
                            <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
                                connectez-vous
                            </Link>
                        </p>
                    )}
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Nom d'utilisateur</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Nom d'utilisateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="firstName" className="sr-only">Prénom</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Prénom"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="sr-only">Nom</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Nom"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Adresse email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="phoneNumber" className="sr-only">Numéro de téléphone</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Numéro de téléphone"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="dateOfBirth" className="sr-only">Date de naissance</label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirmer le mot de passe</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Confirmer le mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        
                        {/* Role selection - only shown to admins */}
                        {isAdmin() && (
                            <div className="pt-4 pb-2">
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                                    Rôle de l'utilisateur
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                    disabled={isLoading}
                                >
                                    <option value={ROLES.AUDITOR}>Auditeur</option>
                                    <option value={ROLES.MANAGER}>Manager</option>
                                    <option value={ROLES.ADMIN}>Administrateur</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500 ml-1">
                                    Les auditeurs peuvent réaliser des audits, les managers peuvent créer et assigner des missions, les administrateurs ont tous les droits.
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className={getButtonClass('primary') + " w-full"}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isAdmin() ? "Création en cours..." : "Inscription en cours..."}
                                </span>
                            ) : (
                                isAdmin() ? "Créer l'utilisateur" : "S'inscrire"
                            )}
                        </button>
                    </div>
                    
                    {isAdmin() && (
                        <div className="text-center">
                            <Link to="/admin/users" className="font-medium text-yellow-600 hover:text-yellow-500">
                                Retour à la gestion des utilisateurs
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default RegisterPage; 