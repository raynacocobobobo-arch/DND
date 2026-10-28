-- HermesTodo / GitHub Pages + Supabase
-- Run ONCE (idempotent) in your project's Supabase SQL Editor.
-- Public browser code may use only the publishable/anon key. NEVER service_role.
-- Row Level Security separates every account's data. No anonymous data access.

create table if not exists public.hermes_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  icon text not null default 'folder' check (char_length(icon) between 1 and 40),
  color text not null default '#8CAABA' check (color ~ '^#[[:xdigit:]]{6}$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hermes_contexts_owner_id_unique unique (user_id, id)
);

create table if not exists public.hermes_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  notes text not null default '' check (char_length(notes) <= 4000),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_at timestamptz,
  is_completed boolean not null default false,
  completed_at timestamptz,
  context_id uuid,
  parent_task_id uuid,
  repeat_interval text not null default 'none' check (repeat_interval in ('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom')),
  repeat_rule text not null default '' check (char_length(repeat_rule) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hermes_tasks_owner_id_unique unique (user_id, id),
  constraint hermes_tasks_context_same_owner
    foreign key (user_id, context_id) references public.hermes_contexts(user_id, id) on delete set null (context_id),
  constraint hermes_tasks_parent_same_owner
    foreign key (user_id, parent_task_id) references public.hermes_tasks(user_id, id) on delete cascade,
  constraint hermes_tasks_no_self_parent check (id is distinct from parent_task_id)
);

create index if not exists hermes_contexts_owner_sort on public.hermes_contexts (user_id, sort_order);
create index if not exists hermes_tasks_owner_context on public.hermes_tasks (user_id, context_id);
create index if not exists hermes_tasks_owner_parent on public.hermes_tasks (user_id, parent_task_id);
create index if not exists hermes_tasks_owner_due on public.hermes_tasks (user_id, due_at);

create or replace function public.hermes_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists hermes_contexts_touched on public.hermes_contexts;
create trigger hermes_contexts_touched before update on public.hermes_contexts
for each row execute function public.hermes_set_updated_at();
drop trigger if exists hermes_tasks_touched on public.hermes_tasks;
create trigger hermes_tasks_touched before update on public.hermes_tasks
for each row execute function public.hermes_set_updated_at();

alter table public.hermes_contexts enable row level security;
alter table public.hermes_tasks enable row level security;
alter table public.hermes_contexts force row level security;
alter table public.hermes_tasks force row level security;

drop policy if exists "hermes_contexts_select_own" on public.hermes_contexts;
drop policy if exists "hermes_contexts_insert_own" on public.hermes_contexts;
drop policy if exists "hermes_contexts_update_own" on public.hermes_contexts;
drop policy if exists "hermes_contexts_delete_own" on public.hermes_contexts;
create policy "hermes_contexts_select_own" on public.hermes_contexts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "hermes_contexts_insert_own" on public.hermes_contexts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "hermes_contexts_update_own" on public.hermes_contexts
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "hermes_contexts_delete_own" on public.hermes_contexts
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "hermes_tasks_select_own" on public.hermes_tasks;
drop policy if exists "hermes_tasks_insert_own" on public.hermes_tasks;
drop policy if exists "hermes_tasks_update_own" on public.hermes_tasks;
drop policy if exists "hermes_tasks_delete_own" on public.hermes_tasks;
create policy "hermes_tasks_select_own" on public.hermes_tasks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "hermes_tasks_insert_own" on public.hermes_tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "hermes_tasks_update_own" on public.hermes_tasks
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "hermes_tasks_delete_own" on public.hermes_tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.hermes_contexts, public.hermes_tasks from anon;
grant select, insert, update, delete on public.hermes_contexts, public.hermes_tasks to authenticated;
