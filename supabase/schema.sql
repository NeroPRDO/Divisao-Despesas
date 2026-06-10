-- Supabase/PostgreSQL schema for the Divisão de Despesas mobile app.
-- Execute este arquivo no Supabase SQL Editor antes de rodar o app.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 3),
  invite_code text not null unique,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  paid_by uuid not null references public.users(id) on delete restrict,
  description text not null check (char_length(description) >= 2),
  amount numeric(12,2) not null check (amount > 0),
  receipt_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_groups_created_by on public.groups(created_by);
create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_group_members_user_id on public.group_members(user_id);
create index if not exists idx_expenses_group_id on public.expenses(group_id);
create index if not exists idx_expenses_paid_by on public.expenses(paid_by);

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'Usuário'),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email,
      name = coalesce(public.users.name, excluded.name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = auth.uid()
  );
$$;

create or replace function public.is_group_owner(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = auth.uid()
      and gm.role = 'owner'
  );
$$;

create or replace function public.shares_group_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = p_user_id or exists (
    select 1
    from public.group_members mine
    join public.group_members other_member on other_member.group_id = mine.group_id
    where mine.user_id = auth.uid()
      and other_member.user_id = p_user_id
  );
$$;

create or replace function public.create_group_with_member(p_name text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_code text;
  created_group public.groups;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  loop
    new_code := public.generate_invite_code();
    exit when not exists (select 1 from public.groups where invite_code = new_code);
  end loop;

  insert into public.groups (name, invite_code, created_by)
  values (trim(p_name), new_code, current_user_id)
  returning * into created_group;

  insert into public.group_members (group_id, user_id, role)
  values (created_group.id, current_user_id, 'owner')
  on conflict (group_id, user_id) do nothing;

  return created_group;
end;
$$;

create or replace function public.join_group_by_code(p_invite_code text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_group public.groups;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select * into target_group
  from public.groups
  where invite_code = upper(trim(p_invite_code));

  if target_group.id is null then
    raise exception 'Grupo não encontrado';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (target_group.id, current_user_id, 'member')
  on conflict (group_id, user_id) do nothing;

  return target_group;
end;
$$;

alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.expenses enable row level security;

-- Users/profiles
create policy "users_select_shared_profiles"
  on public.users for select
  to authenticated
  using (public.shares_group_with(id));

create policy "users_update_own_profile"
  on public.users for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Groups
create policy "groups_select_only_members"
  on public.groups for select
  to authenticated
  using (public.is_group_member(id));

create policy "groups_insert_own"
  on public.groups for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "groups_update_owner"
  on public.groups for update
  to authenticated
  using (public.is_group_owner(id))
  with check (public.is_group_owner(id));

create policy "groups_delete_owner"
  on public.groups for delete
  to authenticated
  using (public.is_group_owner(id));

-- Group members
create policy "group_members_select_only_group_members"
  on public.group_members for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "group_members_insert_self"
  on public.group_members for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "group_members_delete_self_or_owner"
  on public.group_members for delete
  to authenticated
  using (user_id = auth.uid() or public.is_group_owner(group_id));

-- Expenses
create policy "expenses_select_only_group_members"
  on public.expenses for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "expenses_insert_only_group_members"
  on public.expenses for insert
  to authenticated
  with check (
    public.is_group_member(group_id)
    and exists (
      select 1
      from public.group_members gm
      where gm.group_id = expenses.group_id
        and gm.user_id = expenses.paid_by
    )
  );

create policy "expenses_update_payer_or_owner"
  on public.expenses for update
  to authenticated
  using (paid_by = auth.uid() or public.is_group_owner(group_id))
  with check (public.is_group_member(group_id));

create policy "expenses_delete_payer_or_owner"
  on public.expenses for delete
  to authenticated
  using (paid_by = auth.uid() or public.is_group_owner(group_id));

-- Supabase Storage bucket for receipt photos.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do update set public = true;

create policy "receipts_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts');

create policy "receipts_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'receipts');

create policy "receipts_update_authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'receipts')
  with check (bucket_id = 'receipts');
