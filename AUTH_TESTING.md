# 🔐 Auth Module Testing Guide

## ✅ AUTH MODULE ГОТОВИЙ!

Я написав повний **AUTH MODULE** з регістрацією, логіном, JWT токенами.

---

## 📋 Що написав:

### ✅ DTOs (Data Transfer Objects)
- `RegisterDto` - для регістрації
- `LoginDto` - для логіну
- `RefreshTokenDto` - для рефреш токену
- `AuthResponseDto` - для відповіді з токенами

### ✅ Services
- `AuthService` - основна логіка:
  - `register()` - регістрація новий користувач
  - `login()` - логін з email + password
  - `refreshToken()` - оновлення access token
  - `getCurrentUser()` - отримати інфо про користувача

### ✅ Strategies (Passport)
- `JwtStrategy` - для перевірки access token
- `JwtRefreshStrategy` - для перевірки refresh token

### ✅ Guards (Захист routes)
- `JwtAuthGuard` - потребує JWT token
- `AgeVerifiedGuard` - потребує 18+ верифікацію

### ✅ Decorators (Для зручності)
- `@CurrentUser()` - отримати користувача з JWT
- `@Public()` - позначити endpoint як public (без auth)

### ✅ Controller
- `POST /api/auth/register` - реєстрація
- `POST /api/auth/login` - логін
- `POST /api/auth/refresh` - рефреш токену
- `GET /api/auth/me` - інфо про поточного користувача

### ✅ E2E Tests
- Повні тести для всіх endpoints
- Тести для помилок
- Тести для валідації

---

## 🚀 ТЕСТУВАННЯ AUTH MODULE

### 1️⃣ Запусти backend (якщо він не запущений)

```bash
cd packages/backend
pnpm run start:dev
```

Повинен бути список подібний:
```
🚀 CzechServices Backend Server Started! 🚀
Server:  http://localhost:3000
Swagger: http://localhost:3000/api/docs
```

---

### 2️⃣ Тестуй через Swagger

Відкрий у браузері:
```
http://localhost:3000/api/docs
```

Там видиш **Auth** section з 4 endpoints. Кліку на них!

---

### 3️⃣ Тестуй вручну (cURL або Postman)

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "phone": "+420777123456",
    "password": "SecurePassword123!",
    "firstName": "Ivan",
    "lastName": "Voroshchuk",
    "dateOfBirth": "1990-01-15"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "cluxxxxxxx",
  "email": "ivan@example.com",
  "isAgeVerified": false,
  "expiresIn": 900
}
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4️⃣ Запусти E2E тести

```bash
cd packages/backend

# Запусти E2E тести
pnpm run test:e2e

# Повинен вивести:
# PASS  test/auth.e2e.spec.ts (X.XXXs)
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
# Tests:       13 passed, 13 total
```

---

## 📊 Перевіри що працює

### ✅ Регістрація:
- [ ] Новий користувач створюється
- [ ] Повертаються accessToken + refreshToken
- [ ] Не можна зареєструватися з тим же email/phone
- [ ] Password має бути min 8 символів
- [ ] Email мав бути валідний
- [ ] Phone має бути валідний (CZ формат)

### ✅ Логін:
- [ ] Логін з правильним email + password
- [ ] Не логінить з неправильним password
- [ ] Не логінить з неіснуючим email
- [ ] Повертаються accessToken + refreshToken

### ✅ Рефреш токену:
- [ ] Може оновити accessToken з refreshToken
- [ ] Не працює з неправильним refreshToken

### ✅ GET /api/auth/me:
- [ ] Повертає інфо про поточного користувача
- [ ] Потребує JWT token в Authorization header
- [ ] Не працює без token

---

## 🎯 Success Criteria

Коли все працює:

```
✅ POST /api/auth/register - 201 ✅
✅ POST /api/auth/login - 200 ✅
✅ POST /api/auth/refresh - 200 ✅
✅ GET /api/auth/me - 200 ✅
✅ E2E tests: 13 passed ✅
```

---

## 📁 Структура файлів

```
packages/backend/
├── src/
│   ├── modules/auth/
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── auth-response.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── age-verified.guard.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── auth.module.ts
│   ├── common/decorators/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   └── app.module.ts (updated)
├── test/
│   ├── auth.e2e.spec.ts
│   └── jest-e2e.json
```

---

## 🔑 JWT Tokens

### Access Token (15 minutes)
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "userId",
  "email": "ivan@example.com",
  "isAgeVerified": false,
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token (7 days)
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "userId",
  "email": "ivan@example.com",
  "iat": 1234567890,
  "exp": 1234740590
}
```

---

## 🚨 Якщо щось не працює

### Error: "User with this email already exists"
```
Використовуй інший email для реєстрації
```

### Error: "Invalid email or password"
```
Перевір email + password, які використовуються
```

### Error: "User must complete age verification (18+)"
```
Цей endpoint потребує 18+ верифікацію
Напишемо Verification Module далі
```

### Error: "Unauthorized - invalid or missing token"
```
Передай Authorization header:
Authorization: Bearer {accessToken}
```

---

## 📝 Наступні кроки

1. ✅ **AUTH MODULE** - готовий!
2. ⏳ **USERS MODULE** - базовий CRUD для користувачів
3. ⏳ **VERIFICATION MODULE** - 18+ верифікація (Veriff)
4. ⏳ **LOCATIONS MODULE** - регіони та міста Чехії
5. ⏳ **SERVICES MODULE** - типи послуг
6. ⏳ **PROFILES MODULE** - анкети послуг

---

**ТЕСТУ AUTH MODULE! 🧪**

Напиши результат! ✅

---

Last updated: 2026-08-06
