// src/components/common/DataTable.js
import React, { useState } from 'react';
import { getTableContainerClass, getTableClass, getTableHeaderClass, getTableHeaderCellClass, getTableRowClass, getTableCellClass, getButtonClass } from '../../utils/styleUtils';

const DataTable = ({ 
  data = [], 
  columns = [], 
  onRowClick, 
  pageSize = 10,
  enableSorting = true,
  defaultSort = null,
  isCompact = false
}) => {
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // État pour le tri
  const [sortConfig, setSortConfig] = useState(defaultSort || {
    key: null,
    direction: 'asc'
  });

  // Fonction pour trier les données
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !enableSorting) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  }, [data, sortConfig.key, sortConfig.direction, enableSorting]);
  
  // Fonction pour changer le tri
  const requestSort = (key) => {
    if (!enableSorting) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Calcul des données pour la page courante
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);
  
  // Nombre total de pages
  const totalPages = Math.ceil(data.length / pageSize);
  
  // Fonction pour changer de page
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  // Si pas de données, afficher un message
  if (data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  // Rendu du tableau avec pagination
  return (
    <div className="custom-scrollbar">
      <div className={getTableContainerClass(isCompact)}>
        <table className={getTableClass(isCompact)}>
          <thead className={getTableHeaderClass(true)}>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={getTableHeaderCellClass(enableSorting)}
                  onClick={() => column.accessor && requestSort(column.accessor)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {enableSorting && sortConfig.key === column.accessor && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={getTableRowClass(rowIndex % 2 === 0, !!onRowClick)}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={getTableCellClass()}>
                    {column.cellRenderer 
                      ? column.cellRenderer(row[column.accessor], row)
                      : row[column.accessor] || column.defaultValue || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> à{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, data.length)}
              </span>{' '}
              sur <span className="font-medium">{data.length}</span> résultats
            </p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={getButtonClass('secondary', currentPage === 1, 'sm')}
            >
              Précédent
            </button>
            
            {/* Affichage des numéros de page */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              // Logique pour afficher les pages autour de la page courante
              let pageNum;
              
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }
              
              const isActive = currentPage === pageNum;
              
              return (
                <button
                  key={index}
                  onClick={() => goToPage(pageNum)}
                  className={getButtonClass(isActive ? 'primary' : 'outline', false, 'sm')}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={getButtonClass('secondary', currentPage === totalPages, 'sm')}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;