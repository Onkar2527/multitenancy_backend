const mysql = require('mysql2');

const masterPool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MASTER_DB_HOST,
    user: process.env.MASTER_DB_USER,
    password: process.env.MASTER_DB_PASSWORD,
    database: process.env.MASTER_DB_NAME,
    port: process.env.MASTER_DB_PORT,
    dateStrings: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    waitForConnections: true,
    idleTimeout: 60000,
    maxIdle: 10
});


let bankAppPools = [];
let bankCbsPools = [];

async function initBankPools() {
    console.log('🔄 Initializing Bank DB pools...');

    // Close and clear existing pools if any (to prevent connection leaks)
    for (const b of bankAppPools) if (b.pool) b.pool.end();
    for (const b of bankCbsPools) if (b.pool) b.pool.end();

    bankAppPools = [];
    bankCbsPools = [];

    try {
        const promiseMaster = masterPool.promise();

        const [banks] = await promiseMaster.query(`
            SELECT ID, DB_NAME, CBS_DB_NAME
            FROM bank_master
            WHERE IS_ACTIVE = 1
        `);

        if (!banks || banks.length === 0) {
            console.warn('⚠️ No active banks found in bank_master');
            return;
        }

        for (let bank of banks) {
            /* ---------- APP DB POOL ---------- */
            if (bank.DB_NAME) {
                const appPool = mysql.createPool({
                    connectionLimit: 10,
                    host: process.env.MYSQL_HOST,
                    user: process.env.MYSQL_USER,
                    password: process.env.MYSQL_PASSWORD,
                    database: bank.DB_NAME,
                    port: process.env.MYSQL_PORT,
                    dateStrings: true,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 10000,
                    waitForConnections: true,
                    idleTimeout: 60000,
                    maxIdle: 10
                });

                bankAppPools.push({
                    bank_id: Number(bank.ID),
                    pool: appPool
                });

                console.log(`✅ APP DB connected : ${bank.DB_NAME} (ID: ${bank.ID})`);
            }

            /* ---------- CBS DB POOL ---------- */
            if (bank.CBS_DB_NAME) {
                const cbsPool = mysql.createPool({
                    connectionLimit: 10,
                    host: process.env.CBS_DB_HOST,
                    user: process.env.CBS_DB_USER,
                    password: process.env.CBS_DB_PASSWORD,
                    database: bank.CBS_DB_NAME,
                    port: process.env.CBS_DB_PORT,
                    dateStrings: true,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 10000,
                    waitForConnections: true,
                    idleTimeout: 60000,
                    maxIdle: 10
                });

                bankCbsPools.push({
                    bank_id: Number(bank.ID),
                    pool: cbsPool
                });

                console.log(`✅ CBS DB connected : ${bank.CBS_DB_NAME} (ID: ${bank.ID})`);
            }
        }
        console.log('🚀 All Bank DB pools initialized successfully');
    } catch (error) {
        console.error('❌ Error during initBankPools:', error);
        throw error;
    }
}

/* ================= POOL GETTERS ================= */

function getBankAppPool(bankId) {
    const id = Number(bankId);
    const obj = bankAppPools.find(b => b.bank_id === id);
    if (!obj) {
        console.error(`❌ Invalid BANK_ID (APP DB): ${bankId}`);
        throw new Error(`Invalid BANK_ID (APP DB): ${bankId}`);
    }
    return obj.pool;
}

function getBankCbsPool(bankId) {
    const id = Number(bankId);
    const obj = bankCbsPools.find(b => b.bank_id === id);
    if (!obj) {
        console.error(`❌ Invalid BANK_ID (CBS DB): ${bankId}`);
        throw new Error(`Invalid BANK_ID (CBS DB): ${bankId}`);
    }
    return obj.pool;
}

/* ================= EXPORT ================= */

module.exports = {
    masterPool,
    initBankPools,
    getBankAppPool,
    getBankCbsPool
};
