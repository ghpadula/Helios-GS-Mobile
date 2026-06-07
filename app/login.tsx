import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors, AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import StarfieldBackground from '@/components/StarfieldBackground';

export default function LoginScreen() {
  const { login, operador } = useAuth();
  const { theme } = useTheme();
  const colors = Colors[theme];

  const [nome, setNome] = useState('');
  const [rm, setRm] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string; rm?: string; senha?: string }>({});
  const [loading, setLoading] = useState(false);

  const s = useMemo(() => styles(colors), [colors]);

  if (operador) {
    return <Redirect href="/(tabs)" />;
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!nome.trim()) newErrors.nome = 'Nome obrigatório';
    if (!rm.trim()) newErrors.rm = 'RM obrigatório';
    else if (!/^\d+$/.test(rm.trim())) newErrors.rm = 'RM deve conter apenas números';
    if (!senha.trim()) newErrors.senha = 'Senha obrigatória';
    else if (senha.length < 4) newErrors.senha = 'Mínimo de 4 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    await login(nome.trim(), rm.trim());
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Céu estrelado com estrelas cadentes */}
      <StarfieldBackground count={80} opacity={1} shootingStars />

      {/* Planeta ao fundo */}
      <View style={s.planet} />
      <View style={s.planetGlow} />

      {/* Orbs de névoa */}
      <View style={s.orb1} />
      <View style={s.orb2} />
      <View style={s.orb3} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={s.logoSection}>
          <View style={s.logoBadge}>
            <Text style={s.logoBadgeText}>GS 2026.1</Text>
          </View>
          <Text style={s.logo}>HÉLIOS</Text>
          <Text style={s.subtitle}>Sistema Autônomo de Limpeza de{'\n'}Painéis Solares por Vibração</Text>
          <View style={s.tagsRow}>
            <View style={s.tag}><Text style={s.tagText}>Base Lunar</Text></View>
            <View style={s.tag}><Text style={s.tagText}>IA em Malha Fechada</Text></View>
          </View>
        </View>

        {/* Formulário */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Acesso do Operador</Text>

          <View style={s.field}>
            <Text style={s.label}>Nome</Text>
            <View style={[s.inputWrap, errors.nome ? s.inputWrapError : null]}>
              <Ionicons name="person-outline" size={16} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.textMuted}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>
            {errors.nome ? <Text style={s.errorText}>{errors.nome}</Text> : null}
          </View>

          <View style={s.field}>
            <Text style={s.label}>RM</Text>
            <View style={[s.inputWrap, errors.rm ? s.inputWrapError : null]}>
              <Ionicons name="id-card-outline" size={16} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Seu número de RM"
                placeholderTextColor={colors.textMuted}
                value={rm}
                onChangeText={setRm}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            {errors.rm ? <Text style={s.errorText}>{errors.rm}</Text> : null}
          </View>

          <View style={s.field}>
            <Text style={s.label}>Senha</Text>
            <View style={[s.inputWrap, errors.senha ? s.inputWrapError : null]}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
              />
              <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)} style={s.eyeBtn}>
                <Ionicons
                  name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.senha ? <Text style={s.errorText}>{errors.senha}</Text> : null}
          </View>

          <TouchableOpacity
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <Text style={s.buttonText}>Verificando...</Text>
              : <Text style={s.buttonText}>Entrar no Sistema</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>FIAP · Global Solution 2026.1</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    planet: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#1a2d4a',
      top: -60,
      right: -50,
      borderWidth: 1.5,
      borderColor: '#2a4a6a',
    },
    planetGlow: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: colors.accentBlue,
      opacity: 0.08,
      top: -80,
      right: -70,
    },
    orb1: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.accent,
      opacity: 0.05,
      top: -80,
      right: -80,
    },
    orb2: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.accentBlue,
      opacity: 0.06,
      top: 120,
      left: -60,
    },
    orb3: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: colors.accent,
      opacity: 0.04,
      bottom: 60,
      right: 20,
    },
    scroll: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    logoSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoBadge: {
      backgroundColor: colors.accent + '22',
      borderWidth: 1,
      borderColor: colors.accent + '44',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginBottom: 16,
    },
    logoBadgeText: {
      ...Typography.caption,
      color: colors.accent,
      fontWeight: '700',
      letterSpacing: 2,
    },
    logo: {
      fontSize: 52,
      fontWeight: '900',
      color: colors.accent,
      letterSpacing: 10,
      marginBottom: 12,
    },
    subtitle: {
      ...Typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 16,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    tag: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: {
      ...Typography.caption,
      color: colors.textMuted,
    },
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      ...Typography.subheading,
      color: colors.text,
      marginBottom: 20,
    },
    field: {
      marginBottom: 4,
    },
    label: {
      ...Typography.label,
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 12,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
    },
    inputWrapError: {
      borderColor: colors.danger,
    },
    inputIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      paddingVertical: 13,
      color: colors.text,
      fontSize: 15,
    },
    eyeBtn: {
      padding: 4,
    },
    errorText: {
      ...Typography.caption,
      color: colors.danger,
      marginTop: 4,
      marginLeft: 4,
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 24,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#000',
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: 0.5,
    },
    footer: {
      ...Typography.caption,
      color: colors.textMuted,
      marginTop: 32,
    },
  });
