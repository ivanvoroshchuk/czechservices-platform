# 🚀 CzechServices Backend API

NestJS-based REST API for the CzechServices platform.

## Prerequisites

- Node.js 18+
- pnpm
- Docker (for PostgreSQL & Redis)
- PostgreSQL 15+
- Redis 7+

## Getting Started

### 1. Install Dependencies

```bash
cd packages/backend
pnpm install
```

### 2. Setup Environment

```bash
# Copy example env file
cp .env.example .env.local

# Update .env.local with your credentials:
# - Database URL (PostgreSQL)
# - JWT secrets
# - Stripe API keys
# - Veriff API key
# - AWS S3 credentials
```

### 3. Start Database

```bash
# From project root
docker-compose up -d

# Verify containers are running
docker-compose ps
```

### 4. Run Migrations

```bash
cd packages/backend

# Create initial database
pnpm exec prisma migrate dev --name init

# View database in Prisma Studio (optional)
pnpm exec prisma studio
```

### 5. Start Development Server

```bash
pnpm run start:dev

# Server will start on http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run start:dev` | Start dev server with hot reload |
| `pnpm run start:prod` | Start production server |
| `pnpm run build` | Build for production |
| `pnpm run test` | Run unit tests |
| `pnpm run test:e2e` | Run E2E tests |
| `pnpm run test:cov` | Run tests with coverage |
| `pnpm run lint` | Lint and fix code |
| `pnpm run format` | Format code with Prettier |
| `pnpm exec prisma migrate dev` | Create new migration |
| `pnpm exec prisma studio` | Open Prisma Studio |
| `pnpm exec prisma db seed` | Seed database |

## Project Structure

```
src/
├── main.ts                 # Entry point
├── app.module.ts          # Root module
├── config/
│   └── configuration.ts   # App configuration
├── database/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── modules/               # Feature modules
│   ├── auth/
│   ├── users/
│   ├── verification/
│   ├── profiles/
│   ├── services/
│   └── ...
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── test/

prisma/
└── schema.prisma          # Database schema
```

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:3000/api/docs
- **ReDoc:** http://localhost:3000/api/docs-json

## Database

### Using Prisma

```bash
# Create a new migration
pnpm exec prisma migrate dev --name <migration_name>

# Reset database (⚠️ deletes all data)
pnpm exec prisma migrate reset

# Generate Prisma client
pnpm exec prisma generate

# Open database UI
pnpm exec prisma studio
```

### Database Diagram

Schema includes:
- Users (with 18+ verification)
- Profiles (service ankets)
- Services
- Bookings
- Chat & Emergency chat
- Subscriptions
- And more...

## Authentication

JWT-based authentication with:
- Access token (15 min expiry)
- Refresh token (7 days expiry)
- Role-based access control (USER, ADMIN, MODERATOR)

## Features

- ✅ User authentication & authorization
- ✅ 18+ age verification (Veriff integration)
- ✅ Service profile management
- ✅ Media upload (S3)
- ✅ Real-time chat (WebSocket)
- ✅ Emergency support system
- ✅ Booking system
- ✅ Stripe payments integration
- ✅ Admin dashboard

## Testing

### Unit Tests

```bash
pnpm run test
pnpm run test:watch
```

### E2E Tests

```bash
pnpm run test:e2e
```

### Coverage

```bash
pnpm run test:cov
```

## Deployment

### Build for Production

```bash
pnpm run build
```

### Run Production Server

```bash
pnpm run start:prod
```

## Troubleshooting

### Port 5432 already in use (PostgreSQL)

```bash
# Kill existing container
docker kill czechservices-postgres
docker-compose up -d
```

### Prisma migration errors

```bash
# Reset database
pnpm exec prisma migrate reset

# Re-run migrations
pnpm exec prisma migrate dev
```

### Can't connect to Redis

```bash
# Check Redis is running
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

### Permission denied errors

```bash
# Ensure file permissions
chmod +x node_modules/.bin/*
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for signing JWT tokens
- `STRIPE_SECRET_KEY` - Stripe API key
- `VERIFF_API_KEY` - Veriff API key
- `AWS_S3_BUCKET` - S3 bucket name

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- Airbnb style guide
- Code formatting on commit (Husky + lint-staged)

## Performance

- Redis caching
- Database indexing
- Query optimization with Prisma
- Rate limiting (planned)

## Security

- JWT authentication
- Password hashing (bcrypt)
- CORS enabled
- Helmet headers (planned)
- Rate limiting (planned)
- Input validation with class-validator

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm run test`
4. Format code: `pnpm run format`
5. Submit pull request

## Support

For issues and questions:
1. Check [ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
2. Check [DEVELOPMENT_CHECKLIST.md](../../docs/DEVELOPMENT_CHECKLIST.md)
3. Open an issue

---

**Last updated:** 2026-08-06
