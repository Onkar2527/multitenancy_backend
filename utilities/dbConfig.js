// var mysql = require('mysql2');

// var config = {
//     connectionLimit: 10,
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//     timezone: "+00:00",
//     multipleStatements: true,
//     charset: 'UTF8_GENERAL_CI',
//     port: process.env.MYSQL_PORT,
//     dateStrings: true

// }



// var pool = mysql.createPool(config);

// [
//     { bank_id: 1, pool: null, database: "bank_db_1" },
//     { bank_id: 2, pool: null, database: "bank_db_2" },
//     { bank_id: 3, pool: null, database: "bank_db_3" },
//     { bank_id: 4, pool: null, database: "bank_db_4" }
// ]

// pool.on('connection', function(connection) {
//     console.log('DB Connection established');

//     connection.on('error', function(error) {
//         console.error(new Date(), 'MySQL error', error.code);
//     });
//     connection.on('close', function(error) {
//         console.error(new Date(), 'MySQL close', error);
//     });

// });

// module.exports = pool;




//New DB Config for Master and Bank DBs

// const mysql = require('mysql2');

// const masterPool = mysql.createPool({
//     connectionLimit: 10,
//     host: process.env.MASTER_DB_HOST,
//     user: process.env.MASTER_DB_USER,
//     password: process.env.MASTER_DB_PASSWORD,
//     database: process.env.MASTER_DB_NAME,
//     port: process.env.MASTER_DB_PORT,
//     dateStrings: true
// });

// const bankPools = [];
// // [{ bank_id, db_name, pool }]

// async function initBankPools() {
//     const promiseMaster = masterPool.promise();

//     const [banks] = await promiseMaster.query(`
//     SELECT ID, DB_NAME 
//     FROM bank_master 
//     WHERE IS_ACTIVE = 1
//   `);

//     for (let bank of banks) {
//         const pool = mysql.createPool({
//             connectionLimit: 10,
//             host: process.env.MYSQL_HOST,
//             user: process.env.MYSQL_USER,
//             password: process.env.MYSQL_PASSWORD,
//             database: bank.DB_NAME,
//             port: process.env.MYSQL_PORT,
//             dateStrings: true
//         });

//         bankPools.push({
//             bank_id: bank.ID,
//             database: bank.DB_NAME,
//             pool
//         });

//         console.log(`✅ Bank DB connected: ${bank.DB_NAME}`);
//     }
// }

// function getBankPool(bankId) {
//     const obj = bankPools.find(b => b.bank_id === bankId);
//     if (!obj) throw new Error('Invalid BANK_ID');
//     return obj.pool;
// }

// module.exports = {
//     masterPool,
//     initBankPools,
//     getBankPool
// };



const mysql = require('mysql2');

/* ================= MASTER DB ================= */

const masterPool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MASTER_DB_HOST,
    user: process.env.MASTER_DB_USER,
    password: process.env.MASTER_DB_PASSWORD,
    database: process.env.MASTER_DB_NAME,
    port: process.env.MASTER_DB_PORT,
    dateStrings: true
});

/* ================= BANK POOLS ================= */

const bankAppPools = []; // Application DB pools
const bankCbsPools = []; // CBS DB pools

/* ================= INIT BANK POOLS ================= */

async function initBankPools() {
    const promiseMaster = masterPool.promise();

    const [banks] = await promiseMaster.query(`
        SELECT ID, DB_NAME, CBS_DB_NAME
        FROM bank_master
        WHERE IS_ACTIVE = 1
    `);

    for (let bank of banks) {

        /* ---------- APP DB POOL ---------- */
        const appPool = mysql.createPool({
            connectionLimit: 10,
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: bank.DB_NAME,
            port: process.env.MYSQL_PORT,
            dateStrings: true
        });

        bankAppPools.push({
            bank_id: bank.ID,
            pool: appPool
        });

        console.log(`✅ APP DB connected : ${bank.DB_NAME}`);

        /* ---------- CBS DB POOL ---------- */
        if (bank.CBS_DB_NAME) {
            const cbsPool = mysql.createPool({
                connectionLimit: 10,
                host: process.env.CBS_DB_HOST,
                user: process.env.CBS_DB_USER,
                password: process.env.CBS_DB_PASSWORD,
                database: bank.CBS_DB_NAME,
                port: process.env.CBS_DB_PORT,
                dateStrings: true
            });

            bankCbsPools.push({
                bank_id: bank.ID,
                pool: cbsPool
            });

            console.log(`✅ CBS DB connected : ${bank.CBS_DB_NAME}`);
        }
    }
}

/* ================= POOL GETTERS ================= */

function getBankAppPool(bankId) {
    const obj = bankAppPools.find(b => b.bank_id === bankId);
    if (!obj) throw new Error('Invalid BANK_ID (APP DB)');
    return obj.pool;
}

function getBankCbsPool(bankId) {
    const obj = bankCbsPools.find(b => b.bank_id === bankId);
    if (!obj) throw new Error('Invalid BANK_ID (CBS DB)');
    return obj.pool;
}

/* ================= EXPORT ================= */

module.exports = {
    masterPool,
    initBankPools,
    getBankAppPool,
    getBankCbsPool
};