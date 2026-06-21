import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { query as defaultQuery } from '../database/connection';

interface DatabaseDependency {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}

export interface AuthRouteDependencies {
  database?: DatabaseDependency;
}

const TOKEN_EXPIRES_IN = (process.env.AUTH_TOKEN_EXPIRES_IN ?? '1h') as SignOptions['expiresIn'];

function getAuthTokenSecret() {
  if (process.env.AUTH_TOKEN_SECRET) {
    return process.env.AUTH_TOKEN_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_TOKEN_SECRET must be set in production');
  }

  return 'hiraya-dev-auth-token-secret-change-me';
}

function toAuthenticatedUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    ...(user.created_at ? { createdAt: user.created_at } : {}),
    ...(user.updated_at ? { updatedAt: user.updated_at } : {}),
  };
}

function signAuthToken(user: any) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    },
    getAuthTokenSecret(),
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

function verifyAuthToken(authHeader: string | undefined): string | null {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;

  if (!token || token === 'undefined') {
    return null;
  }

  try {
    const decoded = jwt.verify(token, getAuthTokenSecret()) as JwtPayload;
    return typeof decoded.sub === 'string' && decoded.sub.length > 0 ? decoded.sub : null;
  } catch {
    return null;
  }
}

function toAuthEnvelope(user: any, message: string) {
  return {
    success: true,
    data: {
      user: toAuthenticatedUser(user),
      token: signAuthToken(user),
    },
    message,
  };
}

function requiredString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function createAuthRoutes(options: AuthRouteDependencies = {}): express.Router {
  const router: express.Router = express.Router();
  const database = options.database ?? { query: defaultQuery };

  router.post('/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (![email, password, firstName, lastName].every(requiredString)) {
        return res.status(400).json({ success: false, error: 'Missing required registration fields' });
      }

      const existingUser = await database.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await database.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at, updated_at',
        [email, hashedPassword, firstName, lastName, 'customer']
      );

      const user = result.rows[0];

      res.status(201).json(toAuthEnvelope(user, 'Registration successful'));
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (![email, password].every(requiredString)) {
        return res.status(400).json({ success: false, error: 'Missing email or password' });
      }

      // Normal password check
      const result = await database.query('SELECT id, email, password_hash, first_name, last_name, role, created_at, updated_at FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      res.json(toAuthEnvelope(user, 'Login successful'));
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  });

  router.post('/logout', (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ') && !verifyAuthToken(authHeader)) {
      return res.status(401).json({ success: false, error: 'Not logged in' });
    }

    res.json({ success: true, data: null, message: 'Logged out successfully' });
  });

  router.get('/me', async (req, res) => {
    const userId = verifyAuthToken(req.headers.authorization);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not logged in' });
    }

    try {
      const result = await database.query(
        'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }
      const user = result.rows[0];
      res.json({ success: true, data: toAuthenticatedUser(user) });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get user' });
    }
  });

  return router;
}

export const authRoutes = createAuthRoutes();
