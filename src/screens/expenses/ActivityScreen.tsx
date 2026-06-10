import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { listRecentExpenses } from '../../services/expensesService';
import { colors, spacing } from '../../theme';
import type { Expense } from '../../types/models';
import { formatCurrency, formatDateTime } from '../../utils/format';

export function ActivityScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      const data = await listRecentExpenses();
      setExpenses(data);
    } catch (error) {
      Alert.alert('Erro ao carregar atividade', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  function handleRefresh() {
    setRefreshing(true);
    loadExpenses();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atividade recente</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={expenses.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              title="Sem atividades ainda"
              description="As despesas dos grupos dos quais você participa aparecerão aqui."
            />
          )
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.expenseTitle}>{item.description}</Text>
            <Text style={styles.amount}>{formatCurrency(Number(item.amount))}</Text>
            <Text style={styles.muted}>Pago por {item.payer?.name ?? 'Participante'}</Text>
            <Text style={styles.muted}>{formatDateTime(item.created_at)}</Text>
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
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  emptyList: {
    flexGrow: 1
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  amount: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 18
  },
  muted: {
    color: colors.muted
  }
});
