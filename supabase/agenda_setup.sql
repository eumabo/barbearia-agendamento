create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  service_id text not null,
  service_name text not null,
  service_price numeric,
  barber_id text not null,
  barber_name text not null,
  appointment_date date not null,
  appointment_time text not null,
  duration_minutes integer not null default 30,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'confirmado' check (status in ('confirmado', 'bloqueado', 'cancelado')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists appointments_unique_active_slot
  on public.appointments (barber_id, appointment_date, appointment_time)
  where status in ('confirmado', 'bloqueado');

create or replace view public.unavailable_slots as
select barber_id, appointment_date, appointment_time, status
from public.appointments
where status in ('confirmado', 'bloqueado');

alter table public.appointments enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.appointments from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;
revoke all on public.unavailable_slots from anon, authenticated;

grant select on public.unavailable_slots to anon, authenticated;
grant insert on public.appointments to anon;
grant select, update on public.appointments to authenticated;
grant select on public.admin_users to authenticated;

create policy "public can create appointments"
on public.appointments
for insert
to anon
with check (status = 'confirmado');

create policy "admins can read appointments"
on public.appointments
for select
to authenticated
using (exists (
  select 1 from public.admin_users admin where admin.user_id = auth.uid()
));

create policy "admins can update appointments"
on public.appointments
for update
to authenticated
using (exists (
  select 1 from public.admin_users admin where admin.user_id = auth.uid()
))
with check (exists (
  select 1 from public.admin_users admin where admin.user_id = auth.uid()
));

create policy "admins can create blocks"
on public.appointments
for insert
to authenticated
with check (
  exists (select 1 from public.admin_users admin where admin.user_id = auth.uid())
);

create policy "admins can read admin_users"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());
