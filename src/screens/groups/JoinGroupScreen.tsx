import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { joinGroupByCode } from '../../services/groupsService';
import { colors, spacing } from '../../theme';
import type { GroupsStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<GroupsStackParamList, 'JoinGroup'>;

export function JoinGroupScreen({ navigation }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (code.trim().length < 4) {
      Alert.alert('Código inválido', 'Informe o código de convite do grupo.');
      return;
    }

    setLoading(true);
    try {
      const group = await joinGroupByCode(code);
      navigation.replace('GroupDetails', { groupId: group.id });
    } catch (error) {
      Alert.alert('Erro ao entrar no grupo', error instanceof Error ? error.message : 'Verifique o código e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Entrar em grupo</Text>
      <Text style={styles.description}>Cole o código recebido de outro participante para acessar o grupo.</Text>
      <TextField
        label="Código do grupo"
        value={code}
        onChangeText={(value) => setCode(value.toUpperCase())}
        placeholder="Ex: A1B2C3"
        autoCapitalize="characters"
      />
      <PrimaryButton title="Entrar" onPress={handleJoin} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.sm
  },
  description: {
    color: colors.muted,
    lineHeight: 22,
    marginBottom: spacing.xl
  }
});
