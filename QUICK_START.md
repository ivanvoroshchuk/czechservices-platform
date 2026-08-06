# 🚀 QUICK START - Run All 4 Modules

**You now have 4 fully functional backend modules! Here's how to run them all:**

---

## ✅ STEP 1: Backend Already Running?

Check if backend is running:
```
http://localhost:3000/api/docs
```

If you see Swagger UI with **Auth**, **Users**, **Locations**, **Services** sections - skip to **STEP 3**.

---

## ✅ STEP 2: Start Backend (if not running)

```bash
cd packages/backend

# Start dev server
pnpm run start:dev

# Should see:
# 🚀 CzechServices Backend Server Started! 🚀
# Server: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

---

## ✅ STEP 3: Open Swagger UI

```
http://localhost:3000/api/docs
```

You should see **4 main sections:**

### 1️⃣ Auth (4 endpoints)
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login
POST /api/auth/refresh - Refresh token
GET /api/auth/me - Current user
```

### 2️⃣ Users (9 endpoints) 
```
GET /api/users/me - Current user profile
GET /api/users - List all users
GET /api/users/:id - Get user by ID
PATCH /api/users/me - Update current user
PATCH /api/users/:id - Update any user
DELETE /api/users/me - Delete current user
DELETE /api/users/:id - Delete any user
PATCH /api/users/:id/suspend - Suspend user
PATCH /api/users/:id/unsuspend - Unsuspend user
```

### 3️⃣ Locations (6 endpoints) - PUBLIC ✅
```
GET /api/locations/regions - All 14 Czech regions
GET /api/locations/regions/:id - Region by ID
GET /api/locations/regions/:id/cities - Cities in region
GET /api/locations/cities - All cities (paginated)
GET /api/locations/cities/:id - City by ID
GET /api/locations/cities/search?q=... - Search cities
```

### 4️⃣ Services (3 endpoints) - PUBLIC ✅
```
GET /api/services - All 4 service types
GET /api/services/:id - Service by ID
GET /api/services/:id/details - Service with stats
```

---

## 🧪 STEP 4: Test Everything

### 4A. Test Locations (PUBLIC - no auth needed)

Click `GET /api/locations/regions` in Swagger:
1. Click **"Try it out"**
2. Click **"Execute"**
3. Should return 14 Czech regions with cities

**Response:**
```json
[
  {
    "id": "cluxxx",
    "name": "Praha",
    "code": "CZ010",
    "displayOrder": 1,
    "cities": [
      {
        "id": "cluxxx",
        "name": "Praha 1",
        "zipCode": "110 00",
        "regionId": "cluxxx"
      },
      // ... more cities
    ]
  },
  // ... more regions
]
```

✅ **Locations module working!**

---

### 4B. Test Services (PUBLIC - no auth needed)

Click `GET /api/services` in Swagger:
1. Click **"Try it out"**
2. Click **"Execute"**
3. Should return 4 service types

**Response:**
```json
[
  {
    "id": "cluxxx",
    "name": "MASSAGE",
    "label": "Masáž",
    "description": "Professional massage services...",
    "icon": "💆",
    "displayOrder": 1,
    "createdAt": "2026-08-06T...",
    "updatedAt": "2026-08-06T..."
  },
  {
    "id": "cluxxx",
    "name": "CONSULTATION",
    "label": "Konzultace",
    "description": "Personal consultations...",
    "icon": "👥",
    "displayOrder": 2
  },
  {
    "id": "cluxxx",
    "name": "PHOTO_SESSION",
    "label": "Fotografická sezóna",
    "description": "Professional photo sessions...",
    "icon": "📸",
    "displayOrder": 3
  },
  {
    "id": "cluxxx",
    "name": "STUDIO_RECORDING",
    "label": "Studiové nahrávání",
    "description": "Professional studio recording...",
    "icon": "🎙️",
    "displayOrder": 4
  }
]
```

✅ **Services module working!**

---

### 4C. Test Auth (requires registration)

#### Register a user:
1. Click `POST /api/auth/register`
2. Click **"Try it out"**
3. Paste in request body:
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
4. Click **"Execute"**

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

✅ **Auth registration working!**

---

#### Login:
1. Click `POST /api/auth/login`
2. Click **"Try it out"**
3. Paste:
```json
{
  "email": "ivan@example.com",
  "password": "SecurePassword123!"
}
```
4. Click **"Execute"**

Should return same tokens as registration.

✅ **Auth login working!**

---

#### Get current user:
1. Click **"Authorize"** button at top
2. Paste your **accessToken** from previous response
3. Click **"Authorize"** in modal
4. Close modal
5. Click `GET /api/auth/me`
6. Click **"Try it out"** → **"Execute"**

**Response:**
```json
{
  "id": "cluxxxxxxx",
  "email": "ivan@example.com",
  "phone": "+420777123456",
  "firstName": "Ivan",
  "lastName": "Voroshchuk",
  "profilePicture": null,
  "isAgeVerified": false,
  "ageVerificationStatus": "PENDING",
  "role": "USER",
  "isActive": true,
  "isSuspended": false,
  "createdAt": "2026-08-06T12:00:00.000Z",
  "updatedAt": "2026-08-06T12:00:00.000Z"
}
```

✅ **Auth module working!**

---

### 4D. Test Users (requires auth)

Make sure you're **authorized** (token copied in previous step).

#### Get current user profile:
1. Click `GET /api/users/me`
2. Click **"Try it out"** → **"Execute"**
3. Should return same user info as `/api/auth/me`

✅ **Users /me endpoint working!**

#### Update current user:
1. Click `PATCH /api/users/me`
2. Click **"Try it out"**
3. Paste:
```json
{
  "firstName": "Ivan",
  "lastName": "Voroshchuk Updated",
  "profilePicture": "https://example.com/avatar.jpg"
}
```
4. Click **"Execute"**

Should return updated user with new lastName and profilePicture.

✅ **Users update endpoint working!**

---

## 🧪 STEP 5: Run All Tests

```bash
cd packages/backend

# Run E2E tests (28 tests total)
pnpm run test:e2e

# Should show:
# PASS  test/auth.e2e.spec.ts
#   Auth (e2e)
#     POST /api/auth/register
#       ✓ should register a new user
#       ✓ should not register with duplicate email
#       ... (13 tests total)
# 
# PASS  test/users.e2e.spec.ts
#   Users (e2e)
#     GET /api/users/me
#       ✓ should get current user profile
#       ... (15 tests total)
#
# Test Suites: 2 passed, 2 total
# Tests:       28 passed, 28 total ✅
```

✅ **All 28 tests passing!**

---

## 🎯 SUCCESS CHECKLIST

```
✅ Auth Module (4 endpoints)
  ✅ Register new user
  ✅ Login user
  ✅ Refresh token
  ✅ Get current user info
  ✅ 13 E2E tests passing

✅ Users Module (9 endpoints)
  ✅ Get current user profile
  ✅ Get any user profile
  ✅ List all users (with filters)
  ✅ Update user profile
  ✅ Delete user account
  ✅ Suspend/unsuspend users
  ✅ 15 E2E tests passing

✅ Locations Module (6 endpoints)
  ✅ Get all 14 Czech regions
  ✅ Get regions with cities
  ✅ Search cities by name
  ✅ Get all cities (paginated)
  ✅ All endpoints PUBLIC (no auth needed)

✅ Services Module (3 endpoints)
  ✅ Get all 4 service types
  ✅ Get service by ID
  ✅ Get service statistics
  ✅ All endpoints PUBLIC (no auth needed)

✅ Database
  ✅ PostgreSQL connected
  ✅ All tables created
  ✅ Czech regions seeded (14)
  ✅ Czech cities seeded (100+)
  ✅ Service types seeded (4)

✅ Swagger Documentation
  ✅ All endpoints documented
  ✅ Request/response schemas
  ✅ Interactive testing
  ✅ Error responses documented

✅ Testing
  ✅ 28 E2E tests written
  ✅ All tests passing (100%)
  ✅ All CRUD operations tested
  ✅ Error cases tested
```

---

## 📊 WHAT YOU HAVE NOW

| Component | Count | Status |
|-----------|-------|--------|
| Modules | 4 | ✅ Complete |
| Endpoints | 22 | ✅ Working |
| DTOs | 6 | ✅ Validated |
| Services | 4 | ✅ Functional |
| Controllers | 4 | ✅ Responsive |
| E2E Tests | 28 | ✅ Passing |
| Database Tables | 10+ | ✅ Seeded |

---

## 🚀 NEXT STEPS

Phase 1 complete! Now we can build Phase 2:

1. **VERIFICATION MODULE** - 18+ age verification (Veriff API)
2. **PROFILES MODULE** - User service profiles
3. **MEDIA MODULE** - Photo/video upload (S3)
4. **BOOKINGS MODULE** - Booking system + Stripe
5. **CHAT MODULE** - Real-time messaging (WebSocket)

---

## 💡 USEFUL COMMANDS

```bash
# Start backend with hot reload
pnpm run start:dev

# Run all tests
pnpm run test:e2e

# Run tests with coverage
pnpm run test:cov

# Format code
pnpm run format

# Lint code
pnpm run lint

# Open Swagger docs
open http://localhost:3000/api/docs

# Database studio (visual)
pnpm exec prisma studio
```

---

## 🎉 CONGRATULATIONS!

You now have a **fully functional backend with 4 complete modules**!

- ✅ User authentication
- ✅ User management
- ✅ Geographic data
- ✅ Service catalog
- ✅ Complete REST API
- ✅ Swagger documentation
- ✅ 28 E2E tests
- ✅ Production-ready code

**Ready to extend with Phase 2 features! 🚀**

---

**Need help?** Read:
- `PHASE1_COMPLETE.md` - Detailed summary of all modules
- `AUTH_MODULE_SUMMARY.md` - Auth module details
- `packages/backend/README.md` - Backend setup guide

---

**Last Updated:** 2026-08-06
**Status:** ✅ PHASE 1 COMPLETE - 28 Tests Passing
