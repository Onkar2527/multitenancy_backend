const db = require('../utilities/dbModule');

const branch_master = 'branch_master';

// -------------------------------
// GET ALL BRANCHES (MASTER DB filtered by BANK_ID)
exports.get = async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.BANK_ID) {
            return res.status(401).send({
                code: 401,
                message: 'User context missing'
            });
        }

        // ✅ MASTER DB QUERY (Bank-wise branch)
        const rows = await db.executeMasterQuery(
            `SELECT * FROM ${branch_master} WHERE BANK_ID = ?`,
            [user.BANK_ID]
        );

        return res.send({
            code: 200,
            message: 'success',
            data: rows
        });

    } catch (error) {
        console.error('❌ GET BRANCH ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get branch'
        });
    }
};
