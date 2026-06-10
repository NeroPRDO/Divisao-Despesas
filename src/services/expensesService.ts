import { supabase } from '../lib/supabase';
import type { Expense } from '../types/models';

type CreateExpenseInput = {
  groupId: string;
  paidBy: string;
  description: string;
  amount: number;
  receiptUrl?: string | null;
};

export async function listGroupExpenses(groupId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, group_id, paid_by, description, amount, receipt_url, created_at, payer:users(id, name, email, created_at)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Expense[];
}

export async function listRecentExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, group_id, paid_by, description, amount, receipt_url, created_at, payer:users(id, name, email, created_at)')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) throw error;
  return (data ?? []) as unknown as Expense[];
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      group_id: input.groupId,
      paid_by: input.paidBy,
      description: input.description.trim(),
      amount: input.amount,
      receipt_url: input.receiptUrl ?? null
    })
    .select('id, group_id, paid_by, description, amount, receipt_url, created_at')
    .single();

  if (error) throw error;
  return data as Expense;
}
