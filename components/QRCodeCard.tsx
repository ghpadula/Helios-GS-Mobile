import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface Props {
  url: string;
  label?: string;
}

export default function QRCodeCard({ url, label = 'Abrir repositório' }: Props) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <TouchableOpacity style={s.trigger} onPress={() => setAberto(true)} activeOpacity={0.8}>
        <View style={s.miniQr}>
          <QRCode value={url} size={48} backgroundColor="transparent" color={colors.text} />
        </View>
        <View style={s.triggerInfo}>
          <Text style={s.triggerTitle}>{label}</Text>
          <Text style={s.triggerSub}>Toque para ampliar o QR Code</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>HÉLIOS</Text>
            <Text style={s.modalSub}>Escaneie para acessar o projeto</Text>

            <View style={s.qrBox}>
              <QRCode value={url} size={220} backgroundColor="#ffffff" color="#000000" />
            </View>

            <Text style={s.url} numberOfLines={1}>{url}</Text>

            <TouchableOpacity style={s.fecharBtn} onPress={() => setAberto(false)} activeOpacity={0.85}>
              <Text style={s.fecharText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    miniQr: {
      width: 56,
      height: 56,
      borderRadius: 10,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    triggerInfo: {
      flex: 1,
    },
    triggerTitle: {
      ...Typography.body,
      color: colors.text,
      fontWeight: '700',
    },
    triggerSub: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 28,
      alignItems: 'center',
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: colors.accent,
      letterSpacing: 6,
    },
    modalSub: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 4,
      marginBottom: 24,
    },
    qrBox: {
      padding: 16,
      backgroundColor: '#ffffff',
      borderRadius: 16,
    },
    url: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginTop: 20,
      maxWidth: '100%',
    },
    fecharBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 40,
      marginTop: 24,
    },
    fecharText: {
      color: '#000',
      fontWeight: '800',
      fontSize: 15,
    },
  });
