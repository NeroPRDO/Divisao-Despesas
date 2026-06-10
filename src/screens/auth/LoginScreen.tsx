import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn, authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe e-mail e senha para entrar.');
      return;
    }

    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Erro ao entrar', error instanceof Error ? error.message : 'Não foi possível realizar login.');
    }
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>💸</Text>
          <Text style={styles.title}>Divisão de Despesas</Text>
          <Text style={styles.subtitle}>Organize grupos, recibos e acertos financeiros compartilhados.</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
          />
          <PrimaryButton title="Entrar" onPress={handleLogin} loading={authLoading} />
        </View>

        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkWrapper}>
          <Text style={styles.linkText}>Ainda não tenho conta. Criar cadastro.</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm
  },
  emoji: {
    fontSize: 54
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center'
  },
  subtitle: {
    textAlign: 'center',
    color: colors.muted,
    lineHeight: 22
  },
  form: {
    gap: spacing.md
  },
  linkWrapper: {
    alignItems: 'center'
  },
  linkText: {
    color: colors.primary,
    fontWeight: '700'
  }
});
