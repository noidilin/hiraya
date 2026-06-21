import express from 'express';
import bcrypt from 'bcryptjs';
import { query as defaultQuery } from '../database/connection';

interface DatabaseDependency {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}

export interface AuthRouteDependencies {
  database?: DatabaseDependency;
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

function toAuthEnvelope(user: any, message: string) {
  return {
    success: true,
    data: {
      user: toAuthenticatedUser(user),
      token: user.id.toString(),
    },
    message,
  };
}

export function createAuthRoutes(options: AuthRouteDependencies = {}): express.Router {
  const router: express.Router = express.Router();
  const database = options.database ?? { query: defaultQuery };

  // Simple demo authentication without JWT
  let currentUser: any = null;

  router.post('/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

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
      currentUser = toAuthenticatedUser(user);

      res.status(201).json(toAuthEnvelope(user, 'Registration successful'));
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // For demo mode: accept any email with password "demo"
      if (password === 'demo') {
        let user;
        const result = await database.query('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
          // Create demo user if doesn't exist
          const hashedPassword = await bcrypt.hash('demo', 10);
          const newUser = await database.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at, updated_at',
            [email, hashedPassword, 'Demo', 'User', 'customer']
          );
          user = newUser.rows[0];
        } else {
          user = result.rows[0];
        }

        currentUser = toAuthenticatedUser(user);

        res.json(toAuthEnvelope(user, 'Demo login successful'));
        return;
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

      currentUser = toAuthenticatedUser(user);

      res.json(toAuthEnvelope(user, 'Login successful'));
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  });

  router.post('/logout', (req, res) => {
    currentUser = null;
    res.json({ success: true, data: null, message: 'Logged out successfully' });
  });

  router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    const userId = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!userId || userId === 'undefined') {
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
