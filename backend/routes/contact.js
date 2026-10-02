/**
 * Good Health and Well-Being - Contact & Feedback Routes
 */

const express = require('express');
const router = express.Router();
const { getPool, getIsConnected, getMemoryStore } = require('../config/db');

// POST /api/contact - Submit user feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Feedback message is required' });
    }

    const cleanName = (name || 'Anonymous').trim();
    const cleanEmail = (email || '').trim();
    const cleanTopic = (topic || 'general').trim();
    const cleanMsg = message.trim();

    if (getIsConnected()) {
      await getPool().query(
        'INSERT INTO contact_messages (name, email, topic, message) VALUES (?, ?, ?, ?)',
        [cleanName, cleanEmail, cleanTopic, cleanMsg]
      );
    } else {
      getMemoryStore().contact_messages.push({
        name: cleanName,
        email: cleanEmail,
        topic: cleanTopic,
        message: cleanMsg,
        created_at: new Date()
      });
    }

    return res.json({
      status: 'success',
      message: 'Thank you! Your wellness feedback was received.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, error: 'Error submitting feedback' });
  }
});

// GET /api/contact/tips - Daily tips API
router.get('/tips', async (req, res) => {
    try {
        if (getIsConnected()) {
            const [tips] = await getPool().query('SELECT * FROM suggestion_tasks ORDER BY RAND() LIMIT 6');
            if (tips.length > 0) {
                return res.json(tips.map((t, idx) => ({ id: t.id, category: t.category, icon: t.icon, tip: t.tip || t.name })));
            }
        }
        // Fallback
        res.json([
          { id: 1, category: "Hydration", icon: "💧", tip: "Drink at least 8 glasses of pure water today to keep cells hydrated and energized." },
          { id: 2, category: "Exercise", icon: "🏃", tip: "Take a brisk 20-minute outdoor walk. Natural sunlight stimulates serotonin and vitamin D." },
          { id: 3, category: "Nutrition", icon: "🥗", tip: "Eat a rainbow plate: Include 2 colorful vegetables and whole fruits with lunch and dinner." },
          { id: 4, category: "Mental Well-Being", icon: "🧘", tip: "Practice 3 slow belly breaths when stress rises. Inhale 4s, hold 7s, exhale 8s." },
          { id: 5, category: "Sleep", icon: "🌙", tip: "Disconnect from smartphones and bright screens 60 minutes before bedtime for restorative REM rest." },
          { id: 6, category: "Daily Habits", icon: "✨", tip: "Adopt habit stacking: Pair your morning cup of tea with drinking a glass of fresh water." }
        ]);
    } catch(err) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
