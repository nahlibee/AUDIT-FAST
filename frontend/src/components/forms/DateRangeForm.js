import React from 'react';
import { getButtonClass } from '../../utils/styleUtils';

/**
 * Composant de formulaire pour la sélection d'une plage de dates
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.dateRange - Objet contenant les dates de début et de fin
 * @param {Function} props.setDateRange - Fonction pour mettre à jour la plage de dates
 * @param {Function} props.onApplyFilter - Fonction à appeler lors de l'application du filtre
 * @param {string} props.buttonText - Texte du bouton
 * @param {boolean} props.disabled - Si le bouton est désactivé
 * @param {boolean} props.loading - Si le chargement est en cours
 * @returns {JSX.Element} - Élément JSX
 */
const DateRangeForm = ({ 
  dateRange, 
  setDateRange, 
  onApplyFilter, 
  buttonText = "Appliquer", 
  disabled = false,
  loading = false
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de début (optionnel)
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin (optionnel)
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <button
        onClick={onApplyFilter}
        disabled={disabled}
        className={getButtonClass('primary', disabled)}
      >
        {loading ? 'Traitement en cours...' : buttonText}
      </button>
    </div>
  );
};

export default DateRangeForm;