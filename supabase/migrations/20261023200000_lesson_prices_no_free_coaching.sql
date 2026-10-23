-- Kurucu kararı (23 Eki 2026): hediye koçluk kuralı kaldırıldı; koçluk normal ders gibi sayılır.
-- Öğrenci ders fiyatları kurucu ayarıdır: haftada 1 ders → tek ders fiyatı, haftada 2+ → indirimli fiyat.

drop trigger if exists lessons_a_free_coaching on public.lessons;
drop function if exists private.lessons_free_coaching();

-- Mevcut "hediye" işaretlerini kaldır; tamamlanmış olanların eğitmen ücretini yeniden hesapla
update public.lessons set is_free = false where is_free;
update public.lessons l
set tutor_rate_snapshot = case when l.lesson_type = 'kocluk' then s.tutor_rate_coaching else s.tutor_rate_private end
from public.app_settings s
where s.id = 1 and l.status = 'completed' and l.tutor_rate_snapshot = 0 and l.payout_id is null;

alter table public.app_settings
  add column lesson_price_single numeric(10, 2) not null default 950 check (lesson_price_single >= 0),
  add column lesson_price_multi numeric(10, 2) not null default 850 check (lesson_price_multi >= 0);

comment on column public.app_settings.lesson_price_single is 'Öğrenci ders başı fiyat: haftada 1 ders (aylık 4 ders ve altı)';
comment on column public.app_settings.lesson_price_multi is 'Öğrenci ders başı fiyat: haftada 2 ve üzeri ders (aylık 8+ ders)';

-- Ders kuralları: otomatik hediye koçluk hesabı çıkarıldı
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
      new.is_free := false;
      new.created_by := auth.uid();
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
