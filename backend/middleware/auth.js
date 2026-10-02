const jwt = require('jsonwebtoken');
const { getPool, getIsConnected } = require('../config/db');

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_here', async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        
        req.userId = decoded.id;
        req.userEmail = decoded.email;

        // Verify user actually exists in DB
        if (getIsConnected()) {
            try {
                const [users] = await getPool().query('SELECT id FROM users WHERE id = ?', [req.userId]);
                if (users.length === 0) {
                    return res.status(401).json({ error: 'Unauthorized: User no longer exists' });
                }
            } catch (e) {
                console.error("Auth DB error:", e);
            }
        }
        
        next();
    });
};

module.exports = { verifyToken };
