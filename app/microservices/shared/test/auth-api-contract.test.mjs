import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../backend/services/auth/src/index.ts';
import {
  authenticatedUserEnvelopeSchema,
  authSuccessEnvelopeSchema,
  storefrontFailureEnvelopeSchema,
} from '../src/index.mjs';

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

describe('active auth service Storefront contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      data: {
        user: {
          id: userRow.id,
          email: userRow.email,
          firstName: userRow.first_name,
          lastName: userRow.last_name,
          role: userRow.role,
          createdAt: userRow.created_at,
          updatedAt: userRow.updated_at,
        },
        token: userRow.id,
      },
      message: 'Registration successful',
    });
  });

  it('preserves demo login behavior in the minimal Storefront success envelope', async () => {
    const { app, query } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: [userRow] }) });

    const response = await request(app)
      .post('/login')
      .send({ email: userRow.email, password: 'demo' })
      .expect(200);

    expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM users WHERE email = $1'), [userRow.email]);
    expect(authSuccessEnvelopeSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toEqual({
      success: true,
      data: {
        user: {
          id: userRow.id,
          email: userRow.email,
          firstName: userRow.first_name,
          lastName: userRow.last_name,
          role: userRow.role,
          createdAt: userRow.created_at,
          updatedAt: userRow.updated_at,
        },
        token: userRow.id,
      },
      message: 'Demo login successful',
    });
  });

  it('logs out in the minimal Storefront success envelope', async () => {
    const { app } = createTestApp();

    const response = await request(app).post('/logout').expect(200);

    expect(response.body).toEqual({ success: true, data: null, message: 'Logged out successfully' });
  });

  it('returns identity lookup in the minimal Storefront success envelope', async () => {
    const identityRow = {
      id: userRow.id,
      email: userRow.email,
      first_name: userRow.first_name,
      last_name: userRow.last_name,
      role: userRow.role,
    };
    const { app, query } = createTestApp({ query: vi.fn().mockResolvedValueOnce({ rows: [identityRow] }) });

    const response = await request(app).get('/me').set('Authorization', `Bearer ${userRow.id}`).expect(200);

    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), [userRow.id]);
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
