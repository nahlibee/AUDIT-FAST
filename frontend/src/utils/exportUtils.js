/**
 * Exporte des données au format CSV
 * @param {Array} data - Données à exporter
 * @param {string} filename - Nom du fichier
 * @returns {void}
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.error("Aucune donnée à exporter");
    return;
  }
  
  let csvContent = '';
  
  // Entêtes
  const headers = Object.keys(data[0]);
  csvContent += headers.join(',') + '\n';
  
  // Données
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      // Gérer les valeurs spéciales (objets, tableaux, etc.)
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      } else if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }
    });
    csvContent += row.join(',') + '\n';
  });
  
  // Créer et télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exporte un rapport au format JSON
 * @param {Object} report - Données du rapport
 * @param {string} date - Date du rapport (format YYYY-MM-DD)
 * @returns {void}
 */
export const exportReportToJSON = (report, date) => {
  if (!report) {
    console.error("Aucun rapport à exporter");
    return;
  }
  
  const reportBlob = new Blob(
    [JSON.stringify(report, null, 2)], 
    { type: 'application/json' }
  );
  
  const url = URL.createObjectURL(reportBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rapport_audit_sap_${date}.json`;
  link.click();
  
  // Nettoyer
  URL.revokeObjectURL(url);
};

/**
 * Formate un tableau de données pour l'exportation
 * @param {Array} data - Données brutes
 * @param {Array} columns - Colonnes à inclure
 * @returns {Array} - Données formatées pour l'exportation
 */
export const formatDataForExport = (data, columns) => {
  if (!data || !columns || !Array.isArray(data) || !Array.isArray(columns)) {
    return [];
  }
  
  return data.map(item => {
    const formattedItem = {};
    
    columns.forEach(column => {
      if (typeof column === 'string') {
        formattedItem[column] = item[column];
      } else if (typeof column === 'object' && column.key && column.formatter) {
        formattedItem[column.label || column.key] = column.formatter(item[column.key], item);
      }
    });
    
    return formattedItem;
  });
};

/**
 * Convertit un objet en format CSV
 * @param {Object} obj - Objet à convertir
 * @returns {string} - Contenu CSV
 */
export const objectToCSV = (obj) => {
  // Aplatir l'objet pour convertir les propriétés imbriquées
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? `${prefix}_` : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
      } else {
        acc[`${pre}${key}`] = obj[key];
      }
      return acc;
    }, {});
  };
  
  const flatObj = flattenObject(obj);
  const headers = Object.keys(flatObj);
  const values = Object.values(flatObj).map(val => {
    if (Array.isArray(val)) {
      return `"${val.join('; ')}"`;
    } else if (typeof val === 'string') {
      return `"${val.replace(/"/g, '""')}"`;
    } else {
      return val;
    }
  });
  
  return headers.join(',') + '\n' + values.join(',');
};