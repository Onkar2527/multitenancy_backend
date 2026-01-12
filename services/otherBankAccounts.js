const reqData = (req) => {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        APPLICANT_NO: req.body.APPLICANT_NO,
        NAME_OF_BANK: req.body.NAME_OF_BANK,
        NAME_OF_BANK2: req.body.NAME_OF_BANK2,
        NAME_OF_BANK3: req.body.NAME_OF_BANK3,
        NAME_OF_BANK4: req.body.NAME_OF_BANK4,
        BRANCH_NAME: req.body.BRANCH_NAME,
        BRANCH_NAME2: req.body.BRANCH_NAME2,
        ACCOUNT_NO: req.body.ACCOUNT_NO,
        ACCOUNT_NO2: req.body.ACCOUNT_NO2,
        DEBIT_CARD: req.body.DEBIT_CARD,
        DEBIT_CARD2: req.body.DEBIT_CARD2
    };
};

// -------------------------------
// GET other bank account
exports.get = async (req, res) => {
    try {
        const { APPLICANT_ID, APPLICANT_NO } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        let sql = `SELECT * FROM other_bank_account WHERE APPLICANT_ID = ?`;
        const params = [APPLICANT_ID];

        if (APPLICANT_NO) {
            sql += ` AND APPLICANT_NO = ?`;
            params.push(APPLICANT_NO);
        }

        const [rows] = await req.db.promise().query(sql, params);

        return res.send({
            code: 200,
            message: 'OK',
            data: rows
        });

    } catch (error) {
        console.error('❌ OTHER BANK ACCOUNTS GET ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get other bank account information'
        });
    }
};

// -------------------------------
// CREATE other bank account
exports.create = async (req, res) => {
    try {
        const data = reqData(req);

        if (!data.APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        await req.db.promise().query(`INSERT INTO other_bank_account SET ?`, data);

        return res.send({
            code: 200,
            message: 'Other bank account saved successfully'
        });

    } catch (error) {
        console.error('❌ OTHER BANK ACCOUNTS CREATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to save other bank account information'
        });
    }
};

// -------------------------------
// UPDATE other bank account
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

        await req.db.promise().query(`UPDATE other_bank_account SET ${setData} WHERE ID = ?`, values);

        return res.send({
            code: 200,
            message: 'Other bank account information updated successfully'
        });

    } catch (error) {
        console.error('❌ OTHER BANK ACCOUNTS UPDATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to update other bank account information'
        });
    }
};
