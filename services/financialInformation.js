const reqData = (req) => {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        APPLICANT_NO: req.body.APPLICANT_NO,
        INCOME: req.body.INCOME,
        SOURCE_OF_BUSINESS: req.body.SOURCE_OF_BUSINESS
    };
};

// -------------------------------
// GET financial information
exports.get = async (req, res) => {
    try {
        const { APPLICANT_ID, APPLICANT_NO } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        let sql = `SELECT * FROM financial_information WHERE APPLICANT_ID = ?`;
        const params = [APPLICANT_ID];

        if (APPLICANT_NO) {
            sql += ` AND APPLICANT_NO = ?`;
            params.push(APPLICANT_NO);
        }

        const [rows] = await req.db.promise().query(sql, params);

        return res.send({
            code: 200,
            message: 'ok',
            data: rows
        });

    } catch (error) {
        console.error('❌ FINANCIAL GET ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get financial information'
        });
    }
};

// -------------------------------
// CREATE financial information
exports.create = async (req, res) => {
    try {
        const data = reqData(req);

        if (!data.APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        await req.db.promise().query(`INSERT INTO financial_information SET ?`, data);

        return res.send({
            code: 200,
            message: 'Financial information saved successfully'
        });

    } catch (error) {
        console.error('❌ FINANCIAL CREATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to save financial information'
        });
    }
};

// -------------------------------
// UPDATE financial information
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

        await req.db.promise().query(`UPDATE financial_information SET ${setData} WHERE ID = ?`, values);

        return res.send({
            code: 200,
            message: 'Financial information updated successfully'
        });

    } catch (error) {
        console.error('❌ FINANCIAL UPDATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to update financial information'
        });
    }
};
