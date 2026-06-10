export type Profile = {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  user?: Profile;
};

export type Expense = {
  id: string;
  group_id: string;
  paid_by: string;
  description: string;
  amount: number;
  receipt_url: string | null;
  created_at: string;
  payer?: Profile;
};

export type MemberBalance = {
  userId: string;
  name: string;
  paid: number;
  share: number;
  balance: number;
};

export type Settlement = {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
};

export type BalanceResult = {
  total: number;
  share: number;
  balances: MemberBalance[];
  settlements: Settlement[];
};
