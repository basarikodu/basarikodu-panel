-- RLS ve ders/finans kuralları testleri (demo kullanıcıları gerekir: d0000000-...).
-- Sayılara değil kurallara bakar; veri değişse de geçerlidir.
-- Tek örtük işlem olarak çalışır; sonuçlar bilerek fırlatılan hata mesajında döner ve
-- testin yaptığı tüm değişiklikler geri alınır.
create temp table rls_results (n serial, test text, ok boolean, detail text);
grant insert, select on rls_results to authenticated;
grant usage on sequence rls_results_n_seq to authenticated;

do $$
declare
  founder constant uuid := 'd0000000-0000-4000-8000-000000000001';
  tutor1  constant uuid := 'd0000000-0000-4000-8000-000000000011';
  s1      constant uuid := 'd0000000-0000-4000-8000-000000000021';
  s3      constant uuid := 'd0000000-0000-4000-8000-000000000023';
  v_int int;
  v_txt text;
  v_id uuid;
  v_lesson uuid;
  v_math uuid := (select id from public.subjects where name = 'Matematik');
  v_bio uuid := (select id from public.subjects where name = 'Biyoloji');
  v_free_slot timestamptz := date_trunc('day', now()) + interval '40 days' + interval '6 hours';
  v_paid uuid := (select id from public.lessons where payout_id is not null limit 1);
begin
  ---------------- ÖĞRENCİ ----------------
  perform set_config('request.jwt.claims', json_build_object('sub', s3, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_int from public.lessons where student_id <> s3 or approval_status <> 'approved';
  insert into rls_results (test, ok, detail) values ('öğrenci yalnızca kendi ONAYLI derslerini görür', v_int = 0, v_int::text);

  select count(*) into v_int from public.profiles p
  where p.id <> s3 and not exists (select 1 from public.lessons l where l.tutor_id = p.id)
    and not exists (select 1 from public.tutor_students ts where ts.tutor_id = p.id);
  insert into rls_results (test, ok, detail) values ('öğrenci yalnızca kendisini ve eğitmenlerini görür', v_int = 0, v_int::text);

  select count(*) into v_int from public.tutors;
  insert into rls_results (test, ok, detail) values ('öğrenci eğitmen tablosunu (IBAN) göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.payments where student_id <> s3;
  insert into rls_results (test, ok, detail) values ('öğrenci başkasının ödemesini göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.tutor_payouts;
  insert into rls_results (test, ok, detail) values ('öğrenci eğitmen ödemelerini göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.get_credit_balances(null) where student_id <> s3;
  insert into rls_results (test, ok, detail) values ('ders hakkı özeti yalnızca kendi satırı', v_int = 0, v_int::text);

  begin
    update public.lessons set topic = 'hack' where student_id = s3;
    get diagnostics v_int = row_count;
    insert into rls_results (test, ok, detail) values ('öğrenci ders güncelleyemez', v_int = 0, v_int::text);
  exception when others then
    insert into rls_results (test, ok, detail) values ('öğrenci ders güncelleyemez', true, sqlerrm);
  end;
  reset role;

  ---------------- EĞİTMEN 1 ----------------
  perform set_config('request.jwt.claims', json_build_object('sub', tutor1, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_int from public.students s where not exists (
    select 1 from public.tutor_students ts where ts.student_id = s.id and ts.tutor_id = tutor1 and ts.is_active);
  insert into rls_results (test, ok, detail) values ('eğitmen yalnızca atanmış öğrencilerini görür', v_int = 0, v_int::text);

  select count(*) into v_int from public.lessons where tutor_id <> tutor1;
  insert into rls_results (test, ok, detail) values ('eğitmen başka eğitmenin dersini görmez', v_int = 0, v_int::text);

  select count(*) into v_int from public.payments;
  insert into rls_results (test, ok, detail) values ('eğitmen öğrenci ödemelerini göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.student_packages;
  insert into rls_results (test, ok, detail) values ('eğitmen paket tutarlarını göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.tutors where id <> tutor1;
  insert into rls_results (test, ok, detail) values ('eğitmen başka eğitmenin IBAN''ını göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.tutor_payouts where tutor_id <> tutor1;
  insert into rls_results (test, ok, detail) values ('eğitmen yalnızca kendi ödemelerini görür', v_int = 0, v_int::text);

  begin
    insert into public.lessons (tutor_id, student_id, subject_id, starts_at, ends_at)
    values (tutor1, s3, v_bio, v_free_slot, v_free_slot + interval '1 hour');
    insert into rls_results (test, ok, detail) values ('eğitmen atanmamış öğrenciye ders açamaz', false, 'eklendi!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen atanmamış öğrenciye ders açamaz', true, sqlerrm);
  end;

  insert into public.lessons (tutor_id, student_id, subject_id, starts_at, ends_at, approval_status, status)
  values (tutor1, s1, v_math, v_free_slot, v_free_slot + interval '1 hour', 'approved', 'completed')
  returning id into v_id;
  select approval_status::text || '/' || status::text into v_txt from public.lessons where id = v_id;
  insert into rls_results (test, ok, detail) values ('eğitmen dersi zorla "onay bekliyor/planlandı" olur', v_txt = 'pending/planned', v_txt);

  begin
    insert into public.lessons (tutor_id, student_id, subject_id, starts_at, ends_at)
    values (tutor1, s1, v_math, v_free_slot + interval '30 minutes', v_free_slot + interval '90 minutes');
    insert into rls_results (test, ok, detail) values ('çakışan ders engellenir', false, 'eklendi!');
  exception when exclusion_violation then
    insert into rls_results (test, ok, detail) values ('çakışan ders engellenir', true, sqlerrm);
  end;

  select id into v_lesson from public.lessons
  where tutor_id = tutor1 and approval_status = 'approved' and status = 'planned' and starts_at > now()
    and not exists (select 1 from public.lesson_change_requests r where r.lesson_id = lessons.id and r.status = 'pending')
  order by starts_at limit 1;

  begin
    update public.lessons set starts_at = starts_at + interval '1 hour' where id = v_lesson;
    insert into rls_results (test, ok, detail) values ('eğitmen onaylı dersin saatini değiştiremez', false, 'değişti!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen onaylı dersin saatini değiştiremez', true, sqlerrm);
  end;

  begin
    update public.lessons set status = 'completed' where id = v_lesson;
    insert into rls_results (test, ok, detail) values ('başlamamış ders tamamlanamaz', false, 'tamamlandı!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('başlamamış ders tamamlanamaz', true, sqlerrm);
  end;

  begin
    update public.lessons set status = 'cancelled_by_tutor' where id = v_lesson;
    insert into rls_results (test, ok, detail) values ('eğitmen doğrudan iptal edemez', false, 'iptal edildi!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen doğrudan iptal edemez', true, sqlerrm);
  end;

  if v_paid is not null then
    begin
      update public.lessons set status = 'no_show' where id = v_paid;
      insert into rls_results (test, ok, detail) values ('ödenmiş ders kilitli (eğitmen)', false, 'değişti!');
    exception when others then
      insert into rls_results (test, ok, detail) values ('ödenmiş ders kilitli (eğitmen)', true, sqlerrm);
    end;
  end if;

  begin
    perform public.mark_tutor_paid(tutor1, current_date - 60, current_date + 1, current_date, null);
    insert into rls_results (test, ok, detail) values ('eğitmen kendine ödeme işaretleyemez', false, 'işaretledi!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen kendine ödeme işaretleyemez', true, sqlerrm);
  end;

  insert into public.lesson_change_requests (lesson_id, request_type, new_starts_at, new_ends_at, reason)
  select id, 'reschedule', v_free_slot + interval '1 day', v_free_slot + interval '1 day 1 hour', 'Test'
  from public.lessons where id = v_lesson
  returning id into v_id;
  insert into rls_results (test, ok, detail) values ('eğitmen erteleme talebi oluşturabilir', v_id is not null, coalesce(v_id::text, 'yok'));

  begin
    perform public.review_change_request(v_id, true, null);
    insert into rls_results (test, ok, detail) values ('eğitmen kendi talebini onaylayamaz', false, 'onayladı!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen kendi talebini onaylayamaz', true, sqlerrm);
  end;
  reset role;

  ---------------- KURUCU ----------------
  perform set_config('request.jwt.claims', json_build_object('sub', founder, 'role', 'authenticated')::text, true);
  set local role authenticated;

  perform public.review_change_request(v_id, true, null);
  select (starts_at = v_free_slot + interval '1 day')::text into v_txt from public.lessons where id = v_lesson;
  insert into rls_results (test, ok, detail) values ('kurucu ertelemeyi onaylayınca ders taşınır', v_txt = 'true', v_txt);

  select public.review_lessons(array_agg(id), true, null) into v_int
  from public.lessons where approval_status = 'pending';
  insert into rls_results (test, ok, detail) values ('kurucu bekleyen dersleri toplu onaylar', v_int >= 1, v_int::text);

  if v_paid is not null then
    begin
      update public.lessons set status = 'no_show' where id = v_paid;
      insert into rls_results (test, ok, detail) values ('ödenmiş ders kurucu için de önce ödeme geri alınmalı', false, 'değişti!');
    exception when others then
      insert into rls_results (test, ok, detail) values ('ödenmiş ders kurucu için de önce ödeme geri alınmalı', true, sqlerrm);
    end;
  end if;
  reset role;

  select string_agg(n || ' ' || case when ok then 'OK  ' else 'FAIL' end || ' | ' || test || ' | ' || left(detail, 80), E'\n' order by n)
    into v_txt from rls_results;
  select count(*) filter (where not ok) into v_int from rls_results;
  raise exception E'RLS SONUCLARI (hatali: %)\n%', v_int, v_txt;
end $$;
