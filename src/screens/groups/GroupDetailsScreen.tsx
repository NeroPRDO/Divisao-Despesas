import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Share, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { calculateGroupBalance } from '../../services/balanceService';
import { listGroupExpenses } from '../../services/expensesService';
import { getGroup, listGroupMembers } from '../../services/groupsService';
import { colors, spacing } from '../../theme';
import type { Expense, Group, GroupMember } from '../../types/models';
import type { GroupsStackParamList } from '../../types/navigation';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { buildInviteMessage } from '../../utils/invite';

type Props = NativeStackScreenProps<GroupsStackParamList, 'GroupDetails'>;

export function GroupDetailsScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const balance = useMemo(() => calculateGroupBalance(members, expenses), [members, expenses]);

  const loadData = useCallback(async () => {
    try {
      const [groupData, memberData, expenseData] = await Promise.all([
        getGroup(groupId),
        listGroupMembers(groupId),
        listGroupExpenses(groupId)
      ]);

      setGroup(groupData);
      setMembers(memberData);
      setExpenses(expenseData);
    } catch (error) {
      Alert.alert('Erro ao carregar grupo', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleRefresh() {
    setRefreshing(true);
    loadData();
  }

  async function handleInvite() {
    if (!group) return;
    try {
      await Share.share({ message: buildInviteMessage(group) });
    } catch (error) {
      Alert.alert('Erro ao compartilhar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  function renderHeader() {
    if (!group) return null;

    return (
      <View style={styles.headerWrapper}>
        <Card>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.muted}>Código de convite: {group.invite_code}</Text>
          <Text style={styles.muted}>{members.length} participante(s)</Text>
        </Card>

        <View style={styles.actions}>
          <PrimaryButton title="Adicionar despesa" onPress={() => navigation.navigate('AddExpenseModal', { groupId })} />
          <PrimaryButton title="Convidar amigo" variant="outline" onPress={handleInvite} />
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Balanço do grupo</Text>
          <Text style={styles.balanceLine}>Total gasto: {formatCurrency(balance.total)}</Text>
          <Text style={styles.balanceLine}>Cota por pessoa: {formatCurrency(balance.share)}</Text>
          {balance.balances.map((item) => (
            <Text key={item.userId} style={styles.balanceLine}>
              {item.name}: {item.balance >= 0 ? '+' : ''}{formatCurrency(item.balance)}
            </Text>
          ))}
          {balance.settlements.length > 0 ? (
            <View style={styles.settlements}>
              <Text style={styles.sectionSubtitle}>Sugestão de acerto</Text>
              {balance.settlements.map((item) => (
                <Text key={`${item.fromUserId}-${item.toUserId}-${item.amount}`} style={styles.muted}>
                  {item.fromName} deve {formatCurrency(item.amount)} para {item.toName}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.muted}>Sem acertos pendentes no momento.</Text>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Despesas</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={expenses.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              title="Nenhuma despesa registrada"
              description="Adicione a primeira compra do grupo para calcular o balanço financeiro."
              actionLabel="Adicionar nova despesa"
              onAction={() => navigation.navigate('AddExpenseModal', { groupId })}
            />
          )
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.expenseTitle}>{item.description}</Text>
            <Text style={styles.expenseAmount}>{formatCurrency(Number(item.amount))}</Text>
            <Text style={styles.muted}>Pago por {item.payer?.name ?? 'Participante'}</Text>
            <Text style={styles.muted}>{formatDateTime(item.created_at)}</Text>
            {item.receipt_url ? <Text style={styles.receipt}>Recibo anexado</Text> : null}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  emptyList: {
    flexGrow: 1
  },
  headerWrapper: {
    gap: spacing.md,
    marginBottom: spacing.md
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text
  },
  muted: {
    color: colors.muted,
    lineHeight: 20
  },
  actions: {
    gap: spacing.sm
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  sectionSubtitle: {
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm
  },
  balanceLine: {
    color: colors.text,
    lineHeight: 22
  },
  settlements: {
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary
  },
  receipt: {
    color: colors.success,
    fontWeight: '700'
  }
});
