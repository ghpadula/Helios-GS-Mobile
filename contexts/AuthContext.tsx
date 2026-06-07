import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@helios:session';

interface Operador {
  nome: string;
  rm: string;
}

interface AuthContextData {
  operador: Operador | null;
  loading: boolean;
  login: (nome: string, rm: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operador, setOperador] = useState<Operador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then((raw) => {
      if (raw) setOperador(JSON.parse(raw));
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (nome: string, rm: string) => {
    const sess: Operador = { nome, rm };
    setOperador(sess);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sess));
  }, []);

  const logout = useCallback(async () => {
    setOperador(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ operador, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
