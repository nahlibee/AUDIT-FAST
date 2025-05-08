import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
  const auth = useAuth();
  
  // Extract detailed role information
  const roleInfo = auth.user?.roles ? auth.user.roles.map(role => {
    let normalized = null;
    if (typeof role === 'string') {
      normalized = role.replace('ROLE_', '').toLowerCase();
    }
    
    return {
      original: role,
      type: typeof role,
      normalized: normalized
    };
  }) : [];
  
  return (
    <div className="fixed bottom-0 right-0 bg-white p-4 border border-gray-300 text-xs z-50 max-w-lg overflow-auto max-h-80">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>
        <strong>isLoggedIn:</strong> {auth.isLoggedIn ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>isAdmin:</strong> {auth.isAdmin() ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>isManager:</strong> {auth.isManager() ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>isAuditor:</strong> {auth.isAuditor() ? 'Yes' : 'No'}
      </div>
      
      <div className="mt-2">
        <strong>Role Details:</strong>
        <pre className="mt-1 bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(roleInfo, null, 2)}
        </pre>
      </div>
      
      <div className="mt-2">
        <strong>User Object:</strong> 
        <pre className="mt-1 bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(auth.user, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AuthDebug; 