const db = require('../utilities/dbModule')


// -------------------------------
// GET TABS FOR APPLICANT (BANK DB)
exports.getTabs = async (req, res) => {
    try {
        const { APPLICANT_ID } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        const q = `
            SELECT *
            FROM view_tab_master
            WHERE APPLICANT_ID = ?
            ORDER BY view_tab_master.INDEX
        `;

        const [rows] = await req.db.promise().query(q, [APPLICANT_ID]);

        return res.send({
            code: 200,
            message: 'ok',
            data: rows
        });

    } catch (error) {
        console.error('❌ GET TABS ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get tabs'
        });
    }
};