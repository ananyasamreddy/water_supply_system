import bcrypt from 'bcryptjs';
import { generateToken } from '../config/jwt.js';
import { db, isPostgresActive, saveUsersToFile } from '../config/db.js';

export async function register(req, res) {
  try {
    const { name, email, password, role = 'CITIZEN', phone, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (isPostgresActive()) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const result = await db.query(
        `INSERT INTO users (name, email, password_hash, role, phone, department)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, role, phone, department, created_at`,
        [name, email, passwordHash, role, phone, department]
      );

      const user = result.rows[0];
      const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
      return res.status(201).json({ message: 'User registered successfully', user, token });
    } else {
      const store = db.getFallbackStore();
      const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const newUser = {
        id: store.users.length > 0 ? Math.max(...store.users.map(u => u.id || 0)) + 1 : 1,
        name,
        email,
        password_hash: passwordHash,
        role,
        phone: phone || '',
        department: department || '',
        created_at: new Date().toISOString()
      };
      store.users.push(newUser);
      saveUsersToFile(store.users);

      const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
      const { password_hash, ...userClean } = newUser;
      return res.status(201).json({ message: 'User registered successfully', user: userClean, token });
    }
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = null;

    if (isPostgresActive()) {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      user = result.rows[0];
    } else {
      const store = db.getFallbackStore();
      user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && password !== 'password123') { // allow convenience demo password
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const { password_hash, ...userClean } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: userClean
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function me(req, res) {
  try {
    const userId = req.user.id;
    let user = null;

    if (isPostgresActive()) {
      const result = await db.query('SELECT id, name, email, role, phone, department, created_at FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      user = result.rows[0];
    } else {
      const store = db.getFallbackStore();
      user = store.users.find(u => u.id === userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { password_hash, ...clean } = user;
      user = clean;
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Convenience endpoint for Viva Demonstrations:
 * Log in instantly as one of the 4 roles without typing.
 */
export async function quickDemoLogin(req, res) {
  const { role } = req.body;
  const store = db.getFallbackStore();
  
  const targetUser = store.users.find(u => u.role === role) || store.users[0];
  const token = generateToken({ id: targetUser.id, email: targetUser.email, role: targetUser.role, name: targetUser.name });
  const { password_hash, ...clean } = targetUser;

  return res.json({
    message: `Switched to ${targetUser.role} persona for demo`,
    token,
    user: clean
  });
}

export async function getUsers(req, res) {
  try {
    if (isPostgresActive()) {
      const result = await db.query('SELECT id, name, email, role, phone, department, created_at FROM users ORDER BY id ASC');
      return res.json({ users: result.rows });
    } else {
      const store = db.getFallbackStore();
      const usersClean = store.users.map(u => {
        const { password_hash, ...clean } = u;
        return {
          ...clean,
          created_at: clean.created_at || '2026-03-01T08:00:00.000Z'
        };
      });
      return res.json({ users: usersClean });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error fetching users' });
  }
}

export default {
  register,
  login,
  me,
  quickDemoLogin,
  getUsers
};
