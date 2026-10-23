-- Performans: "for all" kurucu politikaları SELECT ile çakışıyordu → insert/update/delete'e böl.
-- Not: review_lessons, review_change_request, get_credit_balances SECURITY DEFINER'dır ve
-- yetkiyi içeride kontrol eder (advisor uyarısı bilinçli).

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'subjects', 'tutor_subjects', 'tutors', 'students',
    'tutor_students', 'student_packages', 'payments', 'tutor_payouts'
  ] loop
    execute format('drop policy %I on public.%I', t || '_founder_write', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.is_founder()))',
      t || '_founder_insert', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.is_founder())) with check ((select private.is_founder()))',
      t || '_founder_update', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_founder()))',
      t || '_founder_delete', t);
  end loop;
end $$;

-- Sık kullanılan yabancı anahtarlar için indeksler
create index lesson_series_tutor_idx on public.lesson_series (tutor_id);
create index lesson_series_student_idx on public.lesson_series (student_id);
create index lessons_subject_idx on public.lessons (subject_id);
create index tutor_students_subject_idx on public.tutor_students (subject_id);
create index change_requests_requested_by_idx on public.lesson_change_requests (requested_by);
