import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'dark' | 'light';

const PREFS_KEY = '@helios:preferencias';

interface ThemeContextData {
  theme: Theme;
  toggleTheme: () => void;
  intervalo: number;
  setIntervalo: (v: number) => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [intervalo, setIntervaloState] = useState(60);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.tema) setTheme(prefs.tema);
        if (prefs.intervalo) setIntervaloState(prefs.intervalo);
      }
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.getItem(PREFS_KEY).then((raw) => {
        const prefs = raw ? JSON.parse(raw) : {};
        AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, tema: next }));
      });
      return next;
    });
  }, []);

  const setIntervalo = useCallback(async (value: number) => {
    setIntervaloState(value);
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, intervalo: value }));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, intervalo, setIntervalo }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
