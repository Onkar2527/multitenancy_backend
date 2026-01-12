const jwt = require('jsonwebtoken');
const {
    getBankAppPool,
    getBankCbsPool
} = require('../utilities/dbConfig');

module.exports = (req, res, next) => {

    console.log('🔵 [AUTH] Middleware HIT');
    console.log('➡️ Path:', req.path);
    console.log('➡️ Method:', req.method);

    const openApis = [
        '/user/login',
        '/passwordPolicy'
    ];

    // 🔓 Open APIs
    if (openApis.some(p => req.path.startsWith(p))) {
        console.log('🟢 [AUTH] Open API – skipping auth');
        return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send({
            code: 401,
            message: 'Token missing'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🟢 [AUTH] Token verified');

        // 👤 USER CONTEXT
        req.user = decoded;

        // 🏦 APP DB
        req.appDb = getBankAppPool(decoded.BANK_ID);
        req.db = req.appDb;
        console.log('🟢 APP DB attached for BANK_ID:', decoded.BANK_ID);

        // 🏦 CBS DB (optional – if exists)
        try {
            req.cbsDb = getBankCbsPool(decoded.BANK_ID);
            console.log('🟢 CBS DB attached for BANK_ID:', decoded.BANK_ID);
        } catch (e) {
            console.log('⚠️ CBS DB not configured for BANK_ID:', decoded.BANK_ID);
            req.cbsDb = null;
        }

        return next();

    } catch (err) {
        return res.status(401).send({
            code: 401,
            message: 'Invalid or expired token'
        });
    }
};