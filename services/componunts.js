const db = require('../utilities/dbModule');

// -------------------------------
// GET COMPONENTS BASED ON ROLE (BANK DB)
exports.getComponunts = async (req, res) => {
    try {
        const ROLE_ID = req.user.ROLE_ID;

        if (!ROLE_ID) {
            return res.status(400).send({
                code: 400,
                message: 'ROLE_ID is missing in user context'
            });
        }

        const q = `
            SELECT *
            FROM component_master
            WHERE ROLE_ID = ?
            ORDER BY SEQ
        `;

        const [rows] = await req.db.promise().query(q, [ROLE_ID]);

        return res.send({
            code: 200,
            message: 'ok',
            data: rows
        });

    } catch (error) {
        console.error('❌ GET COMPONENTS ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get component details'
        });
    }
};
