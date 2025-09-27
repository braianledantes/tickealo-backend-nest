import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { App } from 'supertest/types';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'braian.ledantes@est.fi.uncoma.edu.ar',
          password: 'atomicos',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');

      // Guardamos el token para otros tests
      accessToken = response.body.access_token as string;
    });

    it('should fail login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid@email.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail login with missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'atomicos',
        })
        .expect(400);
    });

    it('should fail login with missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'braian.ledantes@est.fi.uncoma.edu.ar',
        })
        .expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    beforeEach(async () => {
      // Obtenemos un token válido para los tests
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'braian.ledantes@est.fi.uncoma.edu.ar',
          password: 'atomicos',
        });
      accessToken = response.body.access_token as string;
    });

    it('should return user profile when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('username');
    });

    it('should fail when no token provided', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/register-cliente (POST)', () => {
    const validClienteData = {
      username: 'testcliente',
      email: 'cliente@test.com',
      password: 'password123',
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '123456789',
    };

    it('should register cliente successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register-cliente')
        .send(validClienteData)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-cliente')
        .send({
          username: 'testcliente',
          email: 'cliente@test.com',
          // Falta password, nombre, apellido, telefono
        })
        .expect(400);
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-cliente')
        .send({
          ...validClienteData,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-cliente')
        .send({
          ...validClienteData,
          password: '123', // Too weak
        })
        .expect(400);
    });
  });

  describe('/auth/register-productora (POST)', () => {
    const validProductoraData = {
      username: 'testproductora',
      email: 'productora@test.com',
      password: 'password123',
      cuit: '20-12345678-9',
      nombre: 'Productora Test S.A.',
      direccion: 'Av. Siempre Viva 123',
      telefono: '987654321',
    };

    it('should register productora successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register-productora')
        .send(validProductoraData)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-productora')
        .send({
          username: 'testproductora',
          email: 'productora@test.com',
          // Falta password, cuit, nombre, direccion, telefono
        })
        .expect(400);
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-productora')
        .send({
          ...validProductoraData,
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/auth/register-validador (POST)', () => {
    const validValidadorData = {
      username: 'testvalidador',
      email: 'validador@test.com',
      password: 'password123',
      nombre: 'Carlos Validador',
    };

    it('should register validador successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register-validador')
        .send(validValidadorData)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-validador')
        .send({
          username: 'testvalidador',
          email: 'validador@test.com',
          // Falta password y nombre
        })
        .expect(400);
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-validador')
        .send({
          ...validValidadorData,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-validador')
        .send({
          ...validValidadorData,
          password: '123', // Too weak
        })
        .expect(400);
    });
  });
});
