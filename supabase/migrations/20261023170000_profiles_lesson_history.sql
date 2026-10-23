-- Öğrenci ↔ eğitmen, aralarında ders geçmişi varsa birbirinin profil adını görebilir
-- (atama kaldırılsa bile eski derslerde ad görünür). tutors tablosu (IBAN) erişimi değişmez.

create function private.has_lesson_with(p_other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.lessons
    where (student_id = (select auth.uid()) and tutor_id = p_other)
       or (tutor_id = (select auth.uid()) and student_id = p_other)
  )
$$;
revoke all on function private.has_lesson_with(uuid) from public;
grant execute on function private.has_lesson_with(uuid) to authenticated;

drop policy profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (
  id = (select auth.uid()) or (select private.is_founder())
  or private.is_my_student(id) or private.is_my_tutor(id)
  or private.has_lesson_with(id)
);
