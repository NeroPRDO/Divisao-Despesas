import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { signUp, authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Dados inválidos', 'Informe nome, e-mail e uma senha com pelo menos 6 caracteres.');
      return;
    }

    try {
      await signUp(name.trim(), email.trim(), password);
      Alert.alert('Cadastro criado', 'Se a confirmação por e-mail estiver ativa no Supabase, confirme seu e-mail antes de entrar.');
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    }
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Seu perfil será usado nos grupos e nos cálculos de saldo.</Text>
        </View>

        <View style={styles.form}>
          <TextField label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
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
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
          />
          <PrimaryButton title="Criar cadastro" onPress={handleRegister} loading={authLoading} />
        </View>

        <Pressable onPress={() => navigation.goBack()} style={styles.linkWrapper}>
          <Text style={styles.linkText}>Já tenho conta. Voltar para login.</Text>
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
    gap: spacing.sm
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text
  },
  subtitle: {
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
