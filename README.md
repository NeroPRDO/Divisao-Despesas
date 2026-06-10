# Divisão de Despesas

Aplicativo mobile em React Native + Expo para gerenciamento e divisão de contas financeiras compartilhadas.

## Objetivo

Permitir que usuários autenticados criem grupos, convidem participantes por código, registrem despesas, anexem fotos de recibos e visualizem o balanço financeiro do grupo.

## Principais requisitos atendidos

- Expo + React Native + TypeScript.
- Navegação híbrida com Bottom Tabs, Stack Navigator e Modal para nova despesa.
- Login e cadastro com Supabase Auth.
- Context API para sessão do usuário.
- Proteção de rotas autenticadas.
- Banco Supabase com tabelas `users`, `groups`, `group_members` e `expenses`.
- Regras de Row Level Security para limitar acesso por participação em grupo.
- Upload de foto de recibo para Supabase Storage.
- Compartilhamento nativo de convite do grupo com código.
- Empty states, loading states e pull-to-refresh em listas.
- Cálculo de saldo por participante e sugestão de acerto.

## Estrutura principal

```txt
src/
  components/        Componentes reutilizáveis
  contexts/          Context API de autenticação
  lib/               Cliente Supabase
  navigation/        Navegação principal, tabs, stacks e modal
  screens/           Telas do aplicativo
  services/          Serviços de banco, storage e cálculo
  types/             Tipagens TypeScript
  utils/             Funções auxiliares
supabase/
  schema.sql         Tabelas, funções, RLS e storage bucket
```

## Guia de execução

Leia o arquivo `GUIA_EXECUCAO.md` antes de rodar o projeto pela primeira vez.


