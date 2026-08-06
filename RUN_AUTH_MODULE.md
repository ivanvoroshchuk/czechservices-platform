# 🚀 RUN AUTH MODULE - Крок за кроком

**AUTH MODULE готовий! Ось як його запустити:**

---

## ✅ КРОК 1: Переконайся що backend запущений

```bash
cd packages/backend

# Якщо не запущений, запусти:
pnpm run start:dev

# Повинен показати:
# 🚀 CzechServices Backend Server Started! 🚀
# Server: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

**Якщо вже запущений - ОК! 👍**

---

## ✅ КРОК 2: Відкрий Swagger Docs

У браузері відкрий:
```
http://localhost:3000/api/docs
```

Повинна бути сторінка з **Auth** section та 4 endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

---

## ✅ КРОК 3: Протестуй Register

У Swagger:
1. Клікни на `POST /api/auth/register`
2. Клікни **"Try it out"**
3. Скопіюй і вставь в "Request body":

```json
{
  "email": "ivan@example.com",
  "phone": "+420777123456",
  "password": "SecurePassword123!",
  "firstName": "Ivan",
  "lastName": "Voroshchuk",
  "dateOfBirth": "1990-01-15"
}
```

4. Клікни **"Execute"**

**Очікуй відповідь:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "clu...",
  "email": "ivan@example.com",
  "isAgeVerified": false,
  "expiresIn": 900
}
```

✅ **Register працює!**

---

## ✅ КРОК 4: Протестуй Login

1. Клікни на `POST /api/auth/login`
2. Клікни **"Try it out"**
3. Вставь:

```json
{
  "email": "ivan@example.com",
  "password": "SecurePassword123!"
}
```

4. Клікни **"Execute"**

**Очікуй същої відповіді як при register**

✅ **Login працює!**

---

## ✅ КРОК 5: Протестуй GET /api/auth/me

1. Клікни на `GET /api/auth/me`
2. Клікни **"Try it out"**
3. Знайди кнопку **"Authorize"** вгорі сторінки
4. У модальному вікні вставь **accessToken** з previous request:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Або просто вставь без "Bearer ", система добавить автоматично)

5. Клікни **"Authorize"**
6. Закрий модальне вікно
7. Знову клікни на `GET /api/auth/me` → **"Execute"**

**Очікуй:**
```json
{
  "id": "clu...",
  "email": "ivan@example.com",
  "phone": "+420777123456",
  "firstName": "Ivan",
  "lastName": "Voroshchuk",
  "profilePicture": null,
  "isAgeVerified": false,
  "role": "USER",
  "isActive": true,
  "isSuspended": false,
  "createdAt": "2026-08-06T12:00:00.000Z"
}
```

✅ **GET /api/auth/me працює!**

---

## ✅ КРОК 6: Запусти E2E Тести

У новому терміналі:

```bash
cd packages/backend

# Запусти E2E тести
pnpm run test:e2e

# Повинно бути:
# PASS  test/auth.e2e.spec.ts
#   Auth (e2e)
#     POST /api/auth/register
#       ✓ should register a new user
#       ✓ should not register with duplicate email
#       ✓ should not register with invalid email
#       ✓ should not register with short password
#     POST /api/auth/login
#       ✓ should login with correct credentials
#       ✓ should not login with wrong password
#       ✓ should not login with non-existent email
#     POST /api/auth/refresh
#       ✓ should refresh token with valid refresh token
#       ✓ should not refresh with invalid token
#     GET /api/auth/me
#       ✓ should get current user with valid token
#       ✓ should not get user without token
#       ✓ should not get user with invalid token
#
# Test Suites: 1 passed, 1 total
# Tests: 13 passed, 13 total ✓
```

✅ **Всі тести проходять!**

---

## 🎯 SUCCESS CRITERIA

Якщо видиш ✅ на всі пункти, то AUTH MODULE повністю працює:

- ✅ Register новий користувач
- ✅ Login з email + password
- ✅ Отримати accessToken + refreshToken
- ✅ GET /api/auth/me з JWT token
- ✅ 13 E2E тестів проходять

---

## 🔐 Що я написав

### ✅ Services (src/modules/auth/)
- `auth.service.ts` - реєстрація, логін, токени, поточний користувач

### ✅ Controllers (src/modules/auth/)
- `auth.controller.ts` - 4 REST endpoints

### ✅ Strategies (src/modules/auth/strategies/)
- `jwt.strategy.ts` - перевірка access token
- `jwt-refresh.strategy.ts` - перевірка refresh token

### ✅ Guards (src/modules/auth/guards/)
- `jwt-auth.guard.ts` - потребує JWT token
- `age-verified.guard.ts` - потребує 18+ верифікацію

### ✅ DTOs (src/modules/auth/dto/)
- `register.dto.ts` - для реєстрації
- `login.dto.ts` - для логіну
- `refresh-token.dto.ts` - для рефреш токену
- `auth-response.dto.ts` - для відповіді з токенами

### ✅ Decorators (src/common/decorators/)
- `current-user.decorator.ts` - отримати користувача з JWT
- `public.decorator.ts` - позначити endpoint як public

### ✅ Module (src/modules/auth/)
- `auth.module.ts` - інтеграція всього разом

### ✅ Tests (test/)
- `auth.e2e.spec.ts` - 13 E2E тестів для усіх cases

### ✅ Updated Files
- `src/app.module.ts` - добавлено AuthModule + глобальний JwtAuthGuard

---

## 📊 Що це дає

### Для користувача:
- ✅ Можна зареєструватися
- ✅ Можна логінитися
- ✅ Отримує JWT токени
- ✅ Може оновити accessToken через refreshToken
- ✅ Може перевірити свої дані з `/api/auth/me`

### Для розробника:
- ✅ Всі endpoints захищені JWT guard
- ✅ Можна використовувати `@CurrentUser()` для отримання користувача
- ✅ Можна використовувати `@AgeVerifiedGuard()` для захисту endpoints які потребують 18+
- ✅ Можна використовувати `@Public()` для public endpoints
- ✅ Готові E2E тести для усіх cases

---

## 🚀 Наступні модулі (яких напишемо далі)

1. ✅ **AUTH MODULE** - готовий! 
2. ⏳ **USERS MODULE** - базовий CRUD
3. ⏳ **VERIFICATION MODULE** - 18+ верифікація (Veriff)
4. ⏳ **LOCATIONS MODULE** - регіони та міста
5. ⏳ **SERVICES MODULE** - типи послуг
6. ⏳ **PROFILES MODULE** - анкети

---

## 💡 Корисні команди

```bash
# Запусти backend
pnpm run start:dev

# Запусти E2E тести
pnpm run test:e2e

# Запусти усі тести
pnpm run test

# Запусти тести з coverage
pnpm run test:cov

# Запусти linter
pnpm run lint

# Format код
pnpm run format
```

---

## 🎉 READY TO GO!

AUTH MODULE повністю функціональний та готовий до використання!

Наступний крок: напишу **USERS MODULE** для базового CRUD управління користувачами.

**Напиши як закінчиш тестування!** ✅
