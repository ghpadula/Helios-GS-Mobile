import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Leitura, GrauSujeira, Alerta, ComandoLimpeza, Diagnostico, PontoEnergia } from '@/data/types';
import mockData from '@/data/mock.json';

interface DataContextData {
  leituras: Leitura[];
  grauSujeira: GrauSujeira[];
  diagnosticos: Diagnostico[];
  alertas: Alerta[];
  comandos: ComandoLimpeza[];
  historicoEnergia: PontoEnergia[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextData>({} as DataContextData);

export function DataProvider({ children }: { children: ReactNode }) {
  const [leituras, setLeituras]                 = useState<Leitura[]>([]);
  const [grauSujeira, setGrauSujeira]           = useState<GrauSujeira[]>([]);
  const [diagnosticos, setDiagnosticos]         = useState<Diagnostico[]>([]);
  const [alertas, setAlertas]                   = useState<Alerta[]>([]);
  const [comandos, setComandos]                 = useState<ComandoLimpeza[]>([]);
  const [historicoEnergia, setHistoricoEnergia] = useState<PontoEnergia[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setLeituras(mockData.leituras as Leitura[]);
      setGrauSujeira(mockData.grauSujeira as GrauSujeira[]);
      setDiagnosticos(mockData.diagnosticos as Diagnostico[]);
      setAlertas(mockData.alertas as Alerta[]);
      setComandos(mockData.comandos as ComandoLimpeza[]);
      setHistoricoEnergia(mockData.historicoEnergia as PontoEnergia[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  return (
    <DataContext.Provider value={{
      leituras, grauSujeira, diagnosticos, alertas,
      comandos, historicoEnergia, loading, error, refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
