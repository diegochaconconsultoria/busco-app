// src/contexts/CityContext.js
import React, { createContext, useState } from 'react';

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState({ id: 'jau', name: 'Jaú' });
  
  // Lista de cidades disponíveis (para expansão futura)
  const availableCities = [
    { id: 'jau', name: 'Jaú' },
    // Para expansão futura:
    // { id: 'bauru', name: 'Bauru' },
    // { id: 'botucatu', name: 'Botucatu' },
  ];
  
  const changeCity = (cityId) => {
    const city = availableCities.find(c => c.id === cityId);
    if (city) {
      setCurrentCity(city);
    }
  };

  return (
    <CityContext.Provider
      value={{
        currentCity,
        availableCities,
        changeCity
      }}
    >
      {children}
    </CityContext.Provider>
  );
};