import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [activeRiskFilter, setActiveRiskFilter] = useState(null);

  const toggleRiskFilter = (riskLevel) => {
    setActiveRiskFilter(prev => prev === riskLevel ? null : riskLevel);
  };

  const clearFilters = () => {
    setActiveRiskFilter(null);
  };

  return (
    <FilterContext.Provider value={{
      activeRiskFilter,
      setActiveRiskFilter,
      toggleRiskFilter,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
