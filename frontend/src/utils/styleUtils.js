/**
 * Enhanced styleUtils.js for SAP Security Analyzer
 * Utility functions for consistent styling throughout the application
 */

/**
 * Renvoie les classes CSS en fonction du niveau de risque
 * @param {string} level - Niveau de risque (Critique, Élevé, Moyen, Faible)
 * @returns {string} - Classes CSS correspondantes
 */
export const getRiskLevelClass = (level) => {
  switch (level) {
    case 'Critique':
      return 'bg-red-100 text-red-900 border-l-4 border-red-500 rounded-md';
    case 'Élevé':
      return 'bg-amber-100 text-amber-900 border-l-4 border-amber-500 rounded-md';
    case 'Moyen':
      return 'bg-yellow-100 text-yellow-900 border-l-4 border-yellow-500 rounded-md';
    case 'Faible':
      return 'bg-lime-100 text-lime-900 border-l-4 border-lime-500 rounded-md';
    default:
      return 'bg-gray-100 text-gray-800 border-l-4 border-gray-400 rounded-md';
  }
};

/**
 * Renvoie les classes CSS pour les onglets principaux
 * @param {boolean} isActive - Si l'onglet est actif
 * @returns {string} - Classes CSS correspondantes
 */
export const getTabClass = (isActive) => {
  return `mr-8 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
    isActive
      ? 'border-yellow-500 text-black'
      : 'border-transparent text-gray-700 hover:text-black hover:border-yellow-300'
  }`;
};

/**
 * Renvoie les classes CSS pour les sous-onglets
 * @param {boolean} isActive - Si le sous-onglet est actif
 * @returns {string} - Classes CSS correspondantes
 */
export const getSubTabClass = (isActive) => {
  return `mr-6 py-2 px-1 border-b-2 font-medium text-xs transition-colors duration-200 ${
    isActive
      ? 'border-yellow-500 text-black'
      : 'border-transparent text-gray-600 hover:text-black hover:border-yellow-300'
  }`;
};

/**
 * Renvoie les classes CSS pour les boutons d'action
 * @param {string} variant - Variante du bouton (primary, secondary, danger, success, warning, outline)
 * @param {boolean} isDisabled - Si le bouton est désactivé
 * @param {string} size - Taille du bouton (sm, md, lg)
 * @returns {string} - Classes CSS correspondantes
 */
export const getButtonClass = (variant = 'primary', isDisabled = false, size = 'md') => {
  const baseClasses = 'rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200 font-medium';
  const disabledClasses = 'disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70';
  
  // Taille du bouton
  let sizeClasses;
  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1 text-sm';
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3 text-base';
      break;
    default: // md
      sizeClasses = 'px-4 py-2 text-sm';
  }
  
  if (isDisabled) {
    return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-gray-300 text-gray-500`;
  }
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-300 shadow-sm`;
    case 'secondary':
      return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-gray-800 text-white hover:bg-black focus:ring-gray-600 shadow-sm`;
    case 'success':
      return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-lime-500 text-white hover:bg-lime-600 focus:ring-lime-400 shadow-sm`;
    case 'danger':
      return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm`;
    case 'warning':
      return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-amber-500 text-black hover:bg-amber-600 focus:ring-amber-400 shadow-sm`;
    case 'outline':
      return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-transparent border border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-300`;
    case 'text':
      return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-transparent text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 focus:ring-yellow-300`;
    default:
      return `${baseClasses} ${sizeClasses} ${disabledClasses} bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-300 shadow-sm`;
  }
};

/**
 * Renvoie les classes CSS pour les cartes
 * @param {string} variant - Variante de la carte (default, info, warning, danger, success)
 * @param {boolean} isInteractive - Si la carte est interactive (hover, focus)
 * @returns {string} - Classes CSS correspondantes
 */
export const getCardClass = (variant = 'default', isInteractive = false) => {
  const baseClasses = 'p-6 rounded-lg shadow-md border-l-4';
  const interactiveClasses = isInteractive ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  
  switch (variant) {
    case 'info':
      return `${baseClasses} ${interactiveClasses} bg-gray-50 border-yellow-400`;
    case 'warning':
      return `${baseClasses} ${interactiveClasses} bg-amber-50 border-amber-400`;
    case 'danger':
      return `${baseClasses} ${interactiveClasses} bg-red-50 border-red-500`;
    case 'success':
      return `${baseClasses} ${interactiveClasses} bg-lime-50 border-lime-500`;
    case 'dark':
      return `${baseClasses} ${interactiveClasses} bg-gray-800 text-white border-yellow-400`;
    default:
      return `${baseClasses} ${interactiveClasses} bg-white border-gray-200`;
  }
};

/**
 * Renvoie les classes CSS pour les badges
 * @param {string} variant - Variante du badge (default, info, warning, danger, success)
 * @param {boolean} isLarge - Si le badge est plus grand
 * @returns {string} - Classes CSS correspondantes
 */
export const getBadgeClass = (variant = 'default', isLarge = false) => {
  const baseClasses = isLarge 
    ? 'px-3 py-1 rounded-full text-sm font-semibold' 
    : 'px-2 py-1 rounded-full text-xs font-semibold';
  
  switch (variant) {
    case 'info':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'warning':
      return `${baseClasses} bg-amber-100 text-amber-800`;
    case 'danger':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'success':
      return `${baseClasses} bg-lime-100 text-lime-800`;
    case 'count':
      return `${baseClasses} bg-gray-800 text-yellow-400`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

/**
 * Renvoie les classes CSS pour les alertes
 * @param {string} variant - Variante de l'alerte (info, warning, danger, success)
 * @param {boolean} isDismissible - Si l'alerte peut être fermée
 * @returns {string} - Classes CSS correspondantes
 */
export const getAlertClass = (variant = 'info', isDismissible = false) => {
  const baseClasses = 'p-4 rounded-lg border-l-4 flex items-start';
  const dismissibleClasses = isDismissible ? 'pr-10 relative' : '';
  
  switch (variant) {
    case 'info':
      return `${baseClasses} ${dismissibleClasses} bg-yellow-50 border-yellow-400 text-yellow-800`;
    case 'warning':
      return `${baseClasses} ${dismissibleClasses} bg-amber-50 border-amber-400 text-amber-800`;
    case 'danger':
      return `${baseClasses} ${dismissibleClasses} bg-red-50 border-red-500 text-red-800`;
    case 'success':
      return `${baseClasses} ${dismissibleClasses} bg-lime-50 border-lime-500 text-lime-800`;
    default:
      return `${baseClasses} ${dismissibleClasses} bg-yellow-50 border-yellow-400 text-yellow-800`;
  }
};

/**
 * Renvoie les classes CSS pour les champs de formulaire
 * @param {boolean} hasError - Si le champ contient une erreur
 * @param {string} size - Taille du champ (sm, md, lg)
 * @returns {string} - Classes CSS correspondantes
 */
export const getInputClass = (hasError = false, size = 'md') => {
  let sizeClasses;
  switch (size) {
    case 'sm':
      sizeClasses = 'px-2 py-1 text-sm';
      break;
    case 'lg':
      sizeClasses = 'px-4 py-3 text-base';
      break;
    default: // md
      sizeClasses = 'px-3 py-2 text-sm';
  }

  const baseClasses = `block w-full ${sizeClasses} border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`;
  
  return hasError
    ? `${baseClasses} border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500`
    : `${baseClasses} border-gray-300 focus:ring-yellow-500 focus:border-yellow-500`;
};

/**
 * Renvoie les classes CSS pour les labels de formulaire
 * @param {boolean} hasError - Si le champ associé contient une erreur
 * @returns {string} - Classes CSS correspondantes
 */
export const getLabelClass = (hasError = false) => {
  const baseClasses = 'block text-sm font-medium mb-1';
  
  return hasError
    ? `${baseClasses} text-red-700`
    : `${baseClasses} text-gray-700`;
};

/**
 * Renvoie les classes CSS pour les messages d'erreur de formulaire
 * @returns {string} - Classes CSS correspondantes
 */
export const getErrorMessageClass = () => {
  return 'mt-1 text-sm text-red-600';
};

/**
 * Renvoie les classes CSS pour les conteneurs de tableaux
 * @param {boolean} isCompact - Si le tableau est en mode compact
 * @returns {string} - Classes CSS pour le conteneur du tableau
 */
export const getTableContainerClass = (isCompact = false) => {
  return `overflow-x-auto rounded-lg shadow ${isCompact ? 'border border-gray-200' : ''}`;
};

/**
 * Renvoie les classes CSS pour le tableau lui-même
 * @param {boolean} isCompact - Si le tableau est en mode compact
 * @returns {string} - Classes CSS pour le tableau
 */
export const getTableClass = (isCompact = false) => {
  return `min-w-full divide-y divide-gray-200 ${isCompact ? 'text-sm' : ''}`;
};

/**
 * Renvoie les classes CSS pour l'en-tête du tableau
 * @param {boolean} isSticky - Si l'en-tête doit rester visible lors du défilement
 * @returns {string} - Classes CSS pour l'en-tête
 */
export const getTableHeaderClass = (isSticky = false) => {
  return `bg-gray-900 text-yellow-400 ${isSticky ? 'sticky top-0 z-10' : ''}`;
};

/**
 * Renvoie les classes CSS pour les cellules d'en-tête
 * @param {boolean} isSortable - Si la colonne est triable
 * @returns {string} - Classes CSS pour les cellules d'en-tête
 */
export const getTableHeaderCellClass = (isSortable = false) => {
  const baseClasses = 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider';
  const sortableClasses = isSortable ? 'cursor-pointer hover:bg-gray-800' : '';
  
  return `${baseClasses} ${sortableClasses}`;
};

/**
 * Renvoie les classes CSS pour les lignes du corps du tableau
 * @param {boolean} isEven - Si la ligne est paire
 * @param {boolean} isSelectable - Si la ligne est sélectionnable
 * @returns {string} - Classes CSS pour les lignes
 */
export const getTableRowClass = (isEven, isSelectable = false) => {
  const baseClasses = isEven ? 'bg-white' : 'bg-gray-50';
  const selectableClasses = isSelectable ? 'cursor-pointer hover:bg-yellow-50' : '';
  
  return `${baseClasses} ${selectableClasses}`;
};

/**
 * Renvoie les classes CSS pour les cellules du corps du tableau
 * @param {boolean} isHighlighted - Si la cellule doit être mise en évidence
 * @returns {string} - Classes CSS pour les cellules
 */
export const getTableCellClass = (isHighlighted = false) => {
  const baseClasses = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
  const highlightedClasses = isHighlighted ? 'font-medium bg-yellow-50' : '';
  
  return `${baseClasses} ${highlightedClasses}`;
};

/**
 * Renvoie les classes CSS pour les conteneurs de section
 * @returns {string} - Classes CSS pour les conteneurs de section
 */
export const getSectionContainerClass = () => {
  return 'mb-8';
};

/**
 * Renvoie les classes CSS pour les titres de section
 * @param {string} size - Taille du titre (sm, md, lg, xl)
 * @returns {string} - Classes CSS pour les titres de section
 */
export const getSectionTitleClass = (size = 'lg') => {
  const baseClasses = 'font-bold text-gray-900 mb-4';
  
  switch (size) {
    case 'sm':
      return `${baseClasses} text-base`;
    case 'md':
      return `${baseClasses} text-lg`;
    case 'lg':
      return `${baseClasses} text-xl`;
    case 'xl':
      return `${baseClasses} text-2xl`;
    default:
      return `${baseClasses} text-lg`;
  }
};

/**
 * Renvoie les classes CSS pour les statistiques
 * @param {string} variant - Variante de statistique (default, positive, negative, warning)
 * @returns {string} - Classes CSS pour les statistiques
 */
export const getStatClass = (variant = 'default') => {
  const baseClasses = 'font-bold text-3xl';
  
  switch (variant) {
    case 'positive':
      return `${baseClasses} text-lime-600`;
    case 'negative':
      return `${baseClasses} text-red-600`;
    case 'warning':
      return `${baseClasses} text-amber-600`;
    case 'highlight':
      return `${baseClasses} text-yellow-600`;
    default:
      return `${baseClasses} text-gray-900`;
  }
};

/**
 * Renvoie les classes CSS pour les libellés de statistiques
 * @returns {string} - Classes CSS pour les libellés de statistiques
 */
export const getStatLabelClass = () => {
  return 'text-sm text-gray-500 font-medium';
};

/**
 * Renvoie les classes CSS pour les tooltips
 * @returns {string} - Classes CSS pour les tooltips
 */
export const getTooltipClass = () => {
  return 'absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm';
};

/**
 * Renvoie les classes CSS pour les séparateurs
 * @param {string} variant - Variante du séparateur (default, yellow)
 * @returns {string} - Classes CSS pour les séparateurs
 */
export const getDividerClass = (variant = 'default') => {
  const baseClasses = 'my-6 border-t';
  
  switch (variant) {
    case 'yellow':
      return `${baseClasses} border-yellow-300`;
    default:
      return `${baseClasses} border-gray-200`;
  }
};

/**
 * Renvoie les classes CSS pour le conteneur d'application principal
 * @returns {string} - Classes CSS pour le conteneur d'application
 */
export const getAppContainerClass = () => {
  return 'flex flex-col min-h-screen bg-gray-50';
};

/**
 * Renvoie les classes CSS pour le conteneur principal
 * @returns {string} - Classes CSS pour le conteneur principal
 */
export const getMainContainerClass = () => {
  return 'flex-grow p-6';
};

/**
 * Renvoie les classes CSS pour les panneaux de filtre
 * @param {boolean} isExpanded - Si le panneau est déplié
 * @returns {string} - Classes CSS pour les panneaux de filtre
 */
export const getFilterPanelClass = (isExpanded = true) => {
  const baseClasses = 'bg-white rounded-lg shadow-md border-l-4 border-yellow-400 mb-6 transition-all duration-200';
  const expandedClasses = isExpanded ? 'p-6' : 'p-4';
  
  return `${baseClasses} ${expandedClasses}`;
};