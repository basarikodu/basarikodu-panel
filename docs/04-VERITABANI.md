# 04 · Veritabanı Şeması (Supabase / PostgreSQL)

> **v1 kapsamı:** `profiles`, `tutors`, `tutor_subjects`, `students`, `subjects`, `tutor_students`, `lesson_series`, `lessons`, `lesson_change_requests`, `student_packages` (aylık paket), `payments`, `tutor_payouts`, `app_settings` + `student_credit_balance` view.
> `lessons` tablosunda v1'de kullanılan sonuç alanları: `status`, `topic` (eğitmen notu). `homework*`, `performance`, `note_private`, `student_package_id` kolonları **v1 sonrası** eklenir.
> **v1 sonrası:** `package_types` (şablonlar), `payout_adjustments`, `calendar_events` (akademik & içerik takvimi), `audit_log`. Bu dokümanda tasarımları hazır tutulur.

## 1. İlişki diyagramı

```mermaid
erDiagram
  profiles ||--o| tutors : "role=tutor"
  profiles ||--o| students : "role=student"
  tutors ||--o{ tutor_students : ""
  students ||--o{ tutor_students : ""
  subjects ||--o{ tutor_students : ""
  tutors ||--o{ lessons : ""
  students ||--o{ lessons : ""
  subjects ||--o{ lessons : ""
  lesson_series ||--o{ lessons : ""
  lessons ||--o{ lesson_change_requests : "onay talebi"
  package_types ||--o{ student_packages : ""
  students ||--o{ student_packages : ""
  student_packages ||--o{ lessons : "hak düşer"
  students ||--o{ payments : ""
  student_packages ||--o{ payments : ""
  tutors ||--o{ tutor_payouts : ""
  tutor_payouts ||--o{ payout_adjustments : ""
  calendar_events }o--|| profiles : "sorumlu"
```

## 2. Tablolar

### Kimlik
**profiles** — `auth.users` ile 1-1
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK → auth.users | |
| role | enum `user_role` (`founder`,`tutor`,`student`) | |
| full_name | text | |
| phone | text | |
| avatar_url | text null | |
| is_active | bool default true | Pasif kullanıcı giriş yapamaz |
| created_at / updated_at | timestamptz | |

**tutors**
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK → profiles | |
| university, department | text | |
| yks_rank | int null | "Türkiye 382." |
| bio | text null | |
| services | text[] | `ozel_ders`, `kocluk` |
| default_meeting_url | text null | Kişisel Zoom/Meet odası |
| iban | text null | Sadece kurucu + kendisi görür |
| payout_frequency | enum (`weekly`,`monthly`) default `monthly` | Ödeme sıklığı |

**tutor_subjects** (tutor_id, subject_id) — eğitmenin verebildiği branşlar

**students**
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK → profiles | |
| grade | smallint (1–12, 13 = mezun) | |
| goal | enum `student_goal` (`yks`,`lgs`,`okul`,`genel`) | |
| school | text null | |
| guardian_name, guardian_phone | text null | Veli |
| founder_notes | text null | Sadece kurucular |

**subjects** — id, name, color, sort_order, is_active

**tutor_students** — eşleştirme
| id, tutor_id, student_id, subject_id, service (`ozel_ders`/`kocluk`), is_active, assigned_at, assigned_by |
Unique: (tutor_id, student_id, subject_id) aktifken.

### Dersler
**lesson_series** — tekrarlayan plan
| id, tutor_id, student_id, subject_id, lesson_type, weekday (1–7), start_time (time), duration_min, starts_on, ends_on, is_active |

**lessons**
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| series_id | uuid null → lesson_series | |
| tutor_id, student_id, subject_id | uuid | |
| lesson_type | enum (`ozel_ders`,`kocluk`) | |
| starts_at, ends_at | timestamptz | |
| status | enum `lesson_status`: `planned`, `completed`, `no_show`, `cancelled_by_student`, `cancelled_by_tutor`, `postponed` | |
| approval_status | enum `approval_status`: `pending`, `approved`, `rejected` | Eğitmen oluşturursa `pending`, kurucu oluşturursa `approved` |
| approved_by, approved_at | uuid null, timestamptz null | Onaylayan kurucu |
| rejection_reason | text null | |
| meeting_url | text null | |
| student_package_id | uuid null | Hakkın düştüğü paket |
| is_free | bool default false | Hediye koçluk |
| tutor_rate_snapshot | numeric(10,2) | Ders oluşturulurken kopyalanır |
| topic | text null | İşlenen konu |
| homework | text null | |
| homework_done | bool default false | Öğrenci işaretler |
| performance | smallint null (1–5) | |
| note_for_student | text null | Öğrenci/veli görür |
| note_private | text null | Sadece eğitmen + kurucu |
| postponed_to | uuid null → lessons | Ertelemede yeni ders |
| created_by | uuid | |
| completed_at | timestamptz null | |

Kısıtlar:
```sql
alter table lessons add constraint no_tutor_overlap
  exclude using gist (tutor_id with =, tstzrange(starts_at, ends_at) with &&)
  where (status = 'planned' and approval_status <> 'rejected');
alter table lessons add constraint no_student_overlap
  exclude using gist (student_id with =, tstzrange(starts_at, ends_at) with &&)
  where (status = 'planned' and approval_status <> 'rejected');
```

**lesson_change_requests** — eğitmenin onaylanmış bir ders üzerindeki erteleme/iptal talepleri (ders, onaya kadar değişmez)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| lesson_id | uuid → lessons | |
| request_type | enum: `reschedule`, `cancel` | |
| new_starts_at, new_ends_at | timestamptz null | reschedule için |
| cancel_status | lesson_status null | `cancelled_by_student` / `cancelled_by_tutor` |
| reason | text | Eğitmenin açıklaması |
| status | approval_status | `pending` → `approved`/`rejected` |
| requested_by | uuid | |
| reviewed_by, reviewed_at | uuid null, timestamptz null | |
| review_note | text null | Red sebebi |
Kısıt: bir derste aynı anda tek `pending` talep (partial unique index).

Yeni ders ve seri talepleri ayrı tabloda tutulmaz: `lessons.approval_status = 'pending'` satırlarıdır; seri talepleri `series_id` ile gruplanıp toplu onaylanır.

**app_settings** — tek satırlık genel ayarlar
| tutor_rate_private numeric(10,2) | tutor_rate_coaching numeric(10,2) | lesson_duration_private (60) | lesson_duration_coaching (40) | updated_by, updated_at |
Eğitmen ücreti **tüm eğitmenler için aynıdır**; değişiklik sadece sonraki onaylanan dersleri etkiler (snapshot).
İndeksler: (tutor_id, starts_at), (student_id, starts_at), (status, starts_at).

### Finans
**package_types** — id, name ("Haftada 2 Ders"), lesson_type, lesson_count (8), unit_price (850), total_price (6800), includes_free_coaching (bool), is_active
Seed: Tek Ders 950×1, Haftada 2 850×8=6.800, Haftada 3 800×12=9.600, Koçluk (fiyat kurucu girer).

**student_packages** — öğrencinin **aylık** paketi (v1)
| Kolon | Tip | Not |
|---|---|---|
| id | uuid PK | |
| student_id | uuid → students | |
| month | date | Ayın 1'i (ör. 2026-11-01) |
| lesson_count | smallint | 4 / 8 / 12 / özel |
| price_total | numeric(10,2) | Paket tutarı (beklenen gelir) |
| note | text null | |
| created_by | uuid | |
Unique: (student_id, month).

**student_credit_balance** (view) — öğrenci bazında hak hesabı, sayaç tutulmaz, her seferinde hesaplanır:
- `total_credits` = Σ `student_packages.lesson_count` (bugüne kadarki aylar)
- `used_credits` = `completed` ve `is_free = false` ders sayısı
- `remaining` = total − used (kullanılmayan hak sonraki aya devreder)
- `month_package`, `month_completed`, `carried_over` (bu ay için gösterim)
Öğrenci kendi satırını, eğitmen atanmış öğrencilerinin satırını (tutarsız), kurucu tümünü görür.

**payments** (öğrenciden tahsilat)
| id, student_id, student_package_id null, amount, paid_at (date), method (`havale`,`nakit`,`kart`,`diger`), note, recorded_by |

**tutor_payouts** (eğitmene ödeme dönemi — ödeme panel dışında manuel yapılır, burada kaydı tutulur)
| id, tutor_id, period_start (date), period_end (date), lesson_count, lesson_total (hesaplanan), adjustment_total, amount_paid, paid_at null, status (`open`,`paid`), note |
Unique: (tutor_id, period_start). Dönem uzunluğu eğitmenin `tutors.payout_frequency` (`weekly` | `monthly`) ayarından gelir; hafta Pazartesi–Pazar.

Haftalık/aylık gelir-gider raporu ayrı tablo değil, view/RPC: `finance_summary(from, to)` → tahsilat toplamı, tamamlanan ders hakediş toplamı, net, ders sayısı (branş/eğitmen kırılımı).

**payout_adjustments** — id, payout_id, amount (+/−), reason

### Akademik & içerik takvimi
**calendar_events**
| Kolon | Tip | Not |
|---|---|---|
| id | uuid | |
| category | enum: `exam`, `school`, `holiday`, `content`, `campaign`, `other` | |
| content_type | enum null: `tanitim`, `viral`, `egitmen_tanitimi`, `egitici`, `motivasyon`, `kampanya` | category=content ise |
| content_status | enum null: `fikir`, `senaryo`, `cekildi`, `kurgu`, `hazir`, `yayinlandi` | |
| platforms | text[] | instagram, tiktok, youtube |
| title | text | |
| description | text null | Senaryo / not |
| starts_at, ends_at | timestamptz | |
| all_day | bool | |
| is_tentative | bool | "Tahmini" (YKS/LGS) |
| visible_to_students | bool default false | Öğrenci takviminde görünsün |
| exam_kind | text null | `yks`,`lgs`,`yazili`,`deneme` → geri sayım için |
| assignee_id | uuid null → profiles (founder) | |
| published_url | text null | |
| color | text null | |

### Sistem
**audit_log** — id, actor_id, action, entity, entity_id, diff jsonb, created_at (trigger ile: lessons durum, payments, payouts, student_packages)

## 3. Trigger / fonksiyonlar
- `handle_new_user()` — auth.users insert → profiles satırı (rol, davetteki metadata'dan)
- `custom_access_token_hook()` — JWT'ye `user_role` claim ekler
- Ders hakkı için trigger yok: `student_credit_balance` view'ı yalnızca `completed` dersleri sayar; `no_show` / iptal / erteleme hak düşürmez. Durum düzeltmeleri otomatik doğru yansır.
- `set_tutor_rate_snapshot()` — ders onaylandığında `app_settings`'teki ortak ücreti kopyalar; `is_free=true` (hediye koçluk) ise 0
- `force_pending_for_tutor()` — eğitmenin insert ettiği derste `approval_status`'ü zorla `pending` yapar (istemciye güvenilmez)
- `approve_lesson_request(request_id | lesson_ids[])` / `reject_lesson_request(..., reason)` — yalnızca founder; talebi atomik uygular (erteleme → saat değişir, iptal → status değişir), çakışma varsa hata döner
- `compute_payout(tutor_id, period_start, period_end)` — RPC; dönemdeki `completed` derslerin toplamı
- `guard_locked_period()` — ödenmiş dönemdeki dersin eğitmen tarafından değiştirilmesini engeller

## 4. Row Level Security özeti

Yardımcı fonksiyonlar: `auth_role()` (JWT claim), `is_founder()`, `auth.uid()`.

| Tablo | founder | tutor | student |
|---|---|---|---|
| profiles | tümü R/W | kendisi + atanmış öğrencileri (R) | kendisi + eğitmenleri (R, sınırlı kolon) |
| tutors | tümü R/W | kendisi R/W (ücret, IBAN hariç W) | eğitmenleri R (public kolonlar — view) |
| students | tümü R/W | atanmış öğrencileri R (founder_notes hariç — view) | kendisi R |
| tutor_students | R/W | kendi satırları R | kendi satırları R |
| lessons | R/W | kendi dersleri R; insert yalnızca atanmış öğrenciye ve `pending`; update yalnızca sonuç alanları (completed/no_show, konu, ödev, notlar) — saat/iptal değişikliği yok | kendi **onaylı** dersleri R; yalnızca `homework_done` W |
| lesson_change_requests | R/W | kendi derslerine insert + R | — |
| app_settings | R/W | R (ücret — kendi hakedişi için) | — |
| lesson_series | R/W | kendi R/W | — |
| package_types | R/W | — | R |
| student_packages | R/W | atanmış öğrencinin kalan hakkı (view, tutar yok) | kendisi R |
| payments | R/W | — | kendisi R |
| tutor_payouts / adjustments | R/W | kendisi R | — |
| calendar_events | R/W | `visible_to_students` R | `visible_to_students` R |
| audit_log | R | — | — |

Hassas kolonlar (ücret, IBAN, kurucu notları, `note_private`) için ayrı **view**'lar (`tutor_public`, `student_for_tutor`, `lesson_for_student`) kullanılır; RLS satırı, view kolonları sınırlar.

## 5. Migration sırası
1. `0001_enums_and_profiles.sql`
2. `0002_tutors_students_subjects.sql`
3. `0003_lessons.sql` (+ btree_gist extension, exclusion constraints)
4. `0004_finance.sql`
5. `0005_calendar_events.sql`
6. `0006_rls_policies.sql`
7. `0007_triggers_functions.sql`
8. `seed.sql`
