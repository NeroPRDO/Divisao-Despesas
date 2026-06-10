import type { Group } from '../types/models';

export function buildInviteMessage(group: Group): string {
  return `Você foi convidado para entrar no grupo "${group.name}" no app Divisão de Despesas. Use o código: ${group.invite_code}`;
}
