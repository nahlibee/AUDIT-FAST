import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import userService from '../services/UserService';

import { getButtonClass, getCardClass, getBadgeClass } from '../utils/StyleUtils';


const UserProfilePage = () => {
    const { user, isManager, isAdmin } = useAuth();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [myMissions, setMyMissions] = useState([]);
    const [createdMissions, setCreatedMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get user profile
                const profileData = await userService.getCurrentUserProfile();
                setProfile(profileData);
                
                // Get missions assigned to user
                const assignedMissions = await missionService.getMyMissions();
                setMyMissions(assignedMissions);
                
                // If user is manager, get missions created by user
                if (isManager() || isAdmin()) {
                    const creatorId = profileData.id || user.id;
                    const createdMissionsData = await missionService.getAllMissions({ createdBy: creatorId });
                    setCreatedMissions(createdMissionsData);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Une erreur est survenue lors du chargement des données');
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [user, isManager, isAdmin]);
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };
    
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case MISSION_STATUS.PENDING:
                return getBadgeClass('warning');
            case MISSION_STATUS.IN_PROGRESS:
                return getBadgeClass('info');
            case MISSION_STATUS.COMPLETED:
                return getBadgeClass('success');
            case MISSION_STATUS.CANCELLED:
                return getBadgeClass('danger');
            case MISSION_STATUS.ON_HOLD:
                return getBadgeClass('secondary');
            default:
                return getBadgeClass('default');
        }
    };
    
    const getStatusLabel = (status) => {
        switch (status) {
            case MISSION_STATUS.PENDING:
                return 'En attente';
            case MISSION_STATUS.IN_PROGRESS:
                return 'En cours';
            case MISSION_STATUS.COMPLETED:
                return 'Terminée';
            case MISSION_STATUS.CANCELLED:
                return 'Annulée';
            case MISSION_STATUS.ON_HOLD:
                return 'En pause';
            default:
                return status;
        }
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-1">
                    <div className={getCardClass('default')}>
                        <div className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-800 text-2xl font-bold mb-4">
                                    {profile?.username ? profile.username.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <h2 className="text-xl font-bold">{profile?.username || user?.username}</h2>
                                <p className="text-gray-600 mb-2">{profile?.email || user?.email}</p>
                                
                                <div className="mt-2 mb-4">
                                    {user?.roles?.map(role => (
                                        <span key={role} className={getBadgeClass('info') + " mr-2"}>
                                            {role === ROLES.MANAGER ? 'Manager' : role === ROLES.ADMIN ? 'Administrateur' : 'Auditeur'}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="w-full mt-4">
                                    <h3 className="text-lg font-semibold mb-2">Informations personnelles</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nom complet:</span>
                                            <span>{profile?.fullName || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Département:</span>
                                            <span>{profile?.department || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Position:</span>
                                            <span>{profile?.position || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date d'inscription:</span>
                                            <span>{profile?.createdAt ? formatDate(profile.createdAt) : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => navigate('/profile/edit')}
                                    className={getButtonClass('secondary') + " w-full mt-6"}
                                >
                                    Modifier le profil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Mission Management Section */}
                <div className="lg:col-span-2">
                    {/* Manager Actions */}
                    {(isManager() || isAdmin()) && (
                        <div className={getCardClass('default') + " mb-6"}>
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Gestion des missions</h2>
                                <p className="text-gray-600 mb-4">
                                    En tant que manager, vous pouvez créer de nouvelles missions et assigner des auditeurs.
                                </p>
                                <div className="flex space-x-4">
                                    <Link to="/missions/create" className={getButtonClass('primary')}>
                                        Créer une mission
                                    </Link>
                                    <Link to="/missions" className={getButtonClass('secondary')}>
                                        Voir toutes les missions
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Missions Created By Manager */}
                    {(isManager() || isAdmin()) && createdMissions.length > 0 && (
                        <div className={getCardClass('default') + " mb-6"}>
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Missions créées</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date fin</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {createdMissions.map(mission => (
                                                <tr key={mission.id}>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <Link to={`/missions/${mission.id}`} className="text-yellow-600 hover:text-yellow-900 font-medium">
                                                            {mission.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={getStatusBadgeClass(mission.status)}>
                                                            {getStatusLabel(mission.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {formatDate(mission.dueDate)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <Link to={`/missions/${mission.id}/assign`} className="text-green-600 hover:text-green-900 mr-3">
                                                            Assigner
                                                        </Link>
                                                        <Link to={`/missions/${mission.id}/edit`} className="text-blue-600 hover:text-blue-900">
                                                            Modifier
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* My Missions Section */}
                    <div className={getCardClass('default')}>
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Mes missions</h2>
                            
                            {myMissions.length === 0 ? (
                                <p className="text-gray-600">Vous n'avez pas encore de missions assignées.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date fin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {myMissions.map(mission => (
                                                <tr key={mission.id}>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <Link to={`/missions/${mission.id}`} className="text-yellow-600 hover:text-yellow-900 font-medium">
                                                            {mission.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={getStatusBadgeClass(mission.status)}>
                                                            {getStatusLabel(mission.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {formatDate(mission.startDate)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {formatDate(mission.dueDate)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage; 