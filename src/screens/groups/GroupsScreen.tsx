import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { listMyGroups } from '../../services/groupsService';
import { colors, spacing } from '../../theme';
import type { Group } from '../../types/models';
import type { GroupsStackParamList } from '../../types/navigation';
import { formatDateTime } from '../../utils/format';

type Props = NativeStackScreenProps<GroupsStackParamList, 'GroupsHome'>;

export function GroupsScreen({ navigation }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const data = await listMyGroups();
      setGroups(data);
    } catch (error) {
      Alert.alert('Erro ao carregar grupos', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups])
  );

  function handleRefresh() {
    setRefreshing(true);
    loadGroups();
  }

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <PrimaryButton title="Criar grupo" onPress={() => navigation.navigate('CreateGroup')} />
        <PrimaryButton title="Entrar por código" variant="outline" onPress={() => navigation.navigate('JoinGroup')} />
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={groups.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              title="Você ainda não participa de grupos"
              description="Crie seu primeiro grupo para registrar despesas e calcular quem deve acertar com quem."
              actionLabel="Criar meu primeiro grupo"
              onAction={() => navigation.navigate('CreateGroup')}
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}>
            <Card>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupMeta}>Código: {item.invite_code}</Text>
              <Text style={styles.groupMeta}>Criado em {formatDateTime(item.created_at)}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg
  },
  actions: {
    gap: spacing.sm
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  emptyList: {
    flexGrow: 1
  },
  groupName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  groupMeta: {
    color: colors.muted
  }
});
