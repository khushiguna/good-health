const express = require('express');
const router = express.Router();
const { getPool, getIsConnected, getMemoryStore } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const crypto = require('crypto');

router.use(verifyToken);

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = () => {
    return new Date().toISOString().slice(0, 10);
};

// POST /api/tasks/daily-reset
router.post('/daily-reset', async (req, res) => {
    try {
        const today = getLocalDateString();
        const conditionKey = req.body.conditionKey || 'general';
        
        if (getIsConnected()) {
            const [logs] = await getPool().query('SELECT id FROM user_daily_logs WHERE user_id = ? AND log_date = ? AND condition_key = ?', 
                [req.userId, today, conditionKey]);
            
            if (logs.length === 0) {
                // Initialize today's log
                const [tasks] = await getPool().query(`SELECT 
    (SELECT COUNT(*) FROM tasks_food WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) + 
    (SELECT COUNT(*) FROM tasks_exercise WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
    (SELECT COUNT(*) FROM tasks_mental WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
    (SELECT COUNT(*) FROM tasks_sleep WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
    (SELECT COUNT(*) FROM tasks_habits WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) as total`, 
                    [req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey]);
                const total = tasks[0].total;
                
                await getPool().query('INSERT INTO user_daily_logs (user_id, log_date, condition_key, tasks_total, tasks_done, score_percent) VALUES (?, ?, ?, ?, 0, 0)', 
                    [req.userId, today, conditionKey, total]);
                return res.json({ success: true, message: 'Daily reset applied', reset: true });
            }
        }
        res.json({ success: true, reset: false });
    } catch (err) {
        console.error('Reset error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tasks
router.get('/', async (req, res) => {
    try {
        const conditionKey = req.query.conditionKey;
        if (getIsConnected()) {
            const today = getLocalDateString();
            
            if (conditionKey && conditionKey !== 'all') {
                // Specific condition query
                const [logs] = await getPool().query('SELECT id FROM user_daily_logs WHERE user_id = ? AND log_date = ? AND condition_key = ?', 
                    [req.userId, today, conditionKey]);
                
                if (logs.length === 0) {
                    const [tasksCount] = await getPool().query(`SELECT 
        (SELECT COUNT(*) FROM tasks_food WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) + 
        (SELECT COUNT(*) FROM tasks_exercise WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
        (SELECT COUNT(*) FROM tasks_mental WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
        (SELECT COUNT(*) FROM tasks_sleep WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
        (SELECT COUNT(*) FROM tasks_habits WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) as total`, 
                        [req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey]);
                    await getPool().query('INSERT INTO user_daily_logs (user_id, log_date, condition_key, tasks_total, tasks_done, score_percent) VALUES (?, ?, ?, ?, 0, 0)', 
                        [req.userId, today, conditionKey, tasksCount[0].total]);
                }
                
                const [tasks] = await getPool().query(`
SELECT id, user_id, condition_key, 'food' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_food WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1
UNION ALL
SELECT id, user_id, condition_key, 'exercise' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_exercise WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1
UNION ALL
SELECT id, user_id, condition_key, 'mental' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_mental WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1
UNION ALL
SELECT id, user_id, condition_key, 'sleep' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_sleep WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1
UNION ALL
SELECT id, user_id, condition_key, 'habits' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_habits WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1
ORDER BY category ASC, display_order ASC
`, [req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey, req.userId, conditionKey]);
                return res.json({ success: true, tasks });
            } else {
                // Fetch ALL conditions at once
                const [tasks] = await getPool().query(`
SELECT id, user_id, condition_key, 'food' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_food WHERE (user_id = ? OR user_id IS NULL) AND is_active = 1
UNION ALL
SELECT id, user_id, condition_key, 'exercise' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_exercise WHERE (user_id = ? OR user_id IS NULL) AND is_active = 1
UNION ALL
SELECT id, user_id, condition_key, 'mental' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_mental WHERE (user_id = ? OR user_id IS NULL) AND is_active = 1
UNION ALL
SELECT id, user_id, condition_key, 'sleep' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_sleep WHERE (user_id = ? OR user_id IS NULL) AND is_active = 1
UNION ALL
SELECT id, user_id, condition_key, 'habits' as category, name, tip, icon, display_order, is_active, created_at FROM tasks_habits WHERE (user_id = ? OR user_id IS NULL) AND is_active = 1
ORDER BY condition_key ASC, category ASC, display_order ASC
`, [req.userId, req.userId, req.userId, req.userId, req.userId]);
                return res.json({ success: true, tasks });
            }
        } else {
            const mem = getMemoryStore().custom_tasks.filter(t => t.user_id === req.userId && t.is_active);
            const memTasks = (conditionKey && conditionKey !== 'all') ? mem.filter(t => t.condition_key === conditionKey) : mem;
            return res.json({ success: true, tasks: memTasks });
        }
    } catch (err) {
        console.error('Get tasks error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tasks/suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const conditionKey = req.query.condition || 'general';
        const category = req.query.category;
        
        let query = '';
        let params = [];
        if (getIsConnected()) {
            const validCats = ['food', 'exercise', 'mental', 'sleep', 'habits'];
            const cats = category && validCats.includes(category) ? [category] : validCats;
            
            const queries = cats.map(c => `SELECT id, NULL as user_id, condition_key, '${c}' as category, name, tip, icon, display_order FROM tasks_${c} WHERE user_id IS NULL AND condition_key = ? AND is_active = 1`);
            query = queries.join(' UNION ALL ') + ' ORDER BY display_order ASC';
            params = Array(cats.length).fill(conditionKey);

            const [suggestions] = await getPool().query(query, params);
            return res.json({ success: true, condition: conditionKey, category, tasks: suggestions });
        } else {
            return res.json({ success: true, tasks: [] });
        }
    } catch (err) {
        console.error('Get suggestions error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/tasks
router.post('/', async (req, res) => {
    try {
        const { name, tip, icon, category, conditionKey } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
        
        const cat = category || 'general';
        const cond = conditionKey || 'general';
        const id = 'task_' + crypto.randomBytes(8).toString('hex');
        
        if (getIsConnected()) {
            const validCats = ['food', 'exercise', 'mental', 'sleep', 'habits'];
            const tbl = validCats.includes(cat) ? cat : 'habits';
            await getPool().query(
                `INSERT INTO tasks_${tbl} (id, user_id, condition_key, name, tip, icon) VALUES (?, ?, ?, ?, ?, ?)`,
                [id, req.userId, cond, name, tip || null, icon || '📝']
            );
            return res.status(201).json({ success: true, task: { id, user_id: req.userId, category: cat, condition_key: cond, name, tip, icon } });
        } else {
            const t = { id, user_id: req.userId, category: cat, condition_key: cond, name, tip, icon, is_active: 1 };
            getMemoryStore().custom_tasks.push(t);
            return res.status(201).json({ success: true, task: t });
        }
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, tip, icon, category } = req.body;
        
        if (getIsConnected()) {
            const [tasks] = await getPool().query(`
SELECT 'food' as tbl FROM tasks_food WHERE id = ? AND user_id = ? UNION ALL
SELECT 'exercise' as tbl FROM tasks_exercise WHERE id = ? AND user_id = ? UNION ALL
SELECT 'mental' as tbl FROM tasks_mental WHERE id = ? AND user_id = ? UNION ALL
SELECT 'sleep' as tbl FROM tasks_sleep WHERE id = ? AND user_id = ? UNION ALL
SELECT 'habits' as tbl FROM tasks_habits WHERE id = ? AND user_id = ?
`, [req.params.id, req.userId, req.params.id, req.userId, req.params.id, req.userId, req.params.id, req.userId, req.params.id, req.userId]);
            if (tasks.length === 0) return res.status(404).json({ success: false, error: 'Task not found or unauthorized' });
            
            const tbl = tasks[0].tbl;
            await getPool().query(
                `UPDATE tasks_${tbl} SET name=?, tip=?, icon=? WHERE id=?`,
                [name, tip || null, icon || '📝', req.params.id]
            );
            return res.json({ success: true, message: 'Task updated' });
        } else {
            const mem = getMemoryStore().custom_tasks;
            const idx = mem.findIndex(t => t.id === req.params.id && t.user_id === req.userId);
            if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
            mem[idx] = { ...mem[idx], name, tip, icon, category };
            return res.json({ success: true, task: mem[idx] });
        }
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        if (getIsConnected()) {
            const [tasks] = await getPool().query(`
SELECT 'food' as tbl FROM tasks_food WHERE id = ? AND user_id = ? UNION ALL
SELECT 'exercise' as tbl FROM tasks_exercise WHERE id = ? AND user_id = ? UNION ALL
SELECT 'mental' as tbl FROM tasks_mental WHERE id = ? AND user_id = ? UNION ALL
SELECT 'sleep' as tbl FROM tasks_sleep WHERE id = ? AND user_id = ? UNION ALL
SELECT 'habits' as tbl FROM tasks_habits WHERE id = ? AND user_id = ?
`, [req.params.id, req.userId, req.params.id, req.userId, req.params.id, req.userId, req.params.id, req.userId, req.params.id, req.userId]);
            if (tasks.length === 0) return res.status(404).json({ success: false, error: 'Task not found or unauthorized' });
            
            // Soft delete
            const tbl = tasks[0].tbl;
            await getPool().query(`UPDATE tasks_${tbl} SET is_active = 0 WHERE id = ?`, [req.params.id]);
            return res.json({ success: true, message: 'Task deleted' });
        } else {
            const mem = getMemoryStore().custom_tasks;
            const idx = mem.findIndex(t => t.id === req.params.id && t.user_id === req.userId);
            if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
            mem[idx].is_active = 0;
            return res.json({ success: true, message: 'Task deleted' });
        }
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/tasks/toggle-completion
router.post('/toggle-completion', async (req, res) => {
    try {
        const { taskId, date, conditionKey, category } = req.body;
        if (!taskId || !date) return res.status(400).json({ success: false, error: 'Task ID and date required' });
        
        const cond = conditionKey || 'general';
        const cat = category || 'general';
        
        if (getIsConnected()) {
            const [existing] = await getPool().query(
                'SELECT * FROM task_completions WHERE task_id = ? AND log_date = ? AND condition_key = ? AND user_id = ?',
                [taskId, date, cond, req.userId]
            );
            
            let status = 'done';
            if (existing.length > 0) {
                status = existing[0].status === 'done' ? 'pending' : 'done';
                await getPool().query(
                    'UPDATE task_completions SET status = ? WHERE id = ?',
                    [status, existing[0].id]
                );
            } else {
                await getPool().query(
                    'INSERT INTO task_completions (task_id, category, condition_key, log_date, status, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [taskId, cat, cond, date, 'done', req.userId]
                );
            }
            
            // Update user_daily_logs (Overall day score)
            const [completions] = await getPool().query(
                'SELECT COUNT(*) as doneCount FROM task_completions WHERE log_date = ? AND condition_key = ? AND user_id = ? AND status = "done"',
                [date, cond, req.userId]
            );
            const doneCount = completions[0].doneCount;
            
            const [tasks] = await getPool().query(`SELECT 
    (SELECT COUNT(*) FROM tasks_food WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) + 
    (SELECT COUNT(*) FROM tasks_exercise WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
    (SELECT COUNT(*) FROM tasks_mental WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
    (SELECT COUNT(*) FROM tasks_sleep WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) +
    (SELECT COUNT(*) FROM tasks_habits WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1) as total`,
                [req.userId, cond, req.userId, cond, req.userId, cond, req.userId, cond, req.userId, cond]
            );
            const totalTasks = tasks[0].total > 0 ? tasks[0].total : (doneCount > 0 ? doneCount : 1);
            const score = (doneCount / totalTasks) * 100;
            
            await getPool().query(
                'INSERT INTO user_daily_logs (user_id, log_date, condition_key, tasks_done, tasks_total, score_percent) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tasks_done = VALUES(tasks_done), tasks_total = VALUES(tasks_total), score_percent = VALUES(score_percent)',
                [req.userId, date, cond, doneCount, totalTasks, score]
            );

            // Update user_category_daily_logs for this specific category
            const validCats = ['food', 'exercise', 'mental', 'sleep', 'habits'];
            const targetCat = validCats.includes(cat) ? cat : 'habits';

            const [catDoneRow] = await getPool().query(
                'SELECT COUNT(*) as catDone FROM task_completions WHERE log_date = ? AND condition_key = ? AND category = ? AND user_id = ? AND status = "done"',
                [date, cond, targetCat, req.userId]
            );
            const catDoneCount = catDoneRow[0].catDone;

            const [catTotalRow] = await getPool().query(
                `SELECT COUNT(*) as catTotal FROM tasks_${targetCat} WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1`,
                [req.userId, cond]
            );
            const catTotal = catTotalRow[0].catTotal > 0 ? catTotalRow[0].catTotal : (catDoneCount > 0 ? catDoneCount : 1);
            const catScore = (catDoneCount / catTotal) * 100;

            await getPool().query(
                'INSERT INTO user_category_daily_logs (user_id, log_date, condition_key, category, tasks_done, tasks_total, score_percent) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tasks_done = VALUES(tasks_done), tasks_total = VALUES(tasks_total), score_percent = VALUES(score_percent)',
                [req.userId, date, cond, targetCat, catDoneCount, catTotal, catScore]
            );
            
            return res.json({ success: true, status, doneCount, score, category: targetCat, catDoneCount, catScore });
        } else {
            const mem = getMemoryStore().task_completions;
            let comp = mem.find(c => c.task_id === taskId && c.log_date === date && c.condition_key === cond && c.user_id === req.userId);
            let newStatus = 'done';
            if (comp) {
                comp.status = comp.status === 'done' ? 'pending' : 'done';
                newStatus = comp.status;
            } else {
                mem.push({ id: mem.length + 1, task_id: taskId, category: cat, condition_key: cond, log_date: date, status: 'done', user_id: req.userId });
            }
            return res.json({ success: true, status: newStatus });
        }
    } catch (err) {
        console.error('Toggle completion error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tasks/completions
router.get('/completions', async (req, res) => {
    try {
        const { date, conditionKey, category } = req.query;
        if (!date) return res.status(400).json({ success: false, error: 'Date is required' });
        
        let query = 'SELECT task_id, status FROM task_completions WHERE log_date = ? AND user_id = ?';
        let params = [date, req.userId];
        
        if (conditionKey) {
            query += ' AND condition_key = ?';
            params.push(conditionKey);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        
        if (getIsConnected()) {
            const [completions] = await getPool().query(query, params);
            return res.json({ success: true, completions });
        } else {
            const mem = getMemoryStore().task_completions.filter(c => c.log_date === date && c.user_id === req.userId && (!conditionKey || c.condition_key === conditionKey));
            return res.json({ success: true, completions: mem });
        }
    } catch (err) {
        console.error('Get completions error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tasks/streak
router.get('/streak', async (req, res) => {
    try {
        if (!getIsConnected()) return res.json({ success: true, currentStreak: 0, longestStreak: 0 });
        
        const [logs] = await getPool().query(
            'SELECT log_date, score_percent FROM user_daily_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 30',
            [req.userId]
        );
        
        let currentStreak = 0;
        const today = getLocalDateString();
        
        for (let i = 0; i < logs.length; i++) {
            if (logs[i].score_percent >= 50) {
                currentStreak++;
            } else {
                const dateStr = logs[i].log_date.toISOString().slice(0, 10);
                if (dateStr === today && i === 0) continue;
                break;
            }
        }
        
        return res.json({ success: true, currentStreak, longestStreak: currentStreak });
    } catch(err) {
        console.error('Streak error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tasks/calendar
router.get('/calendar', async (req, res) => {
    try {
        if (!getIsConnected()) return res.json({ success: true, history: [] });
        
        const { year, month, days, category, conditionKey } = req.query;
        let query, params;

        if (category && category !== 'all') {
            query = 'SELECT log_date as date, score_percent as score, tasks_done as done, tasks_total as total, condition_key, category FROM user_category_daily_logs WHERE user_id = ? AND category = ?';
            params = [req.userId, category];
            if (conditionKey && conditionKey !== 'all') {
                query += ' AND condition_key = ?';
                params.push(conditionKey);
            }
            if (year && month) {
                query += ' AND YEAR(log_date) = ? AND MONTH(log_date) = ? ORDER BY log_date ASC';
                params.push(parseInt(year), parseInt(month));
            } else {
                const limitDays = parseInt(days) || 60;
                query += ' ORDER BY log_date DESC LIMIT ?';
                params.push(limitDays);
            }
        } else {
            query = 'SELECT log_date as date, score_percent as score, tasks_done as done, tasks_total as total, condition_key FROM user_daily_logs WHERE user_id = ?';
            params = [req.userId];
            if (conditionKey && conditionKey !== 'all') {
                query += ' AND condition_key = ?';
                params.push(conditionKey);
            }
            if (year && month) {
                query += ' AND YEAR(log_date) = ? AND MONTH(log_date) = ? ORDER BY log_date ASC';
                params.push(parseInt(year), parseInt(month));
            } else {
                const limitDays = parseInt(days) || 60;
                query += ' ORDER BY log_date DESC LIMIT ?';
                params.push(limitDays);
            }
        }
        
        const [history] = await getPool().query(query, params);
        return res.json({ success: true, history, category: category || 'all' });
    } catch(err) {
        console.error('Calendar error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tasks/calendar-day
router.get('/calendar-day', async (req, res) => {
    try {
        const date = req.query.date || getLocalDateString();
        const conditionKey = req.query.conditionKey || 'general';
        const category = req.query.category || 'all';
        if (!getIsConnected()) return res.json({ success: true, date, completedTasks: [], categoryBreakdown: [], log: null });
        
        const [logs] = await getPool().query(
            'SELECT log_date as date, score_percent as score, score_percent, tasks_done as done, tasks_done, tasks_total as total, tasks_total, condition_key FROM user_daily_logs WHERE user_id = ? AND log_date = ?',
            [req.userId, date]
        );

        let catLog = null;
        if (category && category !== 'all') {
            const [catLogs] = await getPool().query(
                'SELECT log_date as date, score_percent as score, score_percent, tasks_done as done, tasks_done, tasks_total as total, tasks_total, condition_key, category FROM user_category_daily_logs WHERE user_id = ? AND log_date = ? AND category = ?',
                [req.userId, date, category]
            );
            if (catLogs.length > 0) catLog = catLogs[0];
        }
        
        const [completions] = await getPool().query(`
SELECT 
    tc.task_id, tc.category, tc.condition_key, tc.status, tc.created_at,
    COALESCE(tf.name, te.name, tm.name, ts.name, th.name, tc.task_id) as name,
    COALESCE(tf.tip, te.tip, tm.tip, ts.tip, th.tip, '') as tip,
    COALESCE(tf.icon, te.icon, tm.icon, ts.icon, th.icon, '📝') as icon
FROM task_completions tc
LEFT JOIN tasks_food tf ON tc.task_id = tf.id
LEFT JOIN tasks_exercise te ON tc.task_id = te.id
LEFT JOIN tasks_mental tm ON tc.task_id = tm.id
LEFT JOIN tasks_sleep ts ON tc.task_id = ts.id
LEFT JOIN tasks_habits th ON tc.task_id = th.id
WHERE tc.user_id = ? AND tc.log_date = ? AND tc.status = 'done'
ORDER BY tc.created_at ASC
        `, [req.userId, date]);

        // Category breakdown across all 5 wellness pillars
        const validCats = [
            { key: 'food', name: 'Diet & Food', icon: '🥗', color: '#10b981' },
            { key: 'exercise', name: 'Exercise & Movement', icon: '🏃', color: '#f59e0b' },
            { key: 'mental', name: 'Mental Well-Being', icon: '🧘', color: '#8b5cf6' },
            { key: 'sleep', name: 'Sleep & Rest', icon: '🌙', color: '#3b82f6' },
            { key: 'habits', name: 'Daily Habits', icon: '✨', color: '#ec4899' }
        ];

        const [catLogs] = await getPool().query(
            'SELECT category, tasks_done as done, tasks_total as total, score_percent as score FROM user_category_daily_logs WHERE user_id = ? AND log_date = ?',
            [req.userId, date]
        );
        const catLogMap = {};
        catLogs.forEach(c => { catLogMap[c.category] = c; });

        const categoryBreakdown = [];
        for (const cat of validCats) {
            const completedInCat = completions.filter(c => c.category === cat.key);
            const savedLog = catLogMap[cat.key];

            let done = completedInCat.length;
            let total = 0;
            if (savedLog && savedLog.total > 0) {
                total = savedLog.total;
            } else {
                const [totalRow] = await getPool().query(
                    `SELECT COUNT(*) as cnt FROM tasks_${cat.key} WHERE (user_id = ? OR user_id IS NULL) AND condition_key = ? AND is_active = 1`,
                    [req.userId, conditionKey]
                );
                total = totalRow[0].cnt || (done > 0 ? done : 1);
            }

            const score = total > 0 ? Math.round((done / total) * 100) : 0;
            categoryBreakdown.push({
                category: cat.key,
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                done,
                total,
                score,
                completedTasks: completedInCat
            });
        }

        const filteredTasks = (category && category !== 'all')
            ? completions.filter(c => c.category === category)
            : completions;
        
        return res.json({
            success: true,
            date,
            category: category || 'all',
            log: (category && category !== 'all' && catLog) ? catLog : (logs[0] || null),
            overallLog: logs[0] || null,
            categoryLog: catLog,
            categoryBreakdown,
            completedTasks: filteredTasks,
            allCompletedTasks: completions
        });
    } catch(err) {
        console.error('Calendar day error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tasks/preferences (Get user's preferred categories)
router.get('/preferences', async (req, res) => {
    try {
        if (!getIsConnected()) {
            return res.json({ success: true, categories: ['food', 'exercise', 'mental', 'sleep', 'habits'] });
        }
        const [rows] = await getPool().query(
            'SELECT category, is_enabled FROM user_category_preferences WHERE user_id = ?',
            [req.userId]
        );
        if (rows.length === 0) {
            return res.json({ success: true, categories: ['food', 'exercise', 'mental', 'sleep', 'habits'] });
        }
        const enabled = rows.filter(r => r.is_enabled === 1).map(r => r.category);
        return res.json({ success: true, categories: enabled.length > 0 ? enabled : ['food', 'exercise', 'mental', 'sleep', 'habits'] });
    } catch (err) {
        console.error('Get preferences error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/tasks/preferences (Save user's preferred categories)
router.post('/preferences', async (req, res) => {
    try {
        const { categories } = req.body;
        if (!Array.isArray(categories)) {
            return res.status(400).json({ success: false, error: 'Categories array required' });
        }
        if (!getIsConnected()) {
            return res.json({ success: true, categories });
        }
        const validCats = ['food', 'exercise', 'mental', 'sleep', 'habits'];
        for (const cat of validCats) {
            const isEnabled = categories.includes(cat) ? 1 : 0;
            await getPool().query(
                'INSERT INTO user_category_preferences (user_id, category, is_enabled) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE is_enabled = VALUES(is_enabled)',
                [req.userId, cat, isEnabled]
            );
        }
        return res.json({ success: true, categories });
    } catch (err) {
        console.error('Save preferences error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/tasks/weekly-report
router.get('/weekly-report', async (req, res) => {
    try {
        const weekStart = req.query.weekStart;
        if (!weekStart) return res.status(400).json({ success: false, error: 'weekStart required' });
        
        if (!getIsConnected()) return res.json({ success: true, totalTasks: 0 });
        
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        const weekEnd = end.toISOString().slice(0, 10);
        
        const [logs] = await getPool().query(
            'SELECT log_date as date, tasks_done as done, tasks_total as total, score_percent as score FROM user_daily_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC',
            [req.userId, weekStart, weekEnd]
        );
        
        let total = 0, done = 0;
        let bestScore = -1;
        let bestDay = null;
        
        logs.forEach(l => {
            total += l.total;
            done += l.done;
            if (l.score > bestScore) {
                bestScore = l.score;
                bestDay = l.date;
            }
        });
        
        const scorePercent = total > 0 ? (done / total) * 100 : 0;
        
        await getPool().query(
            'INSERT INTO weekly_reports (user_id, week_start, week_end, total_tasks, completed_tasks, score_percent, best_day, best_day_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_tasks = VALUES(total_tasks), completed_tasks = VALUES(completed_tasks), score_percent = VALUES(score_percent)',
            [req.userId, weekStart, weekEnd, total, done, scorePercent, bestDay, bestScore]
        );
        
        return res.json({
            success: true,
            weekStart, weekEnd,
            totalTasks: total,
            completedTasks: done,
            scorePercent,
            bestDay,
            dailyBreakdown: logs
        });
    } catch(err) {
        console.error('Weekly report error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
