// import { createContext, useContext, useState, useEffect} from 'react'

// const ThemeContext = createContext()

// export const useTheme = () => {
//   const context = useContext(ThemeContext)
//   if (!context) {
//     throw new Error('useTheme must be used within ThemeProvider')
//   }
//   return context
// }

// export const ThemeProvider = ({ children }) => {
//  const [darkMode, setDarkMode] = useState(() => {
//   const savedTheme = localStorage.getItem('darkMode')
//   return savedTheme !== null ? JSON.parse(savedTheme) : true
// })


//   useEffect(() => {
//     // Update the class on the html element
//     if (darkMode) {
//       document.documentElement.classList.add('dark')
//     } else {
//       document.documentElement.classList.remove('dark')
//     }
    
//     // Save preference to localStorage
//     localStorage.setItem('darkMode', JSON.stringify(darkMode))
    
//     // Set the theme-color meta tag for mobile browsers
//     const themeColor = darkMode ? '#1f2937' : '#f9fafb'
//     document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)
    
//     // Listen for system theme changes
//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
//     const handleChange = (e) => {
//       // Only update if user hasn't set a preference
//       if (localStorage.getItem('darkMode') === null) {
//         setDarkMode(e.matches)
//       }
//     }
    
//     mediaQuery.addEventListener('change', handleChange)
//     return () => mediaQuery.removeEventListener('change', handleChange)
//   }, [darkMode])

//   const toggleDarkMode = () => setDarkMode(!darkMode)

//   return (
//     <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
//       {children}
//     </ThemeContext.Provider>
//   )
// }







import { createContext, useContext, useEffect, useState } from "react";

// Create Context
const ThemeContext = createContext(null);

// Custom Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Theme Provider
export const ThemeProvider = ({ children }) => {

  // 👉 Default DARK mode
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });

  useEffect(() => {
    // Add / Remove dark class
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    // Mobile browser theme color
    const themeColor = darkMode ? "#111827" : "#f9fafb";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", themeColor);

  }, [darkMode]);

  // Toggle function
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};


