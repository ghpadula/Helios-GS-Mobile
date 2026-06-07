import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Leitura } from '@/data/types';
import { formatHourMin } from '@/utils/time';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TIPO_CONFIG: Record<string, { icon: IconName; color: (c: AppColors) => string }> = {
  corrente:    { icon: 'flash',       color: (c) => c.accent },
  energia:     { icon: 'sunny',       color: (_) => '#f97316' },
  temperatura: { icon: 'thermometer', color: (c) => c.danger },
  poeira:      { icon: 'cloud',       color: (c) => c.textMuted },
};

interface Props {
  leitura: Leitura;
  horizontal?: boolean;
}

export default function SensorCard({ leitura, horizontal = false }: Props) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);

  const config = TIPO_CONFIG[leitura.tipo] ?? { icon: 'hardware-chip' as IconName, color: (c: AppColors) => c.textMuted };
  const accentColor = config.color(colors);

  const hora = formatHourMin(leitura.timestamp);

  if (horizontal) {
    return (
      <View style={s.horizontal}>
        <View style={[s.hIconWrap, { backgroundColor: accentColor + '18' }]}>
          <Ionicons name={config.icon} size={18} color={accentColor} />
        </View>
        <View style={s.hInfo}>
          <Text style={s.hLabel}>{leitura.sensorId}</Text>
          <Text style={s.hSub}>{leitura.ativoId} · {hora}</Text>
        </View>
        <View style={s.hValueWrap}>
          <Text style={[s.hValue, { color: accentColor }]}>{leitura.valor}</Text>
          <Text style={s.hUnit}>{leitura.unidade}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.card, { borderTopColor: accentColor }]}>
      <View style={s.cardHeader}>
        <View style={[s.iconWrap, { backgroundColor: accentColor + '18' }]}>
          <Ionicons name={config.icon} size={16} color={accentColor} />
        </View>
        <Text style={s.tipo}>{leitura.tipo.toUpperCase()}</Text>
      </View>
      <Text style={[s.valor, { color: accentColor }]}>{leitura.valor}</Text>
      <Text style={s.unidade}>{leitura.unidade}</Text>
      <View style={s.cardFooter}>
        <Text style={s.ativo}>{leitura.ativoId}</Text>
        <Text style={s.hora}>{hora}</Text>
      </View>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderTopWidth: 3,
      flex: 1,
      minWidth: '45%',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipo: {
      ...Typography.caption,
      color: colors.textMuted,
      letterSpacing: 1,
    },
    valor: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    unidade: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    ativo: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    hora: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    hIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hInfo: {
      flex: 1,
    },
    hLabel: {
      ...Typography.label,
      color: colors.textSecondary,
    },
    hSub: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    hValueWrap: {
      alignItems: 'flex-end',
    },
    hValue: {
      fontSize: 20,
      fontWeight: '800',
    },
    hUnit: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 1,
    },
  });
