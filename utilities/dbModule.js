// const dbConfig = require('./dbConfig');
// const pool = require('./dbConfig');
// const util = require('util');

// var counter = 0;

// // Promisified functions for async/await support
// const promisePool = pool.promise();

// exports.executeQuery = async(query, supportKey) => {
//     try {
//         console.log(query);
//         const [results, fields] = await promisePool.query(query);
//         return results;
//     } catch (error) {
//         console.log("Exception  In : " + query + " Error : ", error);
//         throw error;
//     }
// };

// exports.executeQueryData = async(query, data, supportKey) => {
//     try {
//         console.log(query, data);
//         const [results, fields] = await promisePool.query(query, data);
//         return results;
//     } catch (error) {
//         console.log("Exception  In : " + query + " Error : ", error);
//         throw error;
//     }
// };



// // connection related services

// exports.openConnection = async() => {
//     const connection = await promisePool.getConnection();
//     await connection.beginTransaction();
//     return connection;
// };

// exports.rollbackConnection = async(connection) => {
//     if (!connection) return;
//     try {
//         await connection.rollback();
//     } finally {
//         connection.release();
//     }
// };

// exports.commitConnection = async(connection) => {
//     if (!connection) return;
//     try {
//         await connection.commit();
//     } catch (error) {
//         await connection.rollback();
//         throw error; // Re-throw error after rolling back
//     } finally {
//         connection.release();
//     }
// };

// 1111111111
// const { masterPool, getBankPool } = require('./dbConfig');

// exports.executeMasterQuery = async(query, data = []) => {
//     const [rows] = await masterPool.promise().query(query, data);
//     return rows;
// };

// exports.executeBankQuery = async(bankId, query, data = []) => {
//     const pool = getBankPool(bankId);
//     const [rows] = await pool.promise().query(query, data);
//     return rows;
// };



// const { masterPool, getBankPool } = require('./dbConfig');

// /* ---------- MASTER DB ---------- */
// exports.executeMasterQuery = async(query, data = []) => {
//     const [rows] = await masterPool.promise().query(query, data);
//     return rows;
// };

// /* ---------- BANK DB (DEFAULT) ---------- */
// exports.executeQuery = async(query, bankId, data = []) => {
//     if (!bankId) {
//         throw new Error('BANK_ID is required');
//     }

//     const pool = getBankPool(bankId);
//     const [rows] = await pool.promise().query(query, data);
//     return rows;
// };

// exports.executeQueryData = async(query, data, bankId) => {
//     if (!bankId) {
//         throw new Error('BANK_ID is required');
//     }

//     const pool = getBankPool(bankId);
//     const [rows] = await pool.promise().query(query, data);
//     return rows;
// };


const {
    masterPool,
    getBankAppPool,
    getBankCbsPool
} = require('./dbConfig');

/* ================= MASTER DB ================= */

exports.executeMasterQuery = async(query, data = []) => {
    const [rows] = await masterPool.promise().query(query, data);
    return rows;
};

/* ================= APP DB (BANK WISE) ================= */

exports.executeAppQuery = async(query, bankId, data = []) => {
    if (!bankId) throw new Error('BANK_ID is required');

    const pool = getBankAppPool(bankId);
    const [rows] = await pool.promise().query(query, data);
    return rows;
};

/* ================= CBS DB (BANK WISE) ================= */

exports.executeCbsQuery = async(query, bankId, data = []) => {
    if (!bankId) throw new Error('BANK_ID is required');

    const pool = getBankCbsPool(bankId);
    const [rows] = await pool.promise().query(query, data);
    return rows;
};