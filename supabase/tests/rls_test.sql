-- RLS ve ders kuralları testleri. Demo verisi gerekir (d0000000-... kullanıcıları).
-- Tek bir örtük işlem olarak çalışır; sonuçlar bilerek fırlatılan hata mesajında döner,
-- böylece testin yaptığı tüm değişiklikler geri alınır.
create temp table rls_results (n serial, test text, ok boolean, detail text);
grant insert, select on rls_results to authenticated;
grant usage on sequence rls_results_n_seq to authenticated;

do $$
declare
  founder constant uuid := 'd0000000-0000-4000-8000-000000000001';
  tutor1  constant uuid := 'd0000000-0000-4000-8000-000000000011';
  tutor2  constant uuid := 'd0000000-0000-4000-8000-000000000012';
  s1      constant uuid := 'd0000000-0000-4000-8000-000000000021';
  s2      constant uuid := 'd0000000-0000-4000-8000-000000000022';
  s3      constant uuid := 'd0000000-0000-4000-8000-000000000023';
  v_int int;
  v_txt text;
  v_id uuid;
  v_math uuid := (select id from public.subjects where name = 'Matematik');
  v_bio uuid := (select id from public.subjects where name = 'Biyoloji');
begin
  -- yardımcı: kullanıcı olarak oturum aç
  -- (set_config ile JWT taklidi + authenticated rolü)

  ---------------- ÖĞRENCİ ----------------
  perform set_config('request.jwt.claims', json_build_object('sub', s3, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_int from public.lessons;
  insert into rls_results (test, ok, detail) values ('öğrenci yalnızca kendi ONAYLI derslerini görür', v_int = 2, v_int::text);

  select count(*) into v_int from public.profiles;
  insert into rls_results (test, ok, detail) values ('öğrenci: kendisi + eğitmeni görünür (2)', v_int = 2, v_int::text);

  select count(*) into v_int from public.tutors;
  insert into rls_results (test, ok, detail) values ('öğrenci eğitmen tablosunu (IBAN) göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.payments;
  insert into rls_results (test, ok, detail) values ('öğrenci yalnızca kendi ödemesini görür', v_int = 1, v_int::text);

  select remaining into v_int from public.get_credit_balances('2026-10-01');
  insert into rls_results (test, ok, detail) values ('öğrenci3 kalan hak = 12 - 1 = 11', v_int = 11, v_int::text);

  select count(*) into v_int from public.get_credit_balances('2026-10-01');
  insert into rls_results (test, ok, detail) values ('hak özeti yalnızca kendi satırı', v_int = 1, v_int::text);

  begin
    update public.lessons set topic = 'hack' where student_id = s3;
    get diagnostics v_int = row_count;
    insert into rls_results (test, ok, detail) values ('öğrenci ders güncelleyemez', v_int = 0, v_int::text);
  exception when others then
    insert into rls_results (test, ok, detail) values ('öğrenci ders güncelleyemez', true, sqlerrm);
  end;

  reset role;

  ---------------- ÖĞRENCİ 1 (hediye koçluk) ----------------
  perform set_config('request.jwt.claims', json_build_object('sub', s1, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select remaining into v_int from public.get_credit_balances('2026-10-01');
  insert into rls_results (test, ok, detail) values ('öğrenci1 kalan hak = 8 - 3 (hediye koçluk sayılmaz) = 5', v_int = 5, v_int::text);
  select count(*) into v_int from public.profiles;
  insert into rls_results (test, ok, detail) values ('öğrenci1: kendisi + 2 eğitmeni (3)', v_int = 3, v_int::text);
  reset role;

  ---------------- EĞİTMEN 1 ----------------
  perform set_config('request.jwt.claims', json_build_object('sub', tutor1, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_int from public.students;
  insert into rls_results (test, ok, detail) values ('eğitmen yalnızca atanmış öğrencilerini görür (2)', v_int = 2, v_int::text);

  select count(*) into v_int from public.lessons where tutor_id <> tutor1;
  insert into rls_results (test, ok, detail) values ('eğitmen başka eğitmenin dersini görmez', v_int = 0, v_int::text);

  select count(*) into v_int from public.payments;
  insert into rls_results (test, ok, detail) values ('eğitmen öğrenci ödemelerini göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.student_packages;
  insert into rls_results (test, ok, detail) values ('eğitmen paket tutarlarını göremez', v_int = 0, v_int::text);

  select count(*) into v_int from public.get_credit_balances('2026-10-01');
  insert into rls_results (test, ok, detail) values ('eğitmen atanmış öğrencilerin hakkını görür (2)', v_int = 2, v_int::text);

  select count(*) into v_int from public.tutors;
  insert into rls_results (test, ok, detail) values ('eğitmen yalnızca kendi eğitmen kaydını görür', v_int = 1, v_int::text);

  begin
    insert into public.lessons (tutor_id, student_id, subject_id, starts_at, ends_at)
    values (tutor1, s3, v_bio, '2026-11-02 16:00+00', '2026-11-02 17:00+00');
    insert into rls_results (test, ok, detail) values ('eğitmen atanmamış öğrenciye ders açamaz', false, 'eklendi!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen atanmamış öğrenciye ders açamaz', true, sqlerrm);
  end;

  insert into public.lessons (tutor_id, student_id, subject_id, starts_at, ends_at, approval_status, status)
  values (tutor1, s1, v_math, '2026-11-02 16:00+00', '2026-11-02 17:00+00', 'approved', 'completed')
  returning id into v_id;
  select approval_status::text || '/' || status::text into v_txt from public.lessons where id = v_id;
  insert into rls_results (test, ok, detail) values ('eğitmen dersi zorla "onay bekliyor/planlandı" olur', v_txt = 'pending/planned', v_txt);

  begin
    insert into public.lessons (tutor_id, student_id, subject_id, starts_at, ends_at)
    values (tutor1, s1, v_math, '2026-11-02 16:30+00', '2026-11-02 17:30+00');
    insert into rls_results (test, ok, detail) values ('çakışan ders engellenir', false, 'eklendi!');
  exception when exclusion_violation then
    insert into rls_results (test, ok, detail) values ('çakışan ders engellenir', true, sqlerrm);
  end;

  begin
    update public.lessons set starts_at = starts_at + interval '1 hour'
    where tutor_id = tutor1 and approval_status = 'approved' and status = 'planned';
    insert into rls_results (test, ok, detail) values ('eğitmen onaylı dersin saatini değiştiremez', false, 'değişti!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen onaylı dersin saatini değiştiremez', true, sqlerrm);
  end;

  begin
    update public.lessons set status = 'completed'
    where tutor_id = tutor1 and starts_at = '2026-10-27 16:00+00';
    insert into rls_results (test, ok, detail) values ('başlamamış ders tamamlanamaz', false, 'tamamlandı!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('başlamamış ders tamamlanamaz', true, sqlerrm);
  end;

  begin
    update public.lessons set status = 'cancelled_by_tutor'
    where tutor_id = tutor1 and starts_at = '2026-10-27 16:00+00';
    insert into rls_results (test, ok, detail) values ('eğitmen doğrudan iptal edemez', false, 'iptal edildi!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen doğrudan iptal edemez', true, sqlerrm);
  end;

  update public.lessons set status = 'planned', topic = 'Not düzeltme'
  where tutor_id = tutor1 and student_id = s2 and status = 'no_show';
  get diagnostics v_int = row_count;
  insert into rls_results (test, ok, detail) values ('eğitmen geçmiş dersin sonucunu düzeltebilir', v_int = 1, v_int::text);

  insert into public.lesson_change_requests (lesson_id, request_type, new_starts_at, new_ends_at, reason)
  select id, 'reschedule', '2026-10-30 16:00+00', '2026-10-30 17:00+00', 'Öğrencinin sınavı var'
  from public.lessons where tutor_id = tutor1 and starts_at = '2026-10-27 16:00+00'
  returning id into v_id;
  insert into rls_results (test, ok, detail) values ('eğitmen erteleme talebi oluşturabilir', v_id is not null, coalesce(v_id::text, 'yok'));

  begin
    perform public.review_lessons(array[v_id], true, null);
    insert into rls_results (test, ok, detail) values ('eğitmen onay fonksiyonunu çalıştıramaz', false, 'çalıştı!');
  exception when others then
    insert into rls_results (test, ok, detail) values ('eğitmen onay fonksiyonunu çalıştıramaz', true, sqlerrm);
  end;

  reset role;

  ---------------- KURUCU ----------------
  perform set_config('request.jwt.claims', json_build_object('sub', founder, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_int from public.lessons;
  insert into rls_results (test, ok, detail) values ('kurucu tüm dersleri görür (11)', v_int = 11, v_int::text);

  perform public.review_change_request(v_id, true, null);
  select to_char(starts_at at time zone 'UTC', 'MM-DD HH24:MI') into v_txt
  from public.lessons where id = (select lesson_id from public.lesson_change_requests where id = v_id);
  insert into rls_results (test, ok, detail) values ('kurucu ertelemeyi onaylayınca ders taşınır', v_txt = '10-30 16:00', v_txt);

  select public.review_lessons(array_agg(id), true, null) into v_int
  from public.lessons where approval_status = 'pending';
  insert into rls_results (test, ok, detail) values ('kurucu bekleyen dersleri toplu onaylar (2)', v_int = 2, v_int::text);

  reset role;

  select string_agg(n || ' ' || case when ok then 'OK  ' else 'FAIL' end || ' | ' || test || ' | ' || left(detail, 90), E'
' order by n)
    into v_txt from rls_results;
  select count(*) filter (where not ok) into v_int from rls_results;
  raise exception E'RLS SONUÇLARI (hatalı: %)
%', v_int, v_txt;
end $$;
