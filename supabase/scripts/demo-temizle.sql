-- Demo verilerin kalıcı olarak silinmesi (GERİ ALINAMAZ).
-- Yalnızca e-postası "*.demo@basarikodu.com" olan hesaplar ve onlara bağlı kayıtlar silinir.
-- Branşlar, ayarlar ve gerçek hesaplar korunur. Tek işlem: bir hata olursa hiçbir şey silinmez.
--
-- Önerilen sıra: önce gerçek kurucu hesapları açılır (scripts/kurucu-hesaplari.mjs), sonra bu betik.

begin;

create temp table demo_users on commit drop as
  select id from auth.users where email like '%.demo@basarikodu.com';

-- Güvenlik: demo öğrencinin gerçek eğitmenle (veya tersi) dersi/ataması varsa dur
do $$
begin
  if exists (
    select 1 from public.lessons l
    where (l.tutor_id in (select id from demo_users)) <> (l.student_id in (select id from demo_users))
  ) or exists (
    select 1 from public.tutor_students ts
    where (ts.tutor_id in (select id from demo_users)) <> (ts.student_id in (select id from demo_users))
  ) then
    raise exception 'Demo ve gerçek hesaplar arasında ders/atama var; silme iptal edildi';
  end if;
end $$;

-- Gerçek kayıtlardaki "kim yaptı" alanları demo kurucuyu gösteriyorsa boşalt
update public.app_settings set updated_by = null where updated_by in (select id from demo_users);
update public.lessons set created_by = null where created_by in (select id from demo_users)
  and tutor_id not in (select id from demo_users);
update public.lessons set approved_by = null where approved_by in (select id from demo_users)
  and tutor_id not in (select id from demo_users);
update public.payments set recorded_by = null where recorded_by in (select id from demo_users)
  and student_id not in (select id from demo_users);
update public.student_packages set created_by = null where created_by in (select id from demo_users)
  and student_id not in (select id from demo_users);
update public.tutor_payouts set recorded_by = null where recorded_by in (select id from demo_users)
  and tutor_id not in (select id from demo_users);
update public.tutor_students set assigned_by = null where assigned_by in (select id from demo_users)
  and tutor_id not in (select id from demo_users);
update public.lesson_change_requests set reviewed_by = null where reviewed_by in (select id from demo_users);

-- Demo derslere bağlı kayıtlar (talepler cascade ile silinir)
delete from public.lessons
  where tutor_id in (select id from demo_users) or student_id in (select id from demo_users);
delete from public.lesson_series
  where tutor_id in (select id from demo_users) or student_id in (select id from demo_users);
delete from public.tutor_payouts where tutor_id in (select id from demo_users);
delete from public.payments where student_id in (select id from demo_users);
delete from public.student_packages where student_id in (select id from demo_users);
delete from public.tutor_students
  where tutor_id in (select id from demo_users) or student_id in (select id from demo_users);

-- Hesaplar (profil, eğitmen, öğrenci, not kayıtları cascade ile silinir)
delete from auth.users where id in (select id from demo_users);

-- Sonuç
select
  (select count(*) from auth.users) as kalan_hesap,
  (select count(*) from public.lessons) as kalan_ders,
  (select count(*) from public.student_packages) as kalan_paket,
  (select count(*) from public.payments) as kalan_tahsilat,
  (select count(*) from public.subjects) as brans;

commit;
