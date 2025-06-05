import React, { createContext, useState, useContext } from 'react';

const ErrorContext = createContext();

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const triggerError = () => setHasError(true);
  const resetError = () => setHasError(false);

  return (
    <ErrorContext.Provider value={{ hasError, triggerError, resetError }}>
      {children}
    </ErrorContext.Provider>
  );
};