-- Eğitmen ödemesi ders bazında: her tamamlanan ders en fazla bir ödeme kaydına bağlanır.
-- Aynı ders iki kez ödenmez; ödeme sonrası tamamlanan dersler ayrıca "bekliyor" görünür.

alter table public.lessons
  add column payout_id uuid references public.tutor_payouts (id) on delete set null;
create index lessons_payout_idx on public.lessons (payout_id);

-- Bir dönem için birden fazla ödeme olabilir (ör. dönem içinde sonradan girilen ders)
alter table public.tutor_payouts drop constraint tutor_payouts_tutor_id_period_start_period_end_key;
create index tutor_payouts_tutor_idx on public.tutor_payouts (tutor_id, period_start);

-- Ders kuralları: ödenmiş ders kilitli
create or replace function private.lessons_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_founder boolean := auth.uid() is null or private.is_founder();
  v_rate numeric(10, 2);
begin
  if tg_op = 'INSERT' then
    new.payout_id := null;
    if v_founder then
      new.approval_status := coalesce(nullif(new.approval_status, 'pending'), 'approved');
      if new.approval_status = 'approved' then
        new.approved_by := coalesce(new.approved_by, auth.uid());
        new.approved_at := coalesce(new.approved_at, now());
      end if;
    else
      if new.tutor_id is distinct from auth.uid() then
        raise exception 'Yalnızca kendi dersinizi planlayabilirsiniz';
      end if;
      if not private.tutor_has_student(new.tutor_id, new.student_id) then
        raise exception 'Bu öğrenci size atanmamış';
      end if;
      new.approval_status := 'pending';
      new.approved_by := null;
      new.approved_at := null;
      new.rejection_reason := null;
      new.status := 'planned';
      new.created_by := auth.uid();
    end if;
    if new.lesson_type = 'kocluk' and not v_founder then
      new.is_free := exists (
        select 1 from public.student_packages p
        where p.student_id = new.student_id and p.lesson_count >= 8
          and p.month = date_trunc('month', new.starts_at at time zone 'Europe/Istanbul')::date
      );
    end if;
  elsif not v_founder then
    if old.payout_id is not null then
      raise exception 'Bu dersin eğitmen ödemesi yapılmış; değişiklik için kuruculara başvurun';
    end if;
    if (new.tutor_id, new.student_id, new.subject_id, new.lesson_type, new.starts_at, new.ends_at,
        new.approval_status, new.is_free, new.series_id)
       is distinct from
       (old.tutor_id, old.student_id, old.subject_id, old.lesson_type, old.starts_at, old.ends_at,
        old.approval_status, old.is_free, old.series_id) then
      raise exception 'Bu değişiklik kurucu onayı gerektirir; erteleme/iptal talebi oluşturun';
    end if;
    new.payout_id := old.payout_id;
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
  elsif old.payout_id is not null and new.payout_id is not null
        and (new.status, new.is_free, new.lesson_type, new.tutor_id)
            is distinct from (old.status, old.is_free, old.lesson_type, old.tutor_id) then
    raise exception 'Bu dersin eğitmen ödemesi yapılmış; önce Gelir-Gider ekranından ödeme kaydını geri alın';
  end if;

  if new.status = 'completed' then
    if tg_op = 'INSERT' or old.status <> 'completed'
       or new.is_free <> old.is_free or new.lesson_type <> old.lesson_type then
      select case when new.lesson_type = 'kocluk' then tutor_rate_coaching else tutor_rate_private end
        into v_rate from public.app_settings where id = 1;
      new.tutor_rate_snapshot := case when new.is_free then 0 else coalesce(v_rate, 0) end;
      new.completed_at := coalesce(new.completed_at, now());
    end if;
  else
    new.tutor_rate_snapshot := 0;
    new.completed_at := null;
  end if;
  return new;
end $$;

-- Kurucu: dönemdeki ödenmemiş tamamlanan dersleri tek ödeme kaydına bağlar
create function public.mark_tutor_paid(
  p_tutor uuid,
  p_start date,
  p_end date,
  p_paid_at date default current_date,
  p_note text default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_from timestamptz := p_start::timestamp at time zone 'Europe/Istanbul';
  v_to timestamptz := p_end::timestamp at time zone 'Europe/Istanbul';
  v_count int;
  v_amount numeric(10, 2);
  v_id uuid;
begin
  if not private.is_founder() then
    raise exception 'Bu işlem yalnızca kurucular içindir';
  end if;
  if p_end <= p_start then
    raise exception 'Geçersiz dönem';
  end if;

  select count(*), coalesce(sum(tutor_rate_snapshot), 0) into v_count, v_amount
  from public.lessons
  where tutor_id = p_tutor and status = 'completed' and payout_id is null
    and starts_at >= v_from and starts_at < v_to;
  if v_count = 0 then
    raise exception 'Bu dönemde ödenecek ders yok';
  end if;

  insert into public.tutor_payouts
    (tutor_id, period_start, period_end, lesson_count, amount, paid_at, note, recorded_by)
  values (p_tutor, p_start, p_end, v_count, v_amount, coalesce(p_paid_at, current_date),
          nullif(trim(p_note), ''), auth.uid())
  returning id into v_id;

  update public.lessons set payout_id = v_id
  where tutor_id = p_tutor and status = 'completed' and payout_id is null
    and starts_at >= v_from and starts_at < v_to;

  return v_id;
end $$;

revoke execute on function public.mark_tutor_paid(uuid, date, date, date, text) from public, anon;
grant execute on function public.mark_tutor_paid(uuid, date, date, date, text) to authenticated;
