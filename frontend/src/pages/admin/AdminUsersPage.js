import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RegisterPage from '../RegisterPage';
import { getButtonClass, getCardClass, getBadgeClass } from '../../utils/StyleUtils';
import { authApi } from '../../utils/AxiosConfig';

const AdminUsersPage = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                console.log('Fetching users from auth service...');
                // Since AUTH_SERVICE_URL is http://localhost:8081/api/auth
                // We need to make request to /users not /api/users
                const response = await authApi.get('/users');
                console.log('Users response:', response.data);
                setUsers(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Une erreur est survenue lors du chargement des utilisateurs. ' + 
                         (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                // Use the correct endpoint
                await authApi.delete(`/users/${userId}`);
                setUsers(users.filter(user => user.id !== userId));
                alert('Utilisateur supprimé avec succès');
            } catch (err) {
                console.error('Error deleting user:', err);
                alert('Erreur lors de la suppression de l\'utilisateur: ' + 
                      (err.response?.data?.message || err.message));
            }
        }
    };

    // Handle toggling user account status
    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            // Update to use the correct endpoint structure
            await authApi.put(`/users/${userId}`, { accountEnabled: !currentStatus });
            setUsers(users.map(user => 
                user.id === userId 
                    ? { ...user, accountEnabled: !currentStatus } 
                    : user
            ));
            alert(`Compte ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
        } catch (err) {
            console.error('Error updating user status:', err);
            alert('Erreur lors de la mise à jour du statut du compte: ' + 
                  (err.response?.data?.message || err.message));
        }
    };

    if (!isAdmin()) {
        return null; // Don't render anything if not admin
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
                <button 
                    className={getButtonClass('primary')}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Annuler' : 'Créer un utilisateur'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {showCreateForm && (
                <div className="mb-8">
                    <RegisterPage />
                </div>
            )}

            <div className={getCardClass('default')}>
                <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="spinner-border text-yellow-500" role="status">
                            <span className="sr-only">Chargement...</span>
                        </div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Aucun utilisateur trouvé. Créez un utilisateur avec le bouton ci-dessus.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nom d'utilisateur
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nom complet
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rôle
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.firstName} {user.lastName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.map(role => (
                                                    <span key={role} className={getBadgeClass('info')}>
                                                        {role.replace('ROLE_', '')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={getBadgeClass(user.accountEnabled ? 'success' : 'danger')}>
                                                {user.accountEnabled ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => handleToggleUserStatus(user.id, user.accountEnabled)}
                                                className={`${user.accountEnabled ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} mr-4`}
                                            >
                                                {user.accountEnabled ? 'Désactiver' : 'Activer'}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage; 