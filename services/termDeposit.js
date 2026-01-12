const reqData = (req) => {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        ACCOUNT_TYPE: req.body.ACCOUNT_TYPE,
        INITIAL_AMOUNT: req.body.INITIAL_AMOUNT,
        MODE_OF_PAYMENT: req.body.MODE_OF_PAYMENT,
        TRANSFER_ACCOUNT_NO: req.body.TRANSFER_ACCOUNT_NO,
        CHAQUE_NO: req.body.CHAQUE_NO,
        DRAWN_BANK: req.body.DRAWN_BANK,
        TRANSFER_DATE: req.body.TRANSFER_DATE,
        DEPOSIT_AMOUNT: req.body.DEPOSIT_AMOUNT,
        DEPOSIT_FREQUANCY: req.body.DEPOSIT_FREQUANCY,
        RATE_OF_INTEREST: req.body.RATE_OF_INTEREST,
        TANURE_YEARS: req.body.TANURE_YEARS,
        TANURE_MONTHS: req.body.TANURE_MONTHS,
        TANURE_DAYS: req.body.TANURE_DAYS,
        INTEREST_PAYOUT: req.body.INTEREST_PAYOUT,
        MODE_OF_INTEREST_PAYOUT: req.body.MODE_OF_INTEREST_PAYOUT,
        AUTO_RENEWAL: req.body.AUTO_RENEWAL,
        DEPOSIT_BANK_NAME: req.body.DEPOSIT_BANK_NAME,
        DEPOSIT_BRANCH_NAME: req.body.DEPOSIT_BRANCH_NAME,
        DEPOSIT_IFSC_CODE: req.body.DEPOSIT_IFSC_CODE,
        DEPOSIT_ACCOUNT_NUMBER: req.body.DEPOSIT_ACCOUNT_NUMBER,
        TDS: req.body.TDS,
        MATURITY_DATE: req.body.MATURITY_DATE,
        MATURITY_AMOUNT: req.body.MATURITY_AMOUNT,
        ACCOUNT_OPERATION: req.body.ACCOUNT_OPERATION,
        MOBILE_NUMBER_2: req.body.MOBILE_NUMBER_2,
        CHEQUE_BRANCH_NAME: req.body.CHEQUE_BRANCH_NAME,
        CHEQUE_BANK_NAME: req.body.CHEQUE_BANK_NAME,
        PAYMENT_INSTRUCTION: req.body.PAYMENT_INSTRUCTION,
        SCHEME_CODE: req.body.SCHEME_CODE
    };
};

// -------------------------------
// GET Nominee
exports.get = async (req, res) => {
    try {
        const { APPLICANT_ID } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        const [rows] = await req.db.promise().query(
            `SELECT * FROM term_deposite WHERE APPLICANT_ID = ?`,
            [APPLICANT_ID]
        );

        return res.send({
            code: 200,
            message: 'OK',
            data: rows
        });

    } catch (error) {
        console.error('❌ TERM DEPOSIT GET ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get deposit details'
        });
    }
};

// -------------------------------
// CREATE Nominee
exports.create = async (req, res) => {
    try {
        const data = reqData(req);

        if (!data.APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        const [result] = await req.db.promise().query(`INSERT INTO term_deposite SET ?`, data);

        return res.send({
            code: 200,
            message: 'Deposit information saved successfully',
            data: {
                ID: result.insertId
            }
        });

    } catch (error) {
        console.error('❌ TERM DEPOSIT CREATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to save term deposit information'
        });
    }
};

// -------------------------------
// UPDATE Nominee
exports.update = async (req, res) => {
    try {
        const data = reqData(req);
        const { ID } = req.body;

        if (!ID) {
            return res.status(400).send({
                code: 400,
                message: 'ID is required'
            });
        }

        let setData = '';
        const values = [];

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                setData += `${key} = ?, `;
                values.push(data[key]);
            }
        });

        if (values.length === 0) {
            return res.status(400).send({
                code: 400,
                message: 'No data to update'
            });
        }

        setData = setData.slice(0, -2);
        values.push(ID);

        await req.db.promise().query(`UPDATE term_deposite SET ${setData} WHERE ID = ?`, values);

        return res.send({
            code: 200,
            message: 'Term deposit information updated successfully'
        });

    } catch (error) {
        console.error('❌ TERM DEPOSIT UPDATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to update term deposit'
        });
    }
};
