import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
      <p className="font-medium">Erreur:</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
