import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Alerta } from '@/data/types';
import { formatRelativeTime } from '@/utils/time';

interface Props {
  alerta: Alerta;
  lido: boolean;
  onReconhecer: () => void;
}

export default function AlertItem({ alerta, lido, onReconhecer }: Props) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);

  const severidadeColor = {
    ALTA: colors.danger,
    MEDIA: colors.warning,
    BAIXA: colors.success,
  }[alerta.severidade];

  const hora = formatRelativeTime(alerta.timestamp);

  return (
    <View style={[s.container, lido && s.containerLido]}>
      <View style={[s.severidadeBar, { backgroundColor: severidadeColor }]} />
      <View style={s.body}>
        <View style={s.header}>
          <View style={[s.badge, { backgroundColor: severidadeColor + '22', borderColor: severidadeColor }]}>
            <Text style={[s.badgeText, { color: severidadeColor }]}>{alerta.severidade}</Text>
          </View>
          <Text style={s.tipo}>{alerta.tipo.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={s.mensagem}>{alerta.mensagem}</Text>
        <View style={s.footer}>
          <Text style={s.meta}>{alerta.ativoId} · {hora}</Text>
          {!lido ? (
            <TouchableOpacity style={s.btn} onPress={onReconhecer} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.accent} />
              <Text style={s.btnText}>Reconhecer</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.lido}>
              <Ionicons name="checkmark-circle" size={14} color={colors.textMuted} />
              <Text style={s.lidoText}>Reconhecido</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
      overflow: 'hidden',
    },
    containerLido: {
      opacity: 0.55,
    },
    severidadeBar: {
      width: 4,
    },
    body: {
      flex: 1,
      padding: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    badge: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    badgeText: {
      ...Typography.caption,
      fontWeight: '700',
    },
    tipo: {
      ...Typography.caption,
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
    mensagem: {
      ...Typography.body,
      color: colors.text,
      marginBottom: 8,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    meta: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    btnText: {
      ...Typography.caption,
      color: colors.accent,
      fontWeight: '700',
    },
    lido: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    lidoText: {
      ...Typography.caption,
      color: colors.textMuted,
    },
  });
