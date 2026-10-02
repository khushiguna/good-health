#!/usr/bin/env node
/**
 * Good Health and Well-Being - Express & MySQL Backend Server
 * Aligned with UN Sustainable Development Goal 3
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDB, getIsConnected } = require('./config/db');

// Route handlers
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Basic security headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

// REST API Endpoints
app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/contact', contactRouter);

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'UP',
    application: 'Good Health and Well-Being Node & MySQL Backend',
    version: '2.0.0',
    database: getIsConnected() ? 'MySQL Connected' : 'Resilient In-Memory Mode',
    timestamp: new Date().toISOString()
  });
});

// Serve Frontend Static Files
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath, {
      setHeaders: function (res, path) {
        if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));

// Fallback route to frontend/index.html for client-side navigation
app.get('*', (req, res) => {
  // If requesting an API that doesn't exist
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server & Initialize Database
async function startServer() {
  await initDB();

  app.listen(PORT, () => {
    console.log('==================================================================');
    console.log(' 🌱 Good Health and Well-Being Platform Started!');
    console.log(` 🌐 Server URL: http://localhost:${PORT}`);
    console.log(` 📁 Serving frontend from: ${frontendPath}`);
    console.log(` 🗄️ Database status: ${getIsConnected() ? 'MySQL Connected' : 'In-Memory Resilient Mode'}`);
    console.log('==================================================================');
  });
}

startServer();

module.exports = app;
