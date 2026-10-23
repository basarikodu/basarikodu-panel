-- BaşarıKodu Panel v1 — çekirdek şema (docs/04-VERITABANI.md)

create extension if not exists btree_gist with schema extensions;

-- Enum'lar -------------------------------------------------------------------
create type public.user_role as enum ('founder', 'tutor', 'student');
create type public.lesson_type as enum ('ozel_ders', 'kocluk');
create type public.lesson_status as enum (
  'planned', 'completed', 'no_show', 'cancelled_by_student', 'cancelled_by_tutor', 'postponed'
);
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.student_goal as enum ('yks', 'lgs', 'okul', 'genel');
create type public.payout_frequency as enum ('weekly', 'monthly');
create type public.payment_method as enum ('havale', 'nakit', 'kart', 'diger');
create type public.change_request_type as enum ('reschedule', 'cancel');

-- Ortak updated_at ---------------------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Kimlik -------------------------------------------------------------------------
-- Profil satırlarını yalnızca sunucu (service role) davet sırasında oluşturur.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  full_name text not null check (length(trim(full_name)) > 0),
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#1b2e6e',
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.tutors (
  id uuid primary key references public.profiles (id) on delete cascade,
  university text,
  department text,
  yks_rank int,
  iban text,
  payout_frequency public.payout_frequency not null default 'monthly',
  default_meeting_url text
);

create table public.tutor_subjects (
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  primary key (tutor_id, subject_id)
);
create index tutor_subjects_subject_idx on public.tutor_subjects (subject_id);

create table public.students (
  id uuid primary key references public.profiles (id) on delete cascade,
  grade smallint check (grade between 1 and 13), -- 13 = mezun
  goal public.student_goal not null default 'okul',
  school text,
  guardian_name text,
  guardian_phone text
);

-- Kurucuya özel öğrenci notları (eğitmen ve öğrenci göremez)
create table public.student_notes (
  student_id uuid primary key references public.students (id) on delete cascade,
  notes text not null default '',
  updated_at timestamptz not null default now()
);
create trigger student_notes_updated_at before update on public.student_notes
  for each row execute function public.set_updated_at();

-- Eşleştirme: kurucu öğrenciye branş bazında eğitmen atar
create table public.tutor_students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id uuid not null references public.subjects (id),
  lesson_type public.lesson_type not null default 'ozel_ders',
  is_active boolean not null default true,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles (id)
);
create unique index tutor_students_active_uniq
  on public.tutor_students (tutor_id, student_id, subject_id) where is_active;
create index tutor_students_student_idx on public.tutor_students (student_id);

-- Tek satırlık genel ayarlar (ortak eğitmen ücreti)
create table public.app_settings (
  id smallint primary key default 1 check (id = 1),
  tutor_rate_private numeric(10, 2) not null default 0 check (tutor_rate_private >= 0),
  tutor_rate_coaching numeric(10, 2) not null default 0 check (tutor_rate_coaching >= 0),
  duration_private smallint not null default 60,
  duration_coaching smallint not null default 40,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);
create trigger app_settings_updated_at before update on public.app_settings
  for each row execute function public.set_updated_at();
insert into public.app_settings (id) values (1);

-- Dersler ------------------------------------------------------------------------
create table public.lesson_series (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id uuid not null references public.subjects (id),
  lesson_type public.lesson_type not null,
  weeks smallint not null check (weeks between 1 and 16),
  created_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.lesson_series (id) on delete set null,
  tutor_id uuid not null references public.tutors (id),
  student_id uuid not null references public.students (id),
  subject_id uuid not null references public.subjects (id),
  lesson_type public.lesson_type not null default 'ozel_ders',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.lesson_status not null default 'planned',
  approval_status public.approval_status not null default 'pending',
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  rejection_reason text,
  meeting_url text,
  is_free boolean not null default false, -- hediye koçluk: hak düşmez, eğitmene 0 TL
  tutor_rate_snapshot numeric(10, 2) not null default 0,
  topic text, -- eğitmenin ders notu / işlenen konu
  completed_at timestamptz,
  created_by uuid default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_time_order check (ends_at > starts_at),
  constraint no_tutor_overlap exclude using gist (
    tutor_id with =, tstzrange(starts_at, ends_at) with &&
  ) where (status = 'planned' and approval_status <> 'rejected'),
  constraint no_student_overlap exclude using gist (
    student_id with =, tstzrange(starts_at, ends_at) with &&
  ) where (status = 'planned' and approval_status <> 'rejected')
);
create index lessons_tutor_time_idx on public.lessons (tutor_id, starts_at);
create index lessons_student_time_idx on public.lessons (student_id, starts_at);
create index lessons_status_time_idx on public.lessons (status, starts_at);
create index lessons_pending_idx on public.lessons (approval_status) where approval_status = 'pending';
create index lessons_series_idx on public.lessons (series_id);
create trigger lessons_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();

-- Eğitmenin onaylı ders üzerindeki erteleme / iptal talebi
create table public.lesson_change_requests (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  request_type public.change_request_type not null,
  new_starts_at timestamptz,
  new_ends_at timestamptz,
  cancel_status public.lesson_status,
  reason text not null default '',
  status public.approval_status not null default 'pending',
  requested_by uuid not null default auth.uid() references public.profiles (id),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  constraint reschedule_has_time check (
    request_type <> 'reschedule' or (new_starts_at is not null and new_ends_at > new_starts_at)
  ),
  constraint cancel_has_status check (
    request_type <> 'cancel' or cancel_status in ('cancelled_by_student', 'cancelled_by_tutor')
  )
);
create unique index change_requests_one_pending
  on public.lesson_change_requests (lesson_id) where status = 'pending';

-- Finans -------------------------------------------------------------------------
-- Öğrencinin aylık paketi; kalan hak = Σ paket − tamamlanan dersler (devreder)
create table public.student_packages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  lesson_count smallint not null check (lesson_count > 0),
  price_total numeric(10, 2) not null default 0 check (price_total >= 0),
  note text,
  created_by uuid default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (student_id, month)
);

-- Öğrenciden alınan ödemeler (manuel kayıt)
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  paid_at date not null default current_date,
  method public.payment_method not null default 'havale',
  note text,
  recorded_by uuid default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);
create index payments_student_idx on public.payments (student_id, paid_at);
create index payments_paid_at_idx on public.payments (paid_at);

-- Eğitmene yapılan ödeme kaydı ("Ödendi"); tutar dönemin hesabından kopyalanır
create table public.tutor_payouts (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  period_start date not null,
  period_end date not null check (period_end > period_start), -- hariç
  lesson_count int not null default 0,
  amount numeric(10, 2) not null default 0,
  paid_at date not null default current_date,
  note text,
  recorded_by uuid default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (tutor_id, period_start, period_end)
);
