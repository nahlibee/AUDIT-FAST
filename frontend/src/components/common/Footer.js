import React from 'react';

/**
 * Composant de pied de page de l'application
 * @returns {JSX.Element} - Élément JSX
 */
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-1">
          <span className="text-yellow-400 font-medium">Outil d'analyse SAP pour l'audit IT</span> | {new Date().getFullYear()}
        </div>
        <div className="text-xs text-gray-400">
          Architecture hybride: <span className="text-yellow-300">Frontend React</span> + <span className="text-yellow-300">Backend Python FastAPI</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;