import { supabase } from '../lib/supabase';
import type { Group, GroupMember } from '../types/models';

export async function listMyGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_code, created_by, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Group[];
}

export async function getGroup(groupId: string): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_code, created_by, created_at')
    .eq('id', groupId)
    .single();

  if (error) throw error;
  return data as Group;
}

export async function createGroup(name: string): Promise<Group> {
  const { data, error } = await supabase.rpc('create_group_with_member', {
    p_name: name.trim()
  });

  if (error) throw error;
  return data as Group;
}

export async function joinGroupByCode(inviteCode: string): Promise<Group> {
  const { data, error } = await supabase.rpc('join_group_by_code', {
    p_invite_code: inviteCode.trim().toUpperCase()
  });

  if (error) throw error;
  return data as Group;
}

export async function listGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('id, group_id, user_id, role, joined_at, user:users(id, name, email, created_at)')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as GroupMember[];
}
