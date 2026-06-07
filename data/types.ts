export type TipoSensor = 'potencia' | 'corrente' | 'temperatura' | 'poeira';

export type Causa =
  | 'SUJEIRA'
  | 'SOMBRA'
  | 'DANO_FISICO'
  | 'FALHA_ELETRICA'
  | 'AMBIENTAL'
  | 'SEM_FALHA';

export interface Leitura {
  sensorId: string;
  tipo: TipoSensor;
  valor: number;
  esperado?: number;
  unidade: string;
  ativoId: string;
  timestamp: string;
}

export interface GrauSujeira {
  ativoId: string;
  grauSujeira: number;
  fonte: 'visao' | 'sensor';
  timestamp: string;
}

export interface Diagnostico {
  ativoId: string;
  causa: Causa;
  confianca: number;
  evidencias: string[];
  timestamp: string;
}

export interface Alerta {
  alertId: string;
  ativoId: string;
  severidade: 'ALTA' | 'MEDIA' | 'BAIXA';
  tipo: string;
  mensagem: string;
  timestamp: string;
  resolvido: boolean;
}

export interface ComandoLimpeza {
  comandoId: string;
  atuadorId: string;
  acao: 'VIBRAR' | 'PARAR';
  intensidade: number;
  duracaoSeg: number;
  alvoAtivoId: string;
  timestamp: string;
  energiaRecuperada?: number;
}

export interface PontoEnergia {
  timestamp: string;
  real: number;
  esperado: number;
}
