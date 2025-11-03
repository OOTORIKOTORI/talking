import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('GamesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /games/my requires auth', () => {
    // TODO: 実際の認証テストを実装
    expect(true).toBe(true);
  });

  it('POST /games creates a new game project', () => {
    // TODO: 実際のゲーム作成テストを実装
    expect(true).toBe(true);
  });

  it('GET /games/:id returns game with scenes and nodes', () => {
    // TODO: 実際のゲーム取得テストを実装
    expect(true).toBe(true);
  });
});
