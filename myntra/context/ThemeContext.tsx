import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_preference';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeMode && (savedThemeMode === 'light' || savedThemeMode === 'dark' || savedThemeMode === 'system')) {
          setThemeModeState(savedThemeMode as ThemeMode);
          
          // If saved mode is 'system', use device appearance, otherwise use saved preference
          if (savedThemeMode === 'system') {
            setTheme(systemColorScheme || 'light');
          } else {
            setTheme(savedThemeMode as 'light' | 'dark');
          }
        } else {
          // First load - default to system appearance
          setThemeModeState('system');
          setTheme(systemColorScheme || 'light');
        }
      } catch (error) {
        console.log('Error getting theme from AsyncStorage:', error);
        // Fallback to system appearance
        setThemeModeState('system');
        setTheme(systemColorScheme || 'light');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, []);

  // Update theme when system color scheme changes (only if mode is 'system')
  useEffect(() => {
    if (isInitialized && themeMode === 'system') {
      setTheme(systemColorScheme || 'light');
    }
  }, [systemColorScheme, themeMode, isInitialized]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      
      // Update theme based on mode
      if (mode === 'system') {
        setTheme(systemColorScheme || 'light');
      } else {
        setTheme(mode);
      }
    } catch (error) {
      console.log('Error saving theme to AsyncStorage:', error);
    }
  };

  const toggleTheme = async () => {
    // If currently in system mode, switch to manual mode
    let newThemeMode: ThemeMode;
    let newTheme: 'light' | 'dark';
    
    if (themeMode === 'system') {
      // Toggle from system to opposite of current system theme
      newTheme = systemColorScheme === 'dark' ? 'light' : 'dark';
      newThemeMode = newTheme;
    } else {
      // Toggle between light and dark
      newTheme = theme === 'light' ? 'dark' : 'light';
      newThemeMode = newTheme;
    }
    
    setThemeModeState(newThemeMode);
    setTheme(newTheme);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeMode);
    } catch (error) {
      console.log('Error saving theme to AsyncStorage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};