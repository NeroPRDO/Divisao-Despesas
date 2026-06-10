import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../theme';

export function ProfileScreen() {
  const { profile, user, signOut, authLoading } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Erro ao sair', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Card>
        <Text style={styles.name}>{profile?.name ?? 'Usuário'}</Text>
        <Text style={styles.muted}>{profile?.email ?? user?.email ?? 'E-mail não informado'}</Text>
        <Text style={styles.muted}>ID: {user?.id}</Text>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Sobre o app</Text>
        <Text style={styles.muted}>Este aplicativo usa Supabase Auth, tabelas relacionais, RLS, upload de recibos e compartilhamento nativo para convites.</Text>
      </Card>
      <PrimaryButton title="Sair da conta" variant="danger" onPress={handleSignOut} loading={authLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  muted: {
    color: colors.muted,
    lineHeight: 20
  }
});
