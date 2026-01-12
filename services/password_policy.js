const db = require('../utilities/dbModule');

// -------------------------------
// GET PASSWORD POLICY (MASTER DB - BANK SPECIFIC)
exports.get = async (req, res) => {
    try {
        const BANK_ID = req.user?.BANK_ID;

        if (!BANK_ID) {
            return res.status(401).send({
                code: 401,
                message: 'Bank identification missing'
            });
        }

        const query = `
            SELECT *
            FROM password_policy
            WHERE IS_ACTIVE = 1 AND BANK_ID = ?
            ORDER BY UPDATE_DATE DESC
            LIMIT 1
        `;

        const result = await db.executeMasterQuery(query, [BANK_ID]);

        if (result && result.length > 0) {
            return res.send({
                code: 200,
                data: result[0]
            });
        } else {
            return res.status(404).send({
                code: 404,
                message: 'Password policy not found'
            });
        }

    } catch (error) {
        console.error('❌ PASSWORD POLICY GET ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Internal server error'
        });
    }
};

// -------------------------------
// SAVE/UPDATE PASSWORD POLICY (MASTER DB - BANK SPECIFIC)
exports.save = async (req, res) => {
    try {
        const BANK_ID = req.user?.BANK_ID;

        if (!BANK_ID) {
            return res.status(401).send({
                code: 401,
                message: 'Bank identification missing'
            });
        }

        const current_dt = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        const updateData = {
            FR_SMALL_LETTERS: req.body.FR_SMALL_LETTERS,
            FR_CAPITAL_LETTERS: req.body.FR_CAPITAL_LETTERS,
            FR_NUMBERS: req.body.FR_NUMBERS,
            FR_SYMBOLS: req.body.FR_SYMBOLS,
            PASSWORD_LENGTH: req.body.PASSWORD_LENGTH,
            FR_PASSWORD_RESET: req.body.FR_PASSWORD_RESET,
            UPDATE_DATE: current_dt
        };

        const query = `UPDATE password_policy SET ? WHERE BANK_ID = ?`;

        await db.executeMasterQuery(query, [updateData, BANK_ID]);

        return res.send({
            code: 200,
            message: 'Password policy updated successfully'
        });

    } catch (error) {
        console.error('❌ PASSWORD POLICY SAVE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Internal server error'
        });
    }
};