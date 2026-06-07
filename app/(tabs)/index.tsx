import { useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity, Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import SensorCard from '@/components/SensorCard';
import DiagnosticoCard from '@/components/DiagnosticoCard';
import SkeletonCard from '@/components/SkeletonCard';
import AnimatedNumber from '@/components/AnimatedNumber';
import ClimaEspacialCard from '@/components/ClimaEspacialCard';
import StarfieldBackground from '@/components/StarfieldBackground';
import FadeInView from '@/components/FadeInView';
import { formatHourMin } from '@/utils/time';

const { width: SW } = Dimensions.get('window');

export default function EnergiaScreen() {
  const { leituras, diagnosticos, historicoEnergia, refreshData, loading, error } = useData();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);

  const [refreshing, setRefreshing] = useState(false);

  const leituraCorrente  = useMemo(() => leituras.find((l) => l.tipo === 'corrente'),    [leituras]);
  const leituraTemp      = useMemo(() => leituras.find((l) => l.tipo === 'temperatura'), [leituras]);
  const leiturasPotencia = useMemo(() => leituras.filter((l) => l.tipo === 'potencia'),  [leituras]);

  const perdaAtual = useMemo(() => {
    const ul = leiturasPotencia[0];
    return ul?.esperado ? (1 - ul.valor / ul.esperado) * 100 : 0;
  }, [leiturasPotencia]);

  const eficiencias = useMemo(() => {
    const map: Record<string, number> = {};
    leiturasPotencia.forEach((l) => {
      if (l.esperado) map[l.ativoId] = l.valor / l.esperado;
    });
    return map;
  }, [leiturasPotencia]);

  const chartLabels = useMemo(
    () => historicoEnergia.map((p) => formatHourMin(p.timestamp)),
    [historicoEnergia]
  );
  const chartReal     = useMemo(() => historicoEnergia.map((p) => p.real),     [historicoEnergia]);
  const chartEsperado = useMemo(() => historicoEnergia.map((p) => p.esperado), [historicoEnergia]);

  const chartSubtitle = useMemo(() => {
    const ativoIds = [...new Set(leiturasPotencia.map((l) => l.ativoId))];
    return ativoIds.length > 0 ? `${ativoIds.join(', ')} · últimas leituras` : 'últimas leituras';
  }, [leiturasPotencia]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <View style={s.wrapper}>
      <StarfieldBackground count={45} opacity={0.3} />
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {error && (
          <TouchableOpacity style={s.errorBanner} onPress={refreshData} activeOpacity={0.8}>
            <Ionicons name="warning-outline" size={16} color={colors.danger} />
            <Text style={s.errorText}>{error}</Text>
            <Text style={s.errorRetry}>Tentar novamente</Text>
          </TouchableOpacity>
        )}

        <Text style={s.sectionTitle}>Geração de Energia</Text>

        {loading ? (
          <SkeletonCard height={220} borderRadius={14} />
        ) : historicoEnergia.length > 0 ? (
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <View>
                <Text style={s.chartTitle}>Real vs Esperado</Text>
                <Text style={s.chartSub}>{chartSubtitle}</Text>
              </View>
              <View style={[s.perdaBadge, { borderColor: perdaAtual > 20 ? colors.danger : colors.warning }]}>
                <AnimatedNumber
                  value={perdaAtual}
                  decimals={1}
                  prefix="-"
                  suffix="%"
                  style={[s.perdaValor, { color: perdaAtual > 20 ? colors.danger : colors.warning }]}
                />
                <Text style={[s.perdaLabel, { color: perdaAtual > 20 ? colors.danger : colors.warning }]}>
                  perda
                </Text>
              </View>
            </View>

            <LineChart
              data={{
                labels: chartLabels,
                datasets: [
                  { data: chartReal,     color: () => colors.danger,     strokeWidth: 2 },
                  { data: chartEsperado, color: () => colors.accentBlue, strokeWidth: 2 },
                ],
                legend: ['Real (W)', 'Esperado (W)'],
              }}
              width={SW - 64}
              height={180}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: () => colors.textMuted,
                labelColor: () => colors.textMuted,
                propsForDots: { r: '3', strokeWidth: '1', stroke: colors.border },
                propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
                fillShadowGradient: colors.danger,
                fillShadowGradientOpacity: 0.15,
              }}
              bezier
              style={{ borderRadius: 8 }}
              withInnerLines
              withOuterLines={false}
            />

            <View style={s.legendRow}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: colors.danger }]} />
                <Text style={s.legendText}>Real</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: colors.accentBlue }]} />
                <Text style={s.legendText}>Esperado</Text>
              </View>
            </View>
          </View>
        ) : null}

        <Text style={s.sectionTitle}>Diagnóstico por Painel</Text>

        {loading ? (
          <>
            <SkeletonCard height={160} borderRadius={14} />
            <SkeletonCard height={160} borderRadius={14} />
          </>
        ) : (
          diagnosticos.map((d, i) => (
            <FadeInView key={d.ativoId} delay={i * 120}>
              <DiagnosticoCard
                diagnostico={d}
                eficiencia={eficiencias[d.ativoId]}
              />
            </FadeInView>
          ))
        )}

        <Text style={s.sectionTitle}>Contexto Ambiental</Text>

        <FadeInView>
          <ClimaEspacialCard />
        </FadeInView>

        <Text style={s.sectionTitle}>Sensores Secundários</Text>

        {loading ? (
          <>
            <SkeletonCard height={58} borderRadius={12} />
            <SkeletonCard height={58} borderRadius={12} />
          </>
        ) : (
          <>
            {leituraCorrente && <SensorCard leitura={leituraCorrente} horizontal />}
            {leituraTemp     && <SensorCard leitura={leituraTemp}     horizontal />}
            {leiturasPotencia.map((l) => (
              <SensorCard key={l.sensorId} leitura={l} horizontal />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.danger + '18',
      borderWidth: 1,
      borderColor: colors.danger + '44',
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
    },
    errorText: {
      ...Typography.caption,
      color: colors.danger,
      flex: 1,
    },
    errorRetry: {
      ...Typography.caption,
      color: colors.danger,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
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
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    chartTitle: {
      ...Typography.label,
      color: colors.text,
    },
    chartSub: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    perdaBadge: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignItems: 'center',
    },
    perdaValor: {
      fontSize: 18,
      fontWeight: '800',
    },
    perdaLabel: {
      ...Typography.caption,
      fontWeight: '600',
    },
    legendRow: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      ...Typography.caption,
      color: colors.textMuted,
    },
  });
