-- Hediye koçluk kuralı, dersi kurucu eklese de uygulanır (8+ derslik aylık paket → koçluk ücretsiz).
-- lessons_guard içindeki koşul fonksiyon gövdesinde; yalnızca o satırı değiştirmek için fonksiyon
-- yeniden tanımlanmaz, ayrı bir BEFORE INSERT trigger'ı eklenir (guard'dan önce çalışır: isim sırası).

create function private.lessons_free_coaching() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.lesson_type = 'kocluk' and not coalesce(new.is_free, false) then
    new.is_free := exists (
      select 1 from public.student_packages p
      where p.student_id = new.student_id and p.lesson_count >= 8
        and p.month = date_trunc('month', new.starts_at at time zone 'Europe/Istanbul')::date
    );
  end if;
  return new;
end $$;

-- PostgreSQL aynı olaydaki trigger'ları ada göre sıralar: "lessons_a_free_coaching" < "lessons_guard"
create trigger lessons_a_free_coaching before insert on public.lessons
  for each row execute function private.lessons_free_coaching();

-- Kurucu eklemesiyle hediye işaretlenmemiş, henüz tamamlanmamış koçlukları düzelt
update public.lessons l set is_free = true
where l.lesson_type = 'kocluk' and not l.is_free and l.status = 'planned'
  and exists (
    select 1 from public.student_packages p
    where p.student_id = l.student_id and p.lesson_count >= 8
      and p.month = date_trunc('month', l.starts_at at time zone 'Europe/Istanbul')::date
  );
