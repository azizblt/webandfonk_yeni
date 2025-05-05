import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => setDarkMode(!darkMode);

  const theme = {
    darkMode,
    toggleTheme,
    colors: {
      primary: '#C97C30',
      background: darkMode ? '#1A1A1A' : '#F9F9F9',
      text: darkMode ? '#FFFFFF' : '#000000',
      input: darkMode ? '#333333' : '#FFFFFF',
      border: darkMode ? '#555555' : '#CCCCCC',
      button: '#C97C30',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
