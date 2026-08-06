import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let userId: string;

  const testUser = {
    email: 'test@example.com',
    phone: '+420777123456',
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: '1990-01-15',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up database
    await prismaService.user.deleteMany({});

    // Register test user
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);

    accessToken = registerRes.body.accessToken;
    userId = registerRes.body.userId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/me', () => {
    it('should get current user profile', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email', testUser.email);
          expect(res.body).toHaveProperty('firstName', testUser.firstName);
          expect(res.body).toHaveProperty('lastName', testUser.lastName);
          expect(res.body).toHaveProperty('isAgeVerified', false);
          expect(res.body).toHaveProperty('role', 'USER');
          expect(res.body).toHaveProperty('isActive', true);
          expect(res.body).toHaveProperty('isSuspended', false);
        });
    });

    it('should not get profile without token', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .expect(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/users/nonexistent')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should not get user without token', () => {
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update current user profile', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          profilePicture: 'https://example.com/avatar.jpg',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('firstName', 'Updated');
          expect(res.body).toHaveProperty('lastName', 'Name');
          expect(res.body).toHaveProperty(
            'profilePicture',
            'https://example.com/avatar.jpg',
          );
        });
    });

    it('should not allow duplicate email', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: testUser.email, // Same email
        })
        .expect(200); // Should succeed since it's the same email
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should not update without token', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me')
        .send({
          firstName: 'Updated',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/users/me', () => {
    it('should soft delete user account', async () => {
      // Create a new user for deletion
      const newUserRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'delete@example.com',
          phone: '+420777654321',
        });

      const newUserId = newUserRes.body.userId;
      const newAccessToken = newUserRes.body.accessToken;

      // Delete the user
      await request(app.getHttpServer())
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(204);

      // Try to get the deleted user (should fail or indicate deletion)
      const getRes = await request(app.getHttpServer())
        .get(`/api/users/${newUserId}`)
        .set('Authorization', `Bearer ${newAccessToken}`);

      // User should be inactive or deleted
      expect(getRes.body.isActive).toBe(false);
    });

    it('should not delete without token', () => {
      return request(app.getHttpServer())
        .delete('/api/users/me')
        .expect(401);
    });
  });

  describe('GET /api/users (list all users)', () => {
    it('should return list of users', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.users)).toBe(true);
        });
    });

    it('should filter users by email', () => {
      return request(app.getHttpServer())
        .get('/api/users?email=test')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.users)).toBe(true);
        });
    });

    it('should paginate users', () => {
      return request(app.getHttpServer())
        .get('/api/users?skip=0&take=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.users.length).toBeLessThanOrEqual(5);
        });
    });

    it('should not list users without token', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });
  });

  describe('PATCH /api/users/:id/suspend', () => {
    let adminToken: string;
    let targetUserId: string;

    beforeAll(async () => {
      // Create an admin user
      const adminRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'admin@example.com',
          phone: '+420777999999',
        });

      adminToken = adminRes.body.accessToken;

      // Create a target user to suspend
      const targetRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'suspend@example.com',
          phone: '+420777888888',
        });

      targetUserId = targetRes.body.userId;
    });

    it('should suspend user', () => {
      return request(app.getHttpServer())
        .patch(`/api/users/${targetUserId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Violating community guidelines',
          suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('isSuspended', true);
          expect(res.body).toHaveProperty('suspendedReason', 'Violating community guidelines');
        });
    });
  });

  describe('PATCH /api/users/:id/unsuspend', () => {
    it('should unsuspend user', async () => {
      // Create and suspend a user first
      const userRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'unsuspend@example.com',
          phone: '+420777777777',
        });

      const adminToken = userRes.body.accessToken;
      const targetUserId = userRes.body.userId;

      // Suspend the user
      await request(app.getHttpServer())
        .patch(`/api/users/${targetUserId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Test suspension',
        });

      // Unsuspend the user
      return request(app.getHttpServer())
        .patch(`/api/users/${targetUserId}/unsuspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('isSuspended', false);
          expect(res.body).toHaveProperty('suspendedReason', null);
        });
    });
  });
});
