/**
 * Good Health and Well-Being - Authentication Routes
 * User registration, login, and current user profile
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, getIsConnected, getMemoryStore } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.JWT_SECRET || 'your_super_secret_key_here', 
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (getIsConnected()) {
      const [existing] = await getPool().query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, error: 'An account with this email already exists' });
      }

      const [result] = await getPool().query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [cleanName, cleanEmail, hashedPassword]
      );

      const user = { id: result.insertId, name: cleanName, email: cleanEmail };
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user,
        token
      });
    } else {
      const mem = getMemoryStore().users;
      if (mem.find(u => u.email === cleanEmail)) {
        return res.status(409).json({ success: false, error: 'An account with this email already exists' });
      }
      const newUser = { id: mem.length + 1, name: cleanName, email: cleanEmail, password_hash: hashedPassword };
      mem.push(newUser);
      
      const user = { id: newUser.id, name: newUser.name, email: newUser.email };
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully (Memory Store)',
        user,
        token
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (getIsConnected()) {
      const [rows] = await getPool().query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [cleanEmail]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      
      const u = rows[0];
      const match = await bcrypt.compare(password, u.password_hash);
      
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      
      // Update last_login
      await getPool().query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [u.id]);

      const user = { id: u.id, name: u.name, email: u.email };
      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Login successful',
        user,
        token
      });
    } else {
      const mem = getMemoryStore().users;
      const u = mem.find(user => user.email === cleanEmail);
      
      let match = false;
      if (u) {
          match = await bcrypt.compare(password, u.password_hash);
      }
      
      if (!u || !match) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      
      const user = { id: u.id, name: u.name, email: u.email };
      const token = generateToken(user);
      
      return res.json({
        success: true,
        message: 'Login successful (Memory Store)',
        user,
        token
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
    try {
        if (getIsConnected()) {
            const [rows] = await getPool().query('SELECT id, name, email FROM users WHERE id = ?', [req.userId]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            return res.json({ success: true, user: rows[0] });
        } else {
            const u = getMemoryStore().users.find(user => user.id === req.userId);
            if (!u) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            return res.json({ success: true, user: { id: u.id, name: u.name, email: u.email } });
        }
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
