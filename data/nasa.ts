export interface SolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string | null;
  classType?: string;
  sourceLocation?: string;
  activeRegionNum: number | null;
  link: string;
}

export interface ClimaEspacial {
  ultimaErupcao: SolarFlare | null;
  totalErupcoes: number;
  nivelRisco: 'BAIXO' | 'MODERADO' | 'ALTO';
  periodoConsultado: string;
}

const NASA_BASE = 'https://api.nasa.gov/DONKI/FLR';
const API_KEY = 'DEMO_KEY';
const TIMEOUT_MS = 8000;

function classificarRisco(flares: SolarFlare[]): ClimaEspacial['nivelRisco'] {
  const temClasseX = flares.some((f) => f.classType?.startsWith('X'));
  const temClasseM = flares.some((f) => f.classType?.startsWith('M'));
  if (temClasseX) return 'ALTO';
  if (temClasseM) return 'MODERADO';
  return 'BAIXO';
}

function formatarData(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchClimaEspacial(signal?: AbortSignal): Promise<ClimaEspacial> {
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 30);

  const url = `${NASA_BASE}?startDate=${formatarData(inicio)}&endDate=${formatarData(fim)}&api_key=${API_KEY}`;

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);
  if (signal) {
    signal.addEventListener('abort', () => timeoutController.abort(), { once: true });
  }

  try {
    const res = await fetch(url, { signal: timeoutController.signal });
    if (!res.ok) {
      throw new Error(`NASA API retornou ${res.status}`);
    }

    const flares: SolarFlare[] = await res.json();
    const ordenadas = [...flares].sort(
      (a, b) => new Date(b.peakTime).getTime() - new Date(a.peakTime).getTime()
    );

    return {
      ultimaErupcao: ordenadas[0] ?? null,
      totalErupcoes: flares.length,
      nivelRisco: classificarRisco(flares),
      periodoConsultado: `${formatarData(inicio)} a ${formatarData(fim)}`,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Tempo de conexão esgotado com a NASA');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
