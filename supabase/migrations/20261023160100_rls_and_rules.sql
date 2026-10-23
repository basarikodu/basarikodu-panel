-- Yetki yardımcıları, Row Level Security ve ders iş kuralları

-- Yardımcılar API'ye açık olmayan "private" şemada ------------------------------
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.my_role() returns public.user_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid()) and is_active
$$;

create function private.is_founder() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(private.my_role() = 'founder', false)
$$;

create function private.tutor_has_student(p_tutor uuid, p_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tutor_students
    where tutor_id = p_tutor and student_id = p_student and is_active
  )
$$;

create function private.is_my_student(p_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.tutor_has_student((select auth.uid()), p_student)
$$;

create function private.is_my_tutor(p_tutor uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.tutor_has_student(p_tutor, (select auth.uid()))
$$;

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated;

-- RLS ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tutors enable row level security;
alter table public.tutor_subjects enable row level security;
alter table public.students enable row level security;
alter table public.student_notes enable row level security;
alter table public.tutor_students enable row level security;
alter table public.app_settings enable row level security;
alter table public.lesson_series enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_change_requests enable row level security;
alter table public.student_packages enable row level security;
alter table public.payments enable row level security;
alter table public.tutor_payouts enable row level security;

-- profiles: kendisi, kurucu, eğitmen↔atanmış öğrenci birbirini görür
create policy profiles_select on public.profiles for select to authenticated using (
  id = (select auth.uid()) or (select private.is_founder())
  or private.is_my_student(id) or private.is_my_tutor(id)
);
create policy profiles_founder_write on public.profiles for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

-- subjects / tutor_subjects / app_settings: herkes okur, kurucu yazar
create policy subjects_select on public.subjects for select to authenticated using (true);
create policy subjects_founder_write on public.subjects for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

create policy tutor_subjects_select on public.tutor_subjects for select to authenticated using (true);
create policy tutor_subjects_founder_write on public.tutor_subjects for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

create policy app_settings_select on public.app_settings for select to authenticated using (true);
create policy app_settings_founder_update on public.app_settings for update to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

-- tutors (IBAN içerir): kurucu ve eğitmenin kendisi
create policy tutors_select on public.tutors for select to authenticated using (
  id = (select auth.uid()) or (select private.is_founder())
);
create policy tutors_founder_write on public.tutors for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

-- students: kurucu, kendisi, atanmış eğitmeni
create policy students_select on public.students for select to authenticated using (
  id = (select auth.uid()) or (select private.is_founder()) or private.is_my_student(id)
);
create policy students_founder_write on public.students for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

create policy student_notes_founder on public.student_notes for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

-- tutor_students: kurucu yönetir; eğitmen ve öğrenci kendi satırlarını görür
create policy tutor_students_select on public.tutor_students for select to authenticated using (
  (select private.is_founder()) or tutor_id = (select auth.uid()) or student_id = (select auth.uid())
);
create policy tutor_students_founder_write on public.tutor_students for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

-- lesson_series
create policy lesson_series_select on public.lesson_series for select to authenticated using (
  (select private.is_founder()) or tutor_id = (select auth.uid())
);
create policy lesson_series_insert on public.lesson_series for insert to authenticated with check (
  (select private.is_founder())
  or (tutor_id = (select auth.uid()) and private.is_my_student(student_id))
);
create policy lesson_series_founder_write on public.lesson_series for update to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));
create policy lesson_series_delete on public.lesson_series for delete to authenticated using (
  (select private.is_founder()) or tutor_id = (select auth.uid())
);

-- lessons: öğrenci yalnızca onaylı derslerini görür
create policy lessons_select on public.lessons for select to authenticated using (
  (select private.is_founder()) or tutor_id = (select auth.uid())
  or (student_id = (select auth.uid()) and approval_status = 'approved')
);
create policy lessons_insert on public.lessons for insert to authenticated with check (
  (select private.is_founder())
  or (tutor_id = (select auth.uid()) and private.is_my_student(student_id))
);
-- Eğitmenin hangi alanları değiştirebileceğini lessons_guard trigger'ı sınırlar
create policy lessons_update on public.lessons for update to authenticated
  using ((select private.is_founder()) or tutor_id = (select auth.uid()))
  with check ((select private.is_founder()) or tutor_id = (select auth.uid()));
-- Eğitmen yalnızca onaylanmamış (bekleyen/reddedilen) dersini geri çekebilir
create policy lessons_delete on public.lessons for delete to authenticated using (
  (select private.is_founder())
  or (tutor_id = (select auth.uid()) and approval_status in ('pending', 'rejected'))
);

-- lesson_change_requests
create policy change_requests_select on public.lesson_change_requests for select to authenticated using (
  (select private.is_founder()) or requested_by = (select auth.uid())
);
create policy change_requests_insert on public.lesson_change_requests for insert to authenticated with check (
  requested_by = (select auth.uid()) and status = 'pending'
  and exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.tutor_id = (select auth.uid())
      and l.approval_status = 'approved' and l.status = 'planned'
  )
);
create policy change_requests_delete on public.lesson_change_requests for delete to authenticated using (
  (select private.is_founder()) or (requested_by = (select auth.uid()) and status = 'pending')
);
create policy change_requests_founder_update on public.lesson_change_requests for update to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

-- Finans: kurucu yönetir; öğrenci kendi paket/ödemesini, eğitmen kendi ödemesini görür
create policy student_packages_select on public.student_packages for select to authenticated using (
  (select private.is_founder()) or student_id = (select auth.uid())
);
create policy student_packages_founder_write on public.student_packages for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

create policy payments_select on public.payments for select to authenticated using (
  (select private.is_founder()) or student_id = (select auth.uid())
);
create policy payments_founder_write on public.payments for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

create policy tutor_payouts_select on public.tutor_payouts for select to authenticated using (
  (select private.is_founder()) or tutor_id = (select auth.uid())
);
create policy tutor_payouts_founder_write on public.tutor_payouts for all to authenticated
  using ((select private.is_founder())) with check ((select private.is_founder()));

-- Ders iş kuralları (trigger) -------------------------------------------------------
create function private.lessons_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_founder boolean := private.is_founder();
  v_rate numeric(10, 2);
begin
  if tg_op = 'INSERT' then
    if v_founder then
      new.approval_status := 'approved';
      new.approved_by := auth.uid();
      new.approved_at := now();
    else
      if new.tutor_id is distinct from auth.uid() then
        raise exception 'Yalnızca kendi dersinizi planlayabilirsiniz';
      end if;
      if not private.tutor_has_student(new.tutor_id, new.student_id) then
        raise exception 'Bu öğrenci size atanmamış';
      end if;
      -- Eğitmenin planladığı her ders kurucu onayına düşer
      new.approval_status := 'pending';
      new.approved_by := null;
      new.approved_at := null;
      new.rejection_reason := null;
      new.status := 'planned';
      new.created_by := auth.uid();
    end if;
    -- Hediye koçluk: o ay 8+ derslik paketi olan öğrencinin koçluğu ücretsiz
    if new.lesson_type = 'kocluk' and not v_founder then
      new.is_free := exists (
        select 1 from public.student_packages p
        where p.student_id = new.student_id and p.lesson_count >= 8
          and p.month = date_trunc('month', new.starts_at at time zone 'Europe/Istanbul')::date
      );
    end if;
  elsif not v_founder then
    -- Eğitmen: saat/öğrenci/onay değişikliği yapamaz (talep oluşturur)
    if (new.tutor_id, new.student_id, new.subject_id, new.lesson_type, new.starts_at, new.ends_at,
        new.approval_status, new.is_free, new.series_id)
       is distinct from
       (old.tutor_id, old.student_id, old.subject_id, old.lesson_type, old.starts_at, old.ends_at,
        old.approval_status, old.is_free, old.series_id) then
      raise exception 'Bu değişiklik kurucu onayı gerektirir; erteleme/iptal talebi oluşturun';
    end if;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
    new.rejection_reason := old.rejection_reason;
    new.created_by := old.created_by;
    if new.status is distinct from old.status then
      if old.approval_status <> 'approved' then
        raise exception 'Onaylanmamış dersin sonucu girilemez';
      end if;
      if old.status not in ('planned', 'completed', 'no_show')
         or new.status not in ('planned', 'completed', 'no_show') then
        raise exception 'İptal veya erteleme için kurucuya talep gönderin';
      end if;
      if new.status <> 'planned' and old.starts_at > now() then
        raise exception 'Ders başlamadan sonuç girilemez';
      end if;
    end if;
  end if;

  -- Eğitmen ücreti tamamlanma anında kopyalanır (ortak ücret, hediye koçluk 0)
  if new.status = 'completed' then
    if tg_op = 'INSERT' or old.status <> 'completed'
       or new.is_free <> old.is_free or new.lesson_type <> old.lesson_type then
      select case when new.lesson_type = 'kocluk' then tutor_rate_coaching else tutor_rate_private end
        into v_rate from public.app_settings where id = 1;
      new.tutor_rate_snapshot := case when new.is_free then 0 else coalesce(v_rate, 0) end;
      new.completed_at := now();
    end if;
  else
    new.tutor_rate_snapshot := 0;
    new.completed_at := null;
  end if;
  return new;
end $$;

create trigger lessons_guard before insert or update on public.lessons
  for each row execute function private.lessons_guard();

-- Kurucu onay işlemleri (RPC) ------------------------------------------------------
create function public.review_lessons(p_lesson_ids uuid[], p_approve boolean, p_reason text default null)
returns int
language plpgsql security definer set search_path = '' as $$
declare
  v_count int;
begin
  if not private.is_founder() then
    raise exception 'Bu işlem yalnızca kurucular içindir';
  end if;
  update public.lessons
     set approval_status = case when p_approve then 'approved' else 'rejected' end::public.approval_status,
         approved_by = auth.uid(),
         approved_at = now(),
         rejection_reason = case when p_approve then null else nullif(trim(p_reason), '') end
   where id = any (p_lesson_ids) and approval_status = 'pending';
  get diagnostics v_count = row_count;
  return v_count;
end $$;

create function public.review_change_request(p_request_id uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  r public.lesson_change_requests;
begin
  if not private.is_founder() then
    raise exception 'Bu işlem yalnızca kurucular içindir';
  end if;
  select * into r from public.lesson_change_requests
   where id = p_request_id and status = 'pending' for update;
  if not found then
    raise exception 'Talep bulunamadı veya zaten sonuçlandı';
  end if;
  if p_approve then
    if r.request_type = 'reschedule' then
      update public.lessons set starts_at = r.new_starts_at, ends_at = r.new_ends_at where id = r.lesson_id;
    else
      update public.lessons set status = r.cancel_status where id = r.lesson_id;
    end if;
  end if;
  update public.lesson_change_requests
     set status = case when p_approve then 'approved' else 'rejected' end::public.approval_status,
         reviewed_by = auth.uid(),
         reviewed_at = now(),
         review_note = nullif(trim(p_note), '')
   where id = p_request_id;
end $$;

-- Ders hakkı özeti: kalan = Σ paket (bu aya kadar) − tamamlanan (hediye hariç) ----
create function public.get_credit_balances(p_month date default null)
returns table (
  student_id uuid,
  total_credits int,
  used_credits int,
  remaining int,
  month_package int,
  month_completed int,
  carried_over int
)
language sql stable security definer set search_path = '' as $$
  with m as (
    select coalesce(p_month, date_trunc('month', now() at time zone 'Europe/Istanbul')::date) as month_start
  ),
  b as (
    select month_start,
           (month_start::timestamp at time zone 'Europe/Istanbul') as ms,
           ((month_start + interval '1 month')::timestamp at time zone 'Europe/Istanbul') as me
    from m
  ),
  visible as (
    select s.id from public.students s
    where private.is_founder() or s.id = (select auth.uid()) or private.is_my_student(s.id)
  )
  select v.id,
         coalesce(pk.total, 0),
         coalesce(ls.used, 0),
         coalesce(pk.total, 0) - coalesce(ls.used, 0),
         coalesce(pk.month_pkg, 0),
         coalesce(ls.month_used, 0),
         coalesce(pk.before_total, 0) - coalesce(ls.before_used, 0)
  from visible v
  cross join b
  left join lateral (
    select (sum(p.lesson_count) filter (where p.month <= b.month_start))::int as total,
           (sum(p.lesson_count) filter (where p.month = b.month_start))::int as month_pkg,
           (sum(p.lesson_count) filter (where p.month < b.month_start))::int as before_total
    from public.student_packages p where p.student_id = v.id
  ) pk on true
  left join lateral (
    select (count(*) filter (where l.starts_at < b.me))::int as used,
           (count(*) filter (where l.starts_at >= b.ms and l.starts_at < b.me))::int as month_used,
           (count(*) filter (where l.starts_at < b.ms))::int as before_used
    from public.lessons l
    where l.student_id = v.id and l.status = 'completed' and not l.is_free
  ) ls on true
$$;

revoke execute on function public.review_lessons(uuid[], boolean, text) from public, anon;
revoke execute on function public.review_change_request(uuid, boolean, text) from public, anon;
revoke execute on function public.get_credit_balances(date) from public, anon;
grant execute on function public.review_lessons(uuid[], boolean, text) to authenticated;
grant execute on function public.review_change_request(uuid, boolean, text) to authenticated;
grant execute on function public.get_credit_balances(date) to authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
