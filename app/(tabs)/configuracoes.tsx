import { useMemo } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import StarfieldBackground from '@/components/StarfieldBackground';
import QRCodeCard from '@/components/QRCodeCard';
import { PROJETO } from '@/constants/Config';

const INTERVALOS = [
  { label: '30 segundos', value: 30 },
  { label: '1 minuto',    value: 60 },
  { label: '5 minutos',   value: 300 },
];

const PREFS_KEY = '@helios:preferencias';

export default function ConfiguracoesScreen() {
  const { operador, logout } = useAuth();
  const { theme, toggleTheme, intervalo, setIntervalo } = useTheme();
  const colors = Colors[theme];
  const s = useMemo(() => styles(colors), [colors]);

  async function handleIntervalo(value: number) {
    setIntervalo(value);
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, intervalo: value }));
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  return (
    <View style={s.wrapper}>
      <StarfieldBackground count={40} opacity={0.28} />
      <ScrollView contentContainerStyle={s.container}>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Operador</Text>
        <View style={s.row}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{operador?.nome.charAt(0).toUpperCase() ?? '?'}</Text>
          </View>
          <View>
            <Text style={s.operadorNome}>{operador?.nome ?? '—'}</Text>
            <Text style={s.operadorRm}>RM: {operador?.rm ?? '—'}</Text>
          </View>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Aparência</Text>
        <View style={s.settingRow}>
          <Text style={s.settingLabel}>Tema Escuro</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Intervalo de Atualização</Text>
        {INTERVALOS.map((op) => (
          <TouchableOpacity
            key={op.value}
            style={[s.radioRow, intervalo === op.value && s.radioRowActive]}
            onPress={() => handleIntervalo(op.value)}
          >
            <View style={[s.radio, intervalo === op.value && s.radioActive]} />
            <Text style={[s.radioLabel, intervalo === op.value && { color: colors.accent }]}>
              {op.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Projeto</Text>
        <QRCodeCard url={PROJETO.repositorioUrl} label="Repositório no GitHub" />
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={s.logoutText}>Encerrar Sessão</Text>
      </TouchableOpacity>

      <Text style={s.version}>{PROJETO.nome} v{PROJETO.versao} · FIAP GS 2026.1</Text>
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
      padding: 16,
      paddingBottom: 32,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      ...Typography.label,
      color: colors.textMuted,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 20,
      fontWeight: '700',
      color: '#000',
    },
    operadorNome: {
      ...Typography.body,
      color: colors.text,
      fontWeight: '700',
    },
    operadorRm: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingLabel: {
      ...Typography.body,
      color: colors.text,
    },
    radioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    radioRowActive: {
      backgroundColor: colors.surfaceElevated,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    radioActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    radioLabel: {
      ...Typography.body,
      color: colors.textSecondary,
    },
    logoutBtn: {
      backgroundColor: colors.danger,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    logoutText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    version: {
      ...Typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 24,
    },
  });
