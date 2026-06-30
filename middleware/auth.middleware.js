const jwt = require('jsonwebtoken');
const {
    getBankAppPool,
    getBankCbsPool,
    getBankConfig
} = require('../utilities/dbConfig');

module.exports = (req, res, next) => {

    console.log('🔵 [AUTH] Middleware HIT');
    console.log('➡️ Path:', req.path);
    console.log('➡️ Method:', req.method);

    const openApis = [
        '/user/login',
        '/passwordPolicy/get', // Allow fetching policy without token (BANK_ID required as query param)
        '/user/resetPassword'  // Allow resetting password without token during forced reset flow
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
        req.userName = decoded.USER_NAME;
        req.branchName = decoded.BRANCH_NAME;

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

        // ⚙️ CBS API CONFIG
        const bankConfig = getBankConfig(decoded.BANK_ID);
        if (bankConfig) {
            req.cbsApiHost = bankConfig.cbsApiHost;
            req.cbsApiPort = bankConfig.cbsApiPort;
            req.bankName = bankConfig.bankName;
            // 🔴 Dynamic Fields for Multitenancy
            req.cbsBranchName = bankConfig.cbsBranchName;
            req.cbsCallerSystem = bankConfig.cbsCallerSystem;
            console.log(`🟢 CBS API Config attached: ${req.cbsApiHost}:${req.cbsApiPort} (${req.bankName})`);
        }

        return next();

    } catch (err) {
        return res.status(401).send({
            code: 401,
            message: 'Invalid or expired token'
        });
    }
};