# دورة قاعدة البيانات (DB Cycle) وكيفية التعامل مع Supabase في المشروع الحالي

## 1) ما هي دورة قاعدة البيانات؟

دورة قاعدة البيانات (DB Cycle) تعني كيف تتعامل مع البيانات من أول فكرة المشروع حتى الإدخال والتحديث والحذف والتأمين والاسترجاع.

ببساطة:

1. التصميم: تحدد الجداول والحقول والعلاقات.
2. الإنشاء: تنشئ الجداول والـ migrations.
3. الاتصال: تربط التطبيق بقاعدة البيانات.
4. CRUD: insert / read / update / delete.
5. الأمان: Row Level Security (RLS).
6. الإدارة: النسخ الاحتياطي، الأداء، المراقبة.
7. التطوير المستمر: تحديثات و migrations جديدة.

في هذا المشروع، الموظف الأساسي هو Supabase مع PostgreSQL، وهذا يعني أن العمل يتم على:

- جداول
- policies
- migrations
- auth
- RLS

---

## 2) إعداد المشروع الحالي (هل تحتاج لإنشاء مشروع جديد في Supabase؟)

### الإجابة المختصرة

- إذا لديك مشروع Supabase بالفعل ومتغيرات البيئة جاهزة، فلا تحتاج لإنشاء مشروع جديد.
- أما إذا لم توجد قاعدة بيانات، فستحتاج أن تنشئ مشروع من موقع Supabase الرسمي للحصول على:
  - URL المشروع
  - anon key
  - service role key

### ما الذي يفعله هذا المشروع الآن

في ملف:

- `src/lib/db/supabase.ts`

المشروع يحدد المتغيرات التالية:

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-role-key";
```

وهذا يعني أن التطبيق يعتمد على متغيرات البيئة:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

إذا كانت هذه القيم موجودة، فلا داعي لإنشاء مشروع جديد. فقط استخدم المشروع الحالي.

### متى تحتاج إنشاء مشروع جديد؟

تحتاج إنشاء مشروع جديد فقط إذا:

- لا يوجد مشروع Supabase للعمل عليه
- تريد قاعدة بيانات جديدة من الصفر
- تريد اختبار أو تطوير بيئة مستقلة
- تريد تبديل المشروع الحالي أو إنشاء dev / prod منفصلين

### هل هذا المشروع يحتاج إلى إنشاء مشروع في موقع Supabase؟

- ليس بشكل إلزامي إذا المشروع موجود بالفعل.
- نعم، إذا كنت تريد قاعدة بيانات حقيقية ومباشرة من الموقع.

بمعنى آخر: المشروع الحالي ليس بحاجة إلى إعادة إنشاء المشروع بشكل تلقائي، لكنه يحتاج إلى وجود بياناته في المتغيرات البيئية الصحيحة.

---

## 3) ما هو Supabase في هذا المشروع؟

Supabase هنا هو backend قاعدة البيانات + authentication + policies.

التكوين الحالي يخلق عميلين:

```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
```

و:

```ts
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey ?? supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
```

### المعنى

- `supabase`: العميل العادي، غالباً للإستخدام من الواجهة أو السيرفر مع صلاحيات محدودة
- `supabaseAdmin`: العميل الإداري، يستخدم في السيرفر لوظائف مثل تسجيل المستخدم أو الإدارة

وهذا مهم جداً لأنك لا تريد أن تعطي صلاحيات واسعة لكل الطلبات من الواجهة.

---

## 4) قاعدة البيانات الحالية في المشروع

في هذا المشروع يوجد ملف migration:

- `supabase/migrations/001_init_fintech_auth.sql`

ويحتوي على جداول:

### `public.users`

```sql
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username varchar(24) not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  failed_login_attempts integer not null default 0,
  lockout_until timestamptz,
  constraint username_format check (username ~ '^[A-Za-z0-9_]{3,24}$')
);
```

### `public.expenses`

```sql
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  category text not null default 'general',
  description text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### ما الذي يهمك هنا

- `users`: بيانات المستخدمين
- `expenses`: مصروفات كل مستخدم
- كل expense مرتبطة بـ user_id
- هناك RLS (Row Level Security) يضمن أن المستخدم يرى/يعدل بياناته فقط

---

## 5) ما هو RLS؟

RLS هي سياسة حماية الصفوف.

في ملف الـ migration توجد سياسات مثل:

```sql
create policy "Users can read own row"
on public.users
for select
using (
  id = current_setting('request.jwt.claim.sub', true)::uuid
);
```

وهذا يعني:

- المستخدم يستطيع قراءة صفه فقط
- لا يستطيع الوصول إلى بيانات مستخدمين آخرين

في هذا المشروع تم استخدام:

```ts
await setAuthenticatedUserContext(userId);
```

وهذا يضع `request.jwt.claim.sub` ويتيح ربط لكل طلب بـ user_id الحالي.

هذا مهم جداً لأنه يمنح التطبيق نظام أمان ذكي بدون فتح كل شيء للعالم.

---

## 6) دورة التعامل مع البيانات في هذا المشروع

### A. استقبال البيانات من المستخدم

في الواجهة أو السيرفر، تُستقبل البيانات عبر FormData أو inputs.

مثال:

```ts
const parsed = signUpSchema.safeParse({
  username: formData.get("username"),
  password: formData.get("password"),
  confirmPassword: formData.get("confirmPassword"),
});
```

### B. التحقق من البيانات

قبل إدخال البيانات نتحقق من سلامتها، مثل:

- username لا يكون فارغًا
- password يحقق القواعد
- username غير موجود من قبل

### C. كتابة البيانات في DB

في `src/app/actions/auth.ts` توجد أمثلة:

```ts
const { data: createdUser, error: insertError } = await supabaseAdmin
  .from("users")
  .insert({
    username,
    password_hash: passwordHash,
  })
  .select("id, username")
  .single();
```

### D. قراءة البيانات

```ts
const { data: user, error } = await supabaseAdmin
  .from("users")
  .select("id, username, password_hash, failed_login_attempts, lockout_until")
  .eq("username", username)
  .maybeSingle();
```

### E. التحديث

```ts
await supabaseAdmin
  .from("users")
  .update({
    failed_login_attempts: 0,
    lockout_until: null,
  })
  .eq("id", user.id);
```

### F. الحذف

إذا كان الحذف مسموحاً في الجدول، ستستخدم:

```ts
await supabaseAdmin
  .from("expenses")
  .delete()
  .eq("id", expenseId);
```

لكن في هذا المشروع سياسة الحذف موجودة فقط على `expenses` حسب `user_id`، وليس بشكل عام.

---

## 7) CRUD: Insert, Select, Update, Delete

### 1. Insert (إضافة صف جديد)

```ts
const { data, error } = await supabaseAdmin
  .from("expenses")
  .insert({
    user_id: userId,
    title: "قهوة",
    amount: 15.5,
    category: "food",
    description: "قهوة صباحية",
    occurred_on: "2026-11-07",
  })
  .select();
```

### 2. Select (قراءة البيانات)

```ts
const { data, error } = await supabaseAdmin
  .from("expenses")
  .select("*")
  .eq("user_id", userId)
  .order("occurred_on", { ascending: false });
```

### 3. Update (تحديث صف)

```ts
const { data, error } = await supabaseAdmin
  .from("expenses")
  .update({
    amount: 30,
    title: "فاتورة مطعم",
    updated_at: new Date().toISOString(),
  })
  .eq("id", expenseId)
  .eq("user_id", userId)
  .select();
```

### 4. Delete (حذف صف)

```ts
const { error } = await supabaseAdmin
  .from("expenses")
  .delete()
  .eq("id", expenseId)
  .eq("user_id", userId);
```

### ملاحظات مهمة

- `eq(...)` = شرط التساوي
- `select()` = يطلب البيانات
- `single()` = يطلب سجل واحد فقط
- `maybeSingle()` = يأخذ سجل واحد أو null
- `.order(...)` = ترتيب النتائج
- `.limit(...)` = تحديد عدد النتائج

---

## 8) أين تكتب عمليات DB في هذا المشروع؟

عادةً:

- في server actions: `src/app/actions/*.ts`
- في Helpers: `src/lib/...`
- لا تضع عمليات DB مباشرة في الواجهة إذا كانت حساسة

الأفضل في هذا المشروع أن تكون عمليات قاعدة البيانات داخل:

- `server action`
- أو `withAuthenticatedDbContext`
- أو `supabaseAdmin` داخل السيرفر

مثال:

```ts
import { supabaseAdmin } from "@/lib/db/supabase";

export async function createExpense(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .insert({
      user_id: userId,
      title: "إيجار",
      amount: 2000,
      category: "housing",
      occurred_on: new Date().toISOString().slice(0, 10),
    });

  return { data, error };
}
```

---

## 9) كيف تتعامل مع Supabase بشكل صحيح؟

### قاعدة ذهبية

- لا تضع `service role` في client-side UI
- لا تفتح جداول كاملة للمستخدمين بدون RLS
- استخدم `supabaseAdmin` فقط على السيرفر
- استخدم `supabase` فقط في الأماكن الآمنة
- كل جدول يحتاج policies مناسبة

### مثال عملي

- تسجيل مستخدم: `supabaseAdmin`
- تحقق من اسم المستخدم: `supabaseAdmin`
- إدخال مصروفات: `supabaseAdmin` مع `user_id` الحالي
- قراءة مصروفات المستخدم: `supabaseAdmin` مع `eq("user_id", currentUserId)`

---

## 10) مثال كامل: إنشاء مستخدم جديد في Supabase

```ts
import { supabaseAdmin } from "@/lib/db/supabase";

export async function createUser(username: string, passwordHash: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      username,
      password_hash: passwordHash,
    })
    .select("id, username")
    .single();

  if (error) {
    console.error(error.message);
    return null;
  }

  return data;
}
```

---

## 11) مثال كامل: إضافة مصروف جديد

```ts
import { supabaseAdmin } from "@/lib/db/supabase";

export async function addExpense(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .insert({
      user_id: userId,
      title: "شراء لوازم",
      amount: 120,
      category: "shopping",
      description: "مستلزمات منزلية",
      occurred_on: "2026-11-07",
    })
    .select();

  if (error) {
    console.error(error.message);
    return null;
  }

  return data;
}
```

---

## 12) مثال كامل: تحديث مصروف

```ts
import { supabaseAdmin } from "@/lib/db/supabase";

export async function updateExpense(userId: string, expenseId: string, newAmount: number) {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .update({ amount: newAmount })
    .eq("id", expenseId)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error(error.message);
    return null;
  }

  return data;
}
```

---

## 13) مثال كامل: حذف مصروف

```ts
import { supabaseAdmin } from "@/lib/db/supabase";

export async function deleteExpense(userId: string, expenseId: string) {
  const { error } = await supabaseAdmin
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", userId);

  if (error) {
    console.error(error.message);
    return false;
  }

  return true;
}
```

---

## 14) هل تحتاج إلى استخدام Supabase website؟

### إذا المشروع جاهز فعلاً

لا. لا تحتاج إنشاء مشروع جديد إذا:

- المشروع الحالي لديه URL و keys
- الهيكل العلوي جاهز
- المراجع والـ migrations موجودة

### إذا لا يوجد مشروع بالفعل

نعم، تحتاج:

1. الدخول إلى موقع Supabase
2. إنشاء مشروع جديد
3. الحصول على:
   - Project URL
   - anon key
   - service role key
4. وضعها في `.env.local`

نموذج:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx
```

### الخلاصة

- لا تحتاج إنشاء مشروع جديد إذا كنت تستعمل مشروع موجود
- تحتاج إنشاء مشروع جديد فقط إذا لم يوجد مشروع DB فعلاً
- في هذه الحالة، المشروع الحالي يتطلب فقط إعداد البيئة والمفاتيح الصحيحة

---

## 15) الخلاصة النهائية

هذا المشروع مبني على فكرة أن:

- Supabase هو قاعدة البيانات
- PostgreSQL هو محركها
- RLS هو الحماية
- السيرفر هو المكان المناسب للعمليات الحساسة
- `supabaseAdmin` يتيح التحكم الكامل داخل السيرفر
- كل عملية CRUD يجب أن تمر عبر تنظيف البيانات والتحقق من الصلاحيات

إذا كان لديك مشروع Supabase جاهز، فلا داعي لإنشاء مشروع جديد. فقط تأكد من:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

وبعدها يمكنك إضافة / تحديث / حذف / قراءة الصفوف بسهولة.

---

## 16) نصائح عملية

- ضع كل استعلام DB في السيرفر لا في العميل
- لا تستخدم `service_role` في الواجهة
- تأكد من وجود `RLS` لكل جدول
- استخدم `migrations` بدل التعديل اليدوي داخل قاعدة البيانات
- اختبر كل CRUD قبل الربط مع الواجهة
- احتفظ بمفاتيح المشروع في `.env.local` وليس داخل الكود

إذا أردت، أستطيع في الخطوة التالية أن أجهز لك:

1. ملف `.env.example` جاهز
2. أمثلة CRUD إضافية خاصة بجداولك
3. أو شرح عملي لكيفية إنشاء مشروع Supabase من الصفر خطوة بخطوة
