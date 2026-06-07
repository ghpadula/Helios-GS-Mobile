import { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useClimaEspacial } from '@/hooks/useClimaEspacial';
import { formatRelativeTime } from '@/utils/time';
import { ClimaEspacial } from '@/data/nasa';

const RISCO_CONFIG: Record<ClimaEspacial['nivelRisco'], { color: (c: AppColors) => string; label: string }> = {
  BAIXO:    { color: (c) => c.success, label: 'Baixo' },
  MODERADO: { color: (c) => c.warning, label: 'Moderado' },
  ALTO:     { color: (c) => c.danger,  label: 'Alto' },
};

export default function ClimaEspacialCard() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);
  const { clima, loading, error, refetch } = useClimaEspacial();

  if (loading) {
    return (
      <View style={[s.card, s.centered]}>
        <ActivityIndicator color={colors.accent} />
        <Text style={s.loadingText}>Consultando a NASA...</Text>
      </View>
    );
  }

  if (error || !clima) {
    return (
      <TouchableOpacity style={[s.card, s.centered]} onPress={refetch} activeOpacity={0.8}>
        <Ionicons name="cloud-offline-outline" size={24} color={colors.textMuted} />
        <Text style={s.loadingText}>{error ?? 'Sem dados da NASA'}</Text>
        <Text style={s.retry}>Toque para tentar novamente</Text>
      </TouchableOpacity>
    );
  }

  const risco = RISCO_CONFIG[clima.nivelRisco];
  const riscoColor = risco.color(colors);
  const flare = clima.ultimaErupcao;

  return (
    <View style={[s.card, { borderLeftColor: riscoColor }]}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Ionicons name="sunny" size={18} color={colors.accent} />
          <Text style={s.title}>Clima Espacial</Text>
          <View style={s.nasaBadge}>
            <Text style={s.nasaText}>NASA · ao vivo</Text>
          </View>
        </View>
        <View style={[s.riscoBadge, { backgroundColor: riscoColor + '18', borderColor: riscoColor + '44' }]}>
          <Text style={[s.riscoText, { color: riscoColor }]}>Risco {risco.label}</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={[s.statNum, { color: colors.accent }]}>{clima.totalErupcoes}</Text>
          <Text style={s.statLabel}>erupções (30d)</Text>
        </View>
        {flare && (
          <View style={s.stat}>
            <Text style={[s.statNum, { color: riscoColor }]}>{flare.classType}</Text>
            <Text style={s.statLabel}>última classe</Text>
          </View>
        )}
        {flare?.sourceLocation && (
          <View style={s.stat}>
            <Text style={[s.statNum, { color: colors.textSecondary }]}>{flare.sourceLocation}</Text>
            <Text style={s.statLabel}>localização</Text>
          </View>
        )}
      </View>

      {flare && (
        <Text style={s.footer}>
          Última erupção solar {formatRelativeTime(flare.peakTime)}
        </Text>
      )}

      <Text style={s.periodo}>Período monitorado: {clima.periodoConsultado}</Text>

      <Text style={s.context}>
        Erupções solares afetam a geração e a eletrônica dos painéis na Lua — o HÉLIOS considera esse risco.
      </Text>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 120,
    },
    loadingText: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    retry: {
      ...Typography.caption,
      color: colors.accent,
      fontWeight: '700',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      ...Typography.label,
      color: colors.text,
    },
    nasaBadge: {
      backgroundColor: colors.accentBlue + '20',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    nasaText: {
      ...Typography.caption,
      color: colors.accentBlue,
      fontWeight: '700',
      fontSize: 9,
    },
    riscoBadge: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    riscoText: {
      ...Typography.caption,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 20,
      marginBottom: 12,
    },
    stat: {
      alignItems: 'flex-start',
    },
    statNum: {
      fontSize: 22,
      fontWeight: '800',
    },
    statLabel: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    footer: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    periodo: {
      ...Typography.caption,
      color: colors.textMuted,
      marginBottom: 8,
    },
    context: {
      ...Typography.caption,
      color: colors.textMuted,
      lineHeight: 16,
      fontStyle: 'italic',
    },
  });
