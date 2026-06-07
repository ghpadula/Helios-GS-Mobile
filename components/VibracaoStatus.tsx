import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { ComandoLimpeza } from '@/data/types';
import { formatRelativeTime } from '@/utils/time';

interface Props {
  comando: ComandoLimpeza;
  destaque?: boolean;
}

export default function VibracaoStatus({ comando, destaque = false }: Props) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);

  const statusLabel = comando.acao === 'VIBRAR' ? 'LIMPANDO' : 'PARADO';
  const statusColor = comando.acao === 'VIBRAR' ? colors.accent : colors.textMuted;
  const intensidadePct = Math.round(comando.intensidade * 100);

  if (destaque) {
    return (
      <View style={s.destaque}>
        <View style={[s.statusBadge, { borderColor: statusColor }]}>
          <Ionicons
            name={comando.acao === 'VIBRAR' ? 'radio-button-on' : 'radio-button-off'}
            size={14}
            color={statusColor}
          />
          <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        <View style={s.destaqueGrid}>
          <MetricBox label="Intensidade" value={`${intensidadePct}%`}   colors={colors} />
          <MetricBox label="Duração"     value={`${comando.duracaoSeg}s`} colors={colors} />
          <MetricBox label="Alvo"        value={comando.alvoAtivoId}     colors={colors} />
          <MetricBox label="Atuador"     value={comando.atuadorId.replace('VIB-', '')} colors={colors} />
        </View>

        {comando.energiaRecuperada != null && (
          <View style={s.energiaRow}>
            <Ionicons name="flash" size={14} color={colors.success} />
            <Text style={s.energiaText}>
              Energia recuperada:{' '}
              <Text style={[s.energiaValor, { color: colors.success }]}>
                +{comando.energiaRecuperada.toFixed(1)} W
              </Text>
            </Text>
          </View>
        )}

        <Text style={s.destaqueId}>
          {comando.comandoId} · {formatRelativeTime(comando.timestamp)}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.compact}>
      <View style={s.compactLeft}>
        <Ionicons name="flash" size={16} color={statusColor} />
        <View>
          <Text style={s.compactId}>{comando.comandoId}</Text>
          <Text style={s.compactMeta}>
            {comando.alvoAtivoId} · {formatRelativeTime(comando.timestamp)}
          </Text>
        </View>
      </View>
      <View style={s.compactRight}>
        <Text style={[s.compactStatus, { color: statusColor }]}>{statusLabel}</Text>
        <Text style={s.compactIntens}>{intensidadePct}% · {comando.duracaoSeg}s</Text>
        {comando.energiaRecuperada != null && (
          <Text style={[s.compactEnergia, { color: colors.success }]}>
            +{comando.energiaRecuperada.toFixed(1)} W
          </Text>
        )}
      </View>
    </View>
  );
}

function MetricBox({ label, value, colors }: { label: string; value: string; colors: AppColors }) {
  const s = useMemo(() => metricStyles(colors), [colors]);
  return (
    <View style={s.box}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

const metricStyles = (colors: AppColors) =>
  StyleSheet.create({
    box: {
      width: '47%',
      backgroundColor: colors.surfaceElevated,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      ...Typography.caption,
      color: colors.textMuted,
      marginBottom: 4,
    },
    value: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
  });

const styles = (colors: AppColors) =>
  StyleSheet.create({
    destaque: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start',
      marginBottom: 20,
    },
    statusText: {
      ...Typography.label,
      letterSpacing: 1,
    },
    destaqueGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    energiaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.success + '15',
      borderWidth: 1,
      borderColor: colors.success + '40',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginTop: 4,
    },
    energiaText: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    energiaValor: {
      fontWeight: '700',
    },
    destaqueId: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 12,
    },
    compact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    compactLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    compactId: {
      ...Typography.label,
      color: colors.text,
    },
    compactMeta: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    compactRight: {
      alignItems: 'flex-end',
    },
    compactStatus: {
      ...Typography.label,
    },
    compactIntens: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    compactEnergia: {
      ...Typography.caption,
      fontWeight: '700',
      marginTop: 2,
    },
  });
