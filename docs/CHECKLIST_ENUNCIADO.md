# Checklist do enunciado

## 2.1 Arquitetura de Navegação e UI/UX

- [x] Tabs principais: Grupos, Atividade e Perfil.
- [x] Stack para detalhamento de grupos.
- [x] Modal para adicionar nova despesa.
- [x] Empty State na tela de grupos.
- [x] Loading States nos botões de cadastro, login, criação de grupo e despesa.
- [x] Pull-to-refresh em grupos, despesas e atividade.

## 2.2 Autenticação e Estado Global

- [x] Supabase Auth.
- [x] Context API em `AuthContext.tsx`.
- [x] Proteção de rotas em `RootNavigator.tsx`.

## 2.3 Banco de Dados e Regras de Negócio

- [x] Tabela `users`.
- [x] Tabela `groups`.
- [x] Tabela `group_members`.
- [x] Tabela `expenses`.
- [x] Cálculo de balanço em `balanceService.ts`.
- [x] RLS configurada em `supabase/schema.sql`.

## 2.4 Recursos Nativos

- [x] Câmera/Galeria com `expo-image-picker`.
- [x] Upload da imagem para Supabase Storage.
- [x] URL pública salva em `receipt_url`.
- [x] Compartilhamento nativo com `Share` do React Native.

## 3. Engenharia e Versionamento

- [x] Guia com commits semânticos por bloco.
- [x] Estrutura pensada para commits pequenos.

## 4. Defesa

- [x] Guia com arquivos importantes para explicar na arguição.
