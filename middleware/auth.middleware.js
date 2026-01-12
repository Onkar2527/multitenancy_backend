// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {

//     const openApis = [
//         '/api/user/login',
//         '/api/passwordPolicy'
//     ];

//     if (openApis.includes(req.path)) {
//         return next(); //  login ला allow
//     }

//     const authHeader = req.headers['authorization'];

//     if (!authHeader) {
//         return res.status(401).send({
//             code: 401,
//             message: 'Token missing'
//         });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded; // USER_ID, BANK_ID, ROLE_ID
//         next();
//     } catch (err) {
//         return res.status(401).send({
//             code: 401,
//             message: 'Invalid or expired token'
//         });
//     }
// };



// const jwt = require('jsonwebtoken');
// const { getBankPool } = require('../utilities/dbConfig');

// module.exports = (req, res, next) => {

//     const openApis = [
//         '/api/user/login',
//         '/api/passwordPolicy'
//     ];

//     // allow open APIs
//     if (openApis.some(p => req.path.startsWith(p))) {
//         return next();
//     }

//     const authHeader = req.headers['authorization'];

//     if (!authHeader) {
//         return res.status(401).send({
//             code: 401,
//             message: 'Token missing'
//         });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // 🔐 user context
//         req.user = decoded; // USER_ID, BANK_ID, ROLE_ID

//         // 🏦 BANK DB SELECT HERE
//         req.db = getBankPool(decoded.BANK_ID);

//         console.log('JWT USER:', decoded);

//         return next();
//     } catch (err) {
//         return res.status(401).send({
//             code: 401,
//             message: 'Invalid or expired token'
//         });
//     }
// };






// const jwt = require('jsonwebtoken');
// const { getBankPool } = require('../utilities/dbConfig');

// module.exports = (req, res, next) => {

//     console.log('🔵 [AUTH] Middleware HIT');
//     console.log('➡️ Path:', req.path);
//     console.log('➡️ Method:', req.method);

//     // const openApis = [
//     //     '/api/user/login',
//     //     '/api/passwordPolicy'
//     // ];

//     const openApis = [
//         '/user/login',
//         '/passwordPolicy'
//     ];


//     // allow open APIs
//     if (openApis.some(p => req.path.startsWith(p))) {
//         console.log('🟢 [AUTH] Open API – skipping auth');
//         return next();
//     }

//     const authHeader = req.headers['authorization'];
//     console.log('➡️ Authorization Header:', authHeader);

//     if (!authHeader) {
//         console.log('❌ [AUTH] Token missing');
//         return res.status(401).send({
//             code: 401,
//             message: 'Token missing'
//         });
//     }

//     const token = authHeader.split(' ')[1];
//     console.log('➡️ Token received');

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log('🟢 [AUTH] Token verified');
//         console.log('➡️ Decoded JWT:', decoded);

//         // 🔐 user context
//         req.user = decoded;

//         // 🏦 BANK DB SELECT HERE
//         req.db = getBankPool(decoded.BANK_ID);
//         console.log('🟢 [AUTH] Bank DB attached for BANK_ID:', decoded.BANK_ID);

//         return next();

//     } catch (err) {
//         console.log('❌ [AUTH] Token invalid / expired', err.message);
//         return res.status(401).send({
//             code: 401,
//             message: 'Invalid or expired token'
//         });
//     }
// };



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