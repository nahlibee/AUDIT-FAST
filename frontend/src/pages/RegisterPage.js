import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getButtonClass, getCardClass } from '../utils/styleUtils';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        if (!username || !email || !password || !confirmPassword) {
            setError('Veuillez remplir tous les champs');
            return false;
        }
        
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Veuillez entrer une adresse email valide');
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
            const success = await register(username, email, password);
            if (success) {
                navigate('/login');
            } else {
                setError('Échec de l\'inscription. Veuillez réessayer.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Handle specific error responses
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 400) {
                    if (error.response.data && error.response.data.message) {
                        if (error.response.data.message.includes('Username is already taken')) {
                            setError('Ce nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.');
                        } else if (error.response.data.message.includes('Email is already in use')) {
                            setError('Cet email est déjà utilisé. Veuillez en utiliser un autre ou vous connecter.');
                        } else {
                            setError(error.response.data.message);
                        }
                    } else {
                        setError('Les données fournies sont invalides. Veuillez vérifier vos informations.');
                    }
                } else {
                    setError('Erreur lors de l\'inscription. Veuillez réessayer plus tard.');
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError('Le serveur ne répond pas. Veuillez vérifier votre connexion internet.');
            } else {
                // Something happened in setting up the request
                setError('Une erreur est survenue lors de l\'inscription');
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
                        Créer un compte
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Ou{' '}
                        <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
                            connectez-vous à votre compte
                        </Link>
                    </p>
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
                            <label htmlFor="email-address" className="sr-only">Adresse email</label>
                            <input
                                id="email-address"
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
                            <label htmlFor="confirm-password" className="sr-only">Confirmer le mot de passe</label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Confirmer le mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
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
                                    Inscription en cours...
                                </span>
                            ) : (
                                'S\'inscrire'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage; 