const table = `amount_remaining`;

// -------------------------------
// CHECK SUFFICIENT BALANCE (BANK DB)
exports.checkSufficientBalance = async (req, res) => {
    try {
        const doc_code = req.body.DOC_TYPE;
        let rem_amount = 0;
        let rate = 0;

        const [[balanceResult], [rateResult]] = await Promise.all([
            req.db.promise().query(`SELECT AMOUNT FROM ??`, [table]),
            req.db.promise().query(`SELECT RATE FROM doc_verify_rates WHERE CODE = ?`, [doc_code])
        ]);

        if (balanceResult.length > 0) {
            rem_amount = balanceResult[0].AMOUNT;
        }

        if (rateResult.length > 0) {
            rate = rateResult[0].RATE;
        }

        if (rem_amount >= rate) {
            return res.send({
                code: 200,
                isSufficient: true
            });
        } else {
            return res.send({
                code: 200,
                isSufficient: false,
                message: "Insufficient balance."
            });
        }

    } catch (error) {
        console.error('❌ CHECK BALANCE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal Error",
            error: error.message
        });
    }
};

// -------------------------------
// GET BALANCE (INTERNAL) (BANK DB)
exports.getBalanceI = async (req) => {
    try {
        const [rows] = await req.db.promise().query(`SELECT AMOUNT FROM ??`, [table]);

        if (rows.length > 0) {
            return rows[0].AMOUNT;
        } else {
            throw new Error("Balance is not set.");
        }
    } catch (error) {
        console.error('❌ GET BALANCE INTERNAL ERROR:', error);
        throw error;
    }
};

// -------------------------------
// GET BALANCE (EXTERNAL/EXPRESS) (BANK DB)
exports.getBalanceE = async (req, res) => {
    try {
        const [rows] = await req.db.promise().query(`SELECT AMOUNT FROM ??`, [table]);

        if (rows.length > 0) {
            return res.send({
                code: 200,
                amount: rows[0].AMOUNT
            });
        } else {
            return res.status(404).send({
                code: 404,
                message: "Balance is not set."
            });
        }
    } catch (error) {
        console.error('❌ GET BALANCE EXTERNAL ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal Error",
            error: error.message
        });
    }
};

// -------------------------------
// DEDUCT BALANCE (INTERNAL) (BANK DB)
exports.deductBalanceI = async (req, amount) => {
    try {
        await req.db.promise().query(`UPDATE ?? SET AMOUNT = AMOUNT - ?`, [table, amount]);
        return true;
    } catch (error) {
        console.error('❌ DEDUCT BALANCE INTERNAL ERROR:', error);
        throw error;
    }
};

// -------------------------------
// ADD BALANCE (BANK DB)
exports.addBalance = async (req, res) => {
    try {
        const { AMOUNT } = req.body;

        if (AMOUNT === undefined) {
            return res.status(400).send({
                code: 400,
                message: "AMOUNT is required"
            });
        }

        await req.db.promise().query(`UPDATE ?? SET AMOUNT = AMOUNT + ?`, [table, AMOUNT]);

        return res.send({
            code: 200,
            message: "Balance added successfully."
        });
    } catch (error) {
        console.error('❌ ADD BALANCE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal Error",
            error: error.message
        });
    }
};

// -------------------------------
// SET BALANCE (BANK DB)
exports.setBalance = async (req, res) => {
    try {
        const { AMOUNT } = req.body;

        if (AMOUNT === undefined) {
            return res.status(400).send({
                code: 400,
                message: "AMOUNT is required"
            });
        }

        await req.db.promise().query(`UPDATE ?? SET AMOUNT = ?`, [table, AMOUNT]);

        return res.send({
            code: 200,
            message: "Balance set successfully."
        });
    } catch (error) {
        console.error('❌ SET BALANCE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal Error",
            error: error.message
        });
    }
};
