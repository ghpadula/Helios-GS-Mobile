import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchClimaEspacial, ClimaEspacial } from '@/data/nasa';

interface UseClimaEspacial {
  clima: ClimaEspacial | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClimaEspacial(): UseClimaEspacial {
  const [clima, setClima] = useState<ClimaEspacial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const montado = useRef(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await fetchClimaEspacial();
      if (montado.current) setClima(dados);
    } catch (err) {
      if (montado.current) {
        setError(err instanceof Error ? err.message : 'Falha ao consultar a NASA');
      }
    } finally {
      if (montado.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    refetch();
    return () => {
      montado.current = false;
    };
  }, [refetch]);

  return { clima, loading, error, refetch };
}
