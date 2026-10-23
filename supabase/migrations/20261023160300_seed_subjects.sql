-- Başlangıç branş listesi (kurucular Ayarlar'dan düzenleyebilir)
insert into public.subjects (name, color, sort_order) values
  ('Matematik', '#1b2e6e', 10),
  ('Geometri', '#3b5bb5', 20),
  ('Fizik', '#7c3aed', 30),
  ('Kimya', '#0891b2', 40),
  ('Biyoloji', '#2e8b3a', 50),
  ('Türkçe', '#d97706', 60),
  ('Edebiyat', '#b45309', 70),
  ('Tarih', '#9f1239', 80),
  ('Coğrafya', '#0f766e', 90),
  ('Felsefe', '#6b21a8', 100),
  ('İngilizce', '#be185d', 110),
  ('Fen Bilimleri', '#15803d', 120),
  ('Sosyal Bilgiler', '#a16207', 130),
  ('Koçluk', '#1a1a2e', 140)
on conflict (name) do nothing;
