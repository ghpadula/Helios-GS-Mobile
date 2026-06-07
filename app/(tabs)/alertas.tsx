import { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import AlertItem from '@/components/AlertItem';
import StarfieldBackground from '@/components/StarfieldBackground';
import { Alerta } from '@/data/types';

const { width: SW } = Dimensions.get('window');

type Filtro = 'todos' | 'pendentes' | 'resolvidos';

const STORAGE_KEY = '@helios:alertas_lidos';
const TIPOS_GRAFICO = ['Sujeira', 'Dano', 'Ambiental', 'Elétrica'];

export default function AlertasScreen() {
  const { alertas } = useData();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);

  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [lidos, setLidos] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setLidos(JSON.parse(raw));
    });
  }, []);

  const reconhecer = useCallback(async (alertId: string) => {
    setLidos((prev) => {
      const novos = [...new Set([...prev, alertId])];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novos));
      return novos;
    });
  }, []);

  const contadores = useMemo(() => ({
    alta:  alertas.filter((a) => a.severidade === 'ALTA').length,
    media: alertas.filter((a) => a.severidade === 'MEDIA').length,
    baixa: alertas.filter((a) => a.severidade === 'BAIXA').length,
  }), [alertas]);

  const graficoDados = useMemo(() => [
    alertas.filter((a) => a.tipo.includes('SUJEIRA')).length,
    alertas.filter((a) => a.tipo.includes('DANO')).length,
    alertas.filter((a) => a.tipo.includes('AMBIENTAL')).length,
    alertas.filter((a) => a.tipo.includes('ELETRICA') || a.tipo.includes('ELÉTRICA')).length,
  ], [alertas]);

  const alertasComStatus = useMemo<(Alerta & { lido: boolean })[]>(
    () => alertas.map((a) => ({ ...a, lido: lidos.includes(a.alertId) })),
    [alertas, lidos]
  );

  const filtrados = useMemo(() =>
    alertasComStatus.filter((a) => {
      if (filtro === 'pendentes') return !a.lido;
      if (filtro === 'resolvidos') return a.lido;
      return true;
    }),
    [alertasComStatus, filtro]
  );

  return (
    <View style={s.wrapper}>
      <StarfieldBackground count={40} opacity={0.28} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>

        <View style={s.resumo}>
          <View style={[s.badge, { borderColor: colors.danger }]}>
            <Text style={[s.badgeNum, { color: colors.danger }]}>{contadores.alta}</Text>
            <Text style={[s.badgeLabel, { color: colors.danger }]}>ALTA</Text>
          </View>
          <View style={[s.badge, { borderColor: colors.warning }]}>
            <Text style={[s.badgeNum, { color: colors.warning }]}>{contadores.media}</Text>
            <Text style={[s.badgeLabel, { color: colors.warning }]}>MÉDIA</Text>
          </View>
          <View style={[s.badge, { borderColor: colors.success }]}>
            <Text style={[s.badgeNum, { color: colors.success }]}>{contadores.baixa}</Text>
            <Text style={[s.badgeLabel, { color: colors.success }]}>BAIXA</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Alertas por Causa</Text>

        <View style={s.chartCard}>
          <BarChart
            data={{ labels: TIPOS_GRAFICO, datasets: [{ data: graficoDados }] }}
            width={SW - 64}
            height={160}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: () => colors.accent,
              labelColor: () => colors.textMuted,
              barPercentage: 0.6,
              propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
            }}
            style={{ borderRadius: 8 }}
            showValuesOnTopOfBars
            withInnerLines
            fromZero
          />
        </View>

        <Text style={s.sectionTitle}>Lista de Alertas</Text>

        <View style={s.filtros}>
          {(['todos', 'pendentes', 'resolvidos'] as Filtro[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filtroBtn, filtro === f && s.filtroBtnActive]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[s.filtroText, filtro === f && { color: colors.accent }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtrados.length === 0 ? (
          <Text style={s.empty}>Nenhum alerta nesta categoria.</Text>
        ) : (
          filtrados.map((alerta) => (
            <AlertItem
              key={alerta.alertId}
              alerta={alerta}
              lido={alerta.lido}
              onReconhecer={() => reconhecer(alerta.alertId)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },
    resumo: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    badge: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    badgeNum: { fontSize: 28, fontWeight: '900' },
    badgeLabel: { ...Typography.caption, fontWeight: '700', marginTop: 2 },
    sectionTitle: {
      ...Typography.sectionTitle,
      color: colors.textSecondary,
      marginTop: 24,
      marginBottom: 12,
    },
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    filtros: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      overflow: 'hidden',
    },
    filtroBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
    filtroBtnActive: { backgroundColor: colors.surfaceElevated },
    filtroText: { ...Typography.label, color: colors.textMuted },
    empty: { ...Typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 32 },
  });
