import type { BalanceResult, Expense, GroupMember, MemberBalance, Settlement } from '../types/models';

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateGroupBalance(members: GroupMember[], expenses: Expense[]): BalanceResult {
  const total = roundMoney(expenses.reduce((sum, expense) => sum + Number(expense.amount), 0));
  const share = members.length > 0 ? roundMoney(total / members.length) : 0;

  const paidByUser = new Map<string, number>();
  for (const expense of expenses) {
    paidByUser.set(expense.paid_by, roundMoney((paidByUser.get(expense.paid_by) ?? 0) + Number(expense.amount)));
  }

  const balances: MemberBalance[] = members.map((member) => {
    const paid = roundMoney(paidByUser.get(member.user_id) ?? 0);
    return {
      userId: member.user_id,
      name: member.user?.name ?? 'Participante',
      paid,
      share,
      balance: roundMoney(paid - share)
    };
  });

  const creditors = balances
    .filter((item) => item.balance > 0.01)
    .map((item) => ({ ...item, remaining: item.balance }))
    .sort((a, b) => b.remaining - a.remaining);

  const debtors = balances
    .filter((item) => item.balance < -0.01)
    .map((item) => ({ ...item, remaining: Math.abs(item.balance) }))
    .sort((a, b) => b.remaining - a.remaining);

  const settlements: Settlement[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = roundMoney(Math.min(creditor.remaining, debtor.remaining));

    if (amount > 0.01) {
      settlements.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount
      });
    }

    creditor.remaining = roundMoney(creditor.remaining - amount);
    debtor.remaining = roundMoney(debtor.remaining - amount);

    if (creditor.remaining <= 0.01) creditorIndex += 1;
    if (debtor.remaining <= 0.01) debtorIndex += 1;
  }

  return {
    total,
    share,
    balances,
    settlements
  };
}
