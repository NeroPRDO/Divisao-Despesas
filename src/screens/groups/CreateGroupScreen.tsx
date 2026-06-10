import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { createGroup } from '../../services/groupsService';
import { colors, spacing } from '../../theme';
import type { GroupsStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<GroupsStackParamList, 'CreateGroup'>;

export function CreateGroupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (name.trim().length < 3) {
      Alert.alert('Nome inválido', 'Informe um nome com pelo menos 3 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const group = await createGroup(name);
      navigation.replace('GroupDetails', { groupId: group.id });
    } catch (error) {
      Alert.alert('Erro ao criar grupo', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Novo grupo</Text>
      <Text style={styles.description}>Crie grupos como República, Viagem ou Churrasco para dividir despesas.</Text>
      <TextField label="Nome do grupo" value={name} onChangeText={setName} placeholder="Ex: Viagem para Bragança" />
      <PrimaryButton title="Criar grupo" onPress={handleCreate} loading={loading} />
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
