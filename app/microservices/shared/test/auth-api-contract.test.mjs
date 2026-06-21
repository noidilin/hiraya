import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../backend/services/auth/src/index.ts';
import {
  authenticatedUserEnvelopeSchema,
  authSuccessEnvelopeSchema,
  storefrontFailureEnvelopeSchema,
} from '../src/index.mjs';

const validPasswordHash = '$2a$10$Vtk/SwGgIxJMtCLix.Gm8uKzVdeZIEE/DxWCbXUcJXt.3bYxGHW.y';

const userRow = Object.freeze({
  id: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
  email: 'demo@hirayavintage.test',
  password_hash: '$2a$10$demo-password-hash',
  first_name: 'Demo',
  last_name: 'User',
  role: 'customer',
  created_at: '2026-02-07T13:04:03.836Z',
  updated_at: '2026-02-07T13:04:03.836Z',
});

function createTestApp({ query = vi.fn() } = {}) {
  return {
    app: createApp({ database: { query } }),
    query,
  };
}

function expectedAuthData() {
  return {
    user: {
      id: userRow.id,
      email: userRow.email,
      firstName: userRow.first_name,
      lastName: userRow.last_name,
      role: userRow.role,
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
    },
    token: expect.any(String),
  };
}

describe('active auth service Storefront contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_TOKEN_SECRET = 'test-auth-token-secret';
  });

  it('registers a Storefront user through the importable app seam with a mocked database boundary', async () => {
    const { app, query } = createTestApp({
      query: vi.fn().mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [userRow] }),
    });

    const response = await request(app)
      .post('/register')
      .send({
        email: userRow.email,
        password: 'correct horse battery staple',
        firstName: userRow.first_name,
        lastName: userRow.last_name,
      })
      .expect(201);

    expect(query).toHaveBeenCalledTimes(2);
    expect(authSuccessEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({
      success: true,
      data: expectedAuthData(),
      message: 'Registration successful',
    });
    expect(response.body.data.token).not.toBe(userRow.id);
  });

  it('returns 400 for malformed registration payloads before querying the database', async () => {
    const { app, query } = createTestApp();

    const response = await request(app)
      .post('/register')
      .send({ email: userRow.email, password: '', firstName: 'Demo' })
      .expect(400);

    expect(query).not.toHaveBeenCalled();
    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Missing required registration fields' });
  });

  it('logs in with a stored password hash in the minimal Storefront success envelope', async () => {
    const password = 'correct horse battery staple';
    const loginRow = { ...userRow, password_hash: validPasswordHash };
    const { app, query } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: [loginRow] }) });

    const response = await request(app)
      .post('/login')
      .send({ email: userRow.email, password })
      .expect(200);

    expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM users WHERE email = $1'), [userRow.email]);
    expect(authSuccessEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({
      success: true,
      data: expectedAuthData(),
      message: 'Login successful',
    });
    expect(response.body.data.token).not.toBe(userRow.id);
  });

  it('does not create or bypass accounts for the old demo password behavior', async () => {
    const { app, query } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: [] }) });

    const response = await request(app)
      .post('/login')
      .send({ email: userRow.email, password: 'demo' })
      .expect(401);

    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM users WHERE email = $1'), [userRow.email]);
    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Invalid credentials' });
  });

  it('returns 400 for malformed login payloads before querying the database', async () => {
    const { app, query } = createTestApp();

    const response = await request(app)
      .post('/login')
      .send({ email: userRow.email })
      .expect(400);

    expect(query).not.toHaveBeenCalled();
    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Missing email or password' });
  });

  it('logs out in the minimal Storefront success envelope', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/logout').expect(200);

    expect(response.body).toEqual({ success: true, data: null, message: 'Logged out successfully' });
  });

  it('rejects malformed bearer tokens on logout', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/logout').set('Authorization', 'Bearer not-a-signed-token').expect(401);

    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Not logged in' });
  });

  it('returns identity lookup in the minimal Storefront success envelope after validating a signed bearer token', async () => {
    const password = 'correct horse battery staple';
    const loginRow = { ...userRow, password_hash: validPasswordHash };
    const identityRow = {
      id: userRow.id,
      email: userRow.email,
      first_name: userRow.first_name,
      last_name: userRow.last_name,
      role: userRow.role,
    };
    const { app, query } = createTestApp({
      query: vi.fn().mockResolvedValueOnce({ rows: [loginRow] }).mockResolvedValueOnce({ rows: [identityRow] }),
    });

    const loginResponse = await request(app)
      .post('/login')
      .send({ email: userRow.email, password })
      .expect(200);

    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
      .expect(200);

    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('WHERE id = $1'), [userRow.id]);
    expect(authenticatedUserEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({
      success: true,
      data: {
        id: userRow.id,
        email: userRow.email,
        firstName: userRow.first_name,
        lastName: userRow.last_name,
        role: userRow.role,
      },
    });
  });

  it('rejects predictable user-id bearer tokens for identity lookup', async () => {
    const { app, query } = createTestApp();

    const response = await request(app).get('/me').set('Authorization', `Bearer ${userRow.id}`).expect(401);

    expect(query).not.toHaveBeenCalled();
    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Not logged in' });
  });

  it('returns the minimal Storefront failure envelope for duplicate registration', async () => {
    const { app } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: [{ id: userRow.id }] }) });

    const response = await request(app)
      .post('/register')
      .send({ email: userRow.email, password: 'password', firstName: 'Demo', lastName: 'User' })
      .expect(400);

    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'User already exists' });
  });

  it('returns the minimal Storefront failure envelope for invalid credentials', async () => {
    const { app } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: [] }) });

    const response = await request(app)
      .post('/login')
      .send({ email: userRow.email, password: 'wrong-password' })
      .expect(401);

    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Invalid credentials' });
  });

  it('returns the minimal Storefront failure envelope when identity lookup has no bearer token', async () => {
    const { app, query } = createTestApp();

    const response = await request(app).get('/me').expect(401);

    expect(query).not.toHaveBeenCalled();
    expect(storefrontFailureEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({ success: false, error: 'Not logged in' });
  });
});
