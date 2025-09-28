import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Simular el login para obtener el token de acceso
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'braian.ledantes@est.fi.uncoma.edu.ar',
        password: 'atomicos',
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    accessToken = response.body.access_token as string;
  });

  afterEach(async () => {
    await app.close();
  });

  it('/productora/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/productora/4/eventos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });
});
