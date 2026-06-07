import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import { MotiView } from 'moti';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Diagnostico, Causa } from '@/data/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface CausaConfig {
  label: string;
  icon: IconName;
  color: (c: AppColors) => string;
  acao: string;
  vibrar: boolean;
}

const CAUSA_CONFIG: Record<Causa, CausaConfig> = {
  SUJEIRA:        { label: 'Sujeira',        icon: 'cloud',            color: (c) => c.accent,     acao: 'VIBRAÇÃO ACIONADA', vibrar: true  },
  SOMBRA:         { label: 'Sombra',          icon: 'partly-sunny',     color: (c) => c.accentBlue, acao: 'AGUARDANDO',        vibrar: false },
  DANO_FISICO:    { label: 'Dano Físico',     icon: 'warning',          color: (c) => c.danger,     acao: 'NÃO VIBRAR',        vibrar: false },
  FALHA_ELETRICA: { label: 'Falha Elétrica',  icon: 'flash-off',        color: (c) => c.warning,    acao: 'CHAMAR TÉCNICO',    vibrar: false },
  AMBIENTAL:      { label: 'Ambiental',       icon: 'thermometer',      color: (c) => c.textMuted,  acao: 'SEM AÇÃO',          vibrar: false },
  SEM_FALHA:      { label: 'Normal',          icon: 'checkmark-circle', color: (c) => c.success,    acao: 'OPERANDO',          vibrar: false },
};

interface Props {
  diagnostico: Diagnostico;
  eficiencia?: number;
}

export default function DiagnosticoCard({ diagnostico, eficiencia }: Props) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);

  const config = CAUSA_CONFIG[diagnostico.causa];
  const accentColor = config.color(colors);
  const confiancaPct = Math.round(diagnostico.confianca * 100);
  const eficienciaPct = eficiencia != null ? Math.round(eficiencia * 100) : null;

  const ringColor = useMemo(() => {
    if (eficiencia == null) return accentColor;
    if (eficiencia >= 0.85) return colors.success;
    if (eficiencia >= 0.6)  return colors.warning;
    return colors.danger;
  }, [eficiencia, accentColor, colors]);

  return (
    <View style={[s.card, { borderLeftColor: accentColor }]}>
      <View style={s.header}>
        <View style={[s.iconWrap, { backgroundColor: accentColor + '20' }]}>
          <Ionicons name={config.icon} size={20} color={accentColor} />
        </View>

        <View style={s.headerInfo}>
          <Text style={s.ativoId}>{diagnostico.ativoId}</Text>
          <Text style={[s.causa, { color: accentColor }]}>{config.label}</Text>
          {config.vibrar ? (
            <MotiView
              style={[s.acaoBadge, { backgroundColor: accentColor + '18', borderColor: accentColor + '44' }]}
              from={{ opacity: 0.55 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 900, loop: true, repeatReverse: true }}
            >
              <Text style={[s.acaoText, { color: accentColor }]}>{config.acao}</Text>
            </MotiView>
          ) : (
            <View style={[s.acaoBadge, { backgroundColor: accentColor + '18', borderColor: accentColor + '44' }]}>
              <Text style={[s.acaoText, { color: accentColor }]}>{config.acao}</Text>
            </View>
          )}
        </View>

        {eficienciaPct != null && (
          <View style={s.ringWrap}>
            <ProgressChart
              data={{ data: [eficiencia ?? 0] }}
              width={80}
              height={80}
              strokeWidth={8}
              radius={28}
              chartConfig={{
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                color: (opacity) => ringColor + Math.round(opacity * 255).toString(16).padStart(2, '0'),
              }}
              hideLegend
            />
            <View style={s.ringLabel}>
              <Text style={[s.ringValue, { color: ringColor }]}>{eficienciaPct}%</Text>
              <Text style={s.ringText}>efic.</Text>
            </View>
          </View>
        )}
      </View>

      <View style={s.body}>
        <View style={s.confiancaRow}>
          <Text style={s.confiancaLabel}>Confiança do diagnóstico</Text>
          <Text style={[s.confiancaValor, { color: accentColor }]}>{confiancaPct}%</Text>
        </View>
        <View style={s.barBg}>
          <View style={[s.barFill, { flexBasis: `${confiancaPct}%`, backgroundColor: accentColor }]} />
        </View>

        <View style={s.evidencias}>
          {diagnostico.evidencias.map((ev) => (
            <View key={ev} style={s.chip}>
              <Text style={s.chipText}>{ev.replace(/_/g, ' ')}</Text>
            </View>
          ))}
        </View>
      </View>

      {!config.vibrar && diagnostico.causa !== 'SEM_FALHA' && diagnostico.causa !== 'AMBIENTAL' && (
        <View style={s.alertaBloqueio}>
          <Ionicons name="ban" size={12} color={colors.danger} />
          <Text style={s.alertaBloqueioText}>Vibração bloqueada — causa não é sujeira</Text>
        </View>
      )}
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      overflow: 'hidden',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      paddingBottom: 10,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerInfo: {
      flex: 1,
      gap: 4,
    },
    ativoId: {
      ...Typography.caption,
      color: colors.textMuted,
      letterSpacing: 1,
    },
    causa: {
      ...Typography.subheading,
    },
    acaoBadge: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: 'flex-start',
    },
    acaoText: {
      ...Typography.caption,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    ringWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    ringLabel: {
      position: 'absolute',
      alignItems: 'center',
    },
    ringValue: {
      fontSize: 13,
      fontWeight: '800',
    },
    ringText: {
      ...Typography.caption,
      color: colors.textMuted,
      fontSize: 9,
    },
    body: {
      paddingHorizontal: 14,
      paddingBottom: 12,
    },
    confiancaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    confiancaLabel: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    confiancaValor: {
      ...Typography.caption,
      fontWeight: '700',
    },
    barBg: {
      height: 4,
      backgroundColor: colors.surfaceElevated,
      borderRadius: 2,
      marginBottom: 10,
      flexDirection: 'row',
    },
    barFill: {
      height: 4,
      borderRadius: 2,
    },
    evidencias: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    chip: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    alertaBloqueio: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.danger + '12',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.danger + '30',
    },
    alertaBloqueioText: {
      ...Typography.caption,
      color: colors.danger,
      fontWeight: '600',
    },
  });
