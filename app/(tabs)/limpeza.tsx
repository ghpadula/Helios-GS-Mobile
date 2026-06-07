import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import VibracaoStatus from '@/components/VibracaoStatus';
import DiagnosticoCard from '@/components/DiagnosticoCard';
import SkeletonCard from '@/components/SkeletonCard';
import StarfieldBackground from '@/components/StarfieldBackground';

export default function LimpezaScreen() {
  const { comandos, diagnosticos, leituras, loading } = useData();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);

  const ultimoComando     = useMemo(() => comandos[0] ?? null, [comandos]);
  const historicoComandos = useMemo(() => comandos.slice(1, 6), [comandos]);
  const diagPainelA       = useMemo(
    () => diagnosticos.find((d) => d.ativoId === ultimoComando?.alvoAtivoId),
    [diagnosticos, ultimoComando]
  );
  const eficienciaPainel = useMemo(() => {
    if (!diagPainelA) return undefined;
    const pot = leituras.find((l) => l.tipo === 'potencia' && l.ativoId === diagPainelA.ativoId);
    return pot?.esperado ? pot.valor / pot.esperado : undefined;
  }, [leituras, diagPainelA]);
  const limpezaExecutada = ultimoComando?.acao === 'VIBRAR';

  return (
    <View style={s.wrapper}>
      <StarfieldBackground count={40} opacity={0.28} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>

        <Text style={s.sectionTitle}>Diagnóstico Atual</Text>

        {loading ? (
          <SkeletonCard height={160} borderRadius={14} />
        ) : diagPainelA ? (
          <DiagnosticoCard diagnostico={diagPainelA} eficiencia={eficienciaPainel} />
        ) : (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Nenhum diagnóstico disponível.</Text>
          </View>
        )}

        <Text style={s.sectionTitle}>Último Comando de Limpeza</Text>

        {loading ? (
          <SkeletonCard height={140} borderRadius={16} />
        ) : ultimoComando ? (
          <>
            <View style={[
              s.statusBanner,
              { backgroundColor: limpezaExecutada ? colors.accent + '15' : colors.danger + '15' },
            ]}>
              <Ionicons
                name={limpezaExecutada ? 'checkmark-circle' : 'ban'}
                size={20}
                color={limpezaExecutada ? colors.accent : colors.danger}
              />
              <View style={s.statusBannerInfo}>
                <Text style={[s.statusBannerTitle, { color: limpezaExecutada ? colors.accent : colors.danger }]}>
                  {limpezaExecutada ? 'LIMPEZA EXECUTADA' : 'LIMPEZA BLOQUEADA'}
                </Text>
                <Text style={s.statusBannerSub}>
                  {limpezaExecutada
                    ? `Vibração a ${Math.round(ultimoComando.intensidade * 100)}% por ${ultimoComando.duracaoSeg}s`
                    : 'Causa não é sujeira — vibração não acionada'}
                </Text>
              </View>
            </View>
            <VibracaoStatus comando={ultimoComando} destaque />
          </>
        ) : (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Nenhum comando registrado ainda.</Text>
          </View>
        )}

        {historicoComandos.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Histórico Recente</Text>
            {historicoComandos.map((cmd) => (
              <VibracaoStatus key={cmd.comandoId} comando={cmd} />
            ))}
          </>
        )}

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>Como funciona a malha fechada</Text>
          <Text style={s.infoText}>
            O HÉLIOS só vibra quando o diagnóstico confirma SUJEIRA como causa da queda de energia.
            Se for dano físico, sombra ou falha elétrica, a vibração é bloqueada para não agravar o problema.
          </Text>
        </View>
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
    sectionTitle: {
      ...Typography.sectionTitle,
      color: colors.textSecondary,
      marginTop: 24,
      marginBottom: 12,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      ...Typography.body,
      color: colors.textMuted,
    },
    statusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    statusBannerInfo: {
      flex: 1,
    },
    statusBannerTitle: {
      ...Typography.label,
      letterSpacing: 0.5,
    },
    statusBannerSub: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    infoBox: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 24,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoTitle: {
      ...Typography.label,
      color: colors.accent,
      marginBottom: 8,
    },
    infoText: {
      ...Typography.body,
      color: colors.textSecondary,
      lineHeight: 22,
    },
  });
