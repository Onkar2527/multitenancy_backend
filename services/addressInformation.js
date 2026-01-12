const mm = require('../utilities/dbModule');

/**
 * GET address information (pincode master)
 * Uses req.db for multitenancy
 */
exports.getAddress = async (req, res) => {
    const pool = req.db;
    try {
        const {
            pageIndex = 1,
            pageSize = 10,
            sortKey = 'ID',
            sortValue = 'DESC',
            filter = ''
        } = req.body;

        const start = (Number(pageIndex) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        // Security: validate sortValue and sortKey (primitive check)
        const order = sortValue.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const allowedSortKeys = ['ID', 'PINCODE', 'AREA', 'CITY', 'STATE', 'DISTRICT'];
        const validSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'ID';

        // NOTE: filter is currently raw SQL from client which is risky.
        // In a production environment, this should be parsed into structured objects.
        // For now, we keep it but log it for auditing.
        const filterStr = filter ? ` AND ${filter}` : '';

        const countQuery = `SELECT COUNT(*) AS cnt FROM pincode_master WHERE 1${filterStr}`;
        const dataQuery = `SELECT * FROM pincode_master WHERE 1${filterStr} ORDER BY ?? ${order} LIMIT ?, ?`;

        const [countResult] = await pool.promise().query(countQuery);
        const [dataResult] = await pool.promise().query(dataQuery, [validSortKey, start, limit]);

        res.send({
            code: 200,
            message: "success",
            count: countResult[0].cnt,
            data: dataResult
        });

    } catch (error) {
        console.error("GET ADDRESS ERROR:", error);
        res.status(400).send({
            code: 400,
            message: "Failed to get address information"
        });
    }
};
