const {
    masterPool,
    getBankAppPool,
    getBankCbsPool
} = require('./dbConfig');

exports.executeMasterQuery = async (query, data = []) => {
    const [rows] = await masterPool.promise().query(query, data);
    return rows;
};

exports.executeAppQuery = async (query, bankId, data = []) => {
    if (!bankId) throw new Error('BANK_ID is required');

    const pool = getBankAppPool(bankId);
    const [rows] = await pool.promise().query(query, data);
    return rows;
};

exports.executeCbsQuery = async (query, bankId, data = []) => {
    if (!bankId) throw new Error('BANK_ID is required');

    const pool = getBankCbsPool(bankId);
    const [rows] = await pool.promise().query(query, data);
    return rows;
};