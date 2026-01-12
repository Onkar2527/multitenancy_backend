const reqData = (req) => {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        APPLICANT_NO: req.body.APPLICANT_NO,
        IS_VEHICLE_LOAN: req.body.IS_VEHICLE_LOAN,
        IS_HOME_LOAN: req.body.IS_HOME_LOAN,
        IS_CONSUMER_LOAN: req.body.IS_CONSUMER_LOAN,
        IS_BUSINESS_LOAN: req.body.IS_BUSINESS_LOAN,
        IS_INSURANCE_LOAN: req.body.IS_INSURANCE_LOAN,
        IS_TOUR_LOAN: req.body.IS_TOUR_LOAN,
        IS_EDUCATION_LOAN: req.body.IS_EDUCATION_LOAN,
        IS_VEHICLE_LOAN_YEAR: req.body.IS_VEHICLE_LOAN_YEAR,
        IS_HOME_LOAN_YEAR: req.body.IS_HOME_LOAN_YEAR,
        IS_CONSUMER_LOAN_YEAR: req.body.IS_CONSUMER_LOAN_YEAR,
        IS_BUSINESS_LOAN_YEAR: req.body.IS_BUSINESS_LOAN_YEAR,
        IS_INSURANCE_LOAN_YEAR: req.body.IS_INSURANCE_LOAN_YEAR,
        IS_TOUR_LOAN_YEAR: req.body.IS_TOUR_LOAN_YEAR,
        IS_EDUCATION_LOAN_YEAR: req.body.IS_EDUCATION_LOAN_YEAR,
        IS_VEHICLE_LOAN_REQUIRED: req.body.IS_VEHICLE_LOAN_REQUIRED,
        IS_HOME_LOAN_REQUIRED: req.body.IS_HOME_LOAN_REQUIRED,
        IS_CONSUMER_LOAN_REQUIRED: req.body.IS_CONSUMER_LOAN_REQUIRED,
        IS_BUSINESS_LOAN_REQUIRED: req.body.IS_BUSINESS_LOAN_REQUIRED,
        IS_INSURANCE_LOAN_REQUIRED: req.body.IS_INSURANCE_LOAN_REQUIRED,
        IS_TOUR_LOAN_REQUIRED: req.body.IS_TOUR_LOAN_REQUIRED,
        IS_EDUCATION_LOAN_REQUIRED: req.body.IS_EDUCATION_LOAN_REQUIRED
    };
};

// -------------------------------
// GET loan information
exports.get = async (req, res) => {
    try {
        const { APPLICANT_ID, APPLICANT_NO } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        let sql = `SELECT * FROM loan_information WHERE APPLICANT_ID = ?`;
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
        console.error('❌ LOAN GET ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get loan information'
        });
    }
};

// -------------------------------
// CREATE loan information
exports.create = async (req, res) => {
    try {
        const data = reqData(req);

        if (!data.APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        await req.db.promise().query(`INSERT INTO loan_information SET ?`, data);

        return res.send({
            code: 200,
            message: 'Loan information saved successfully'
        });

    } catch (error) {
        console.error('❌ LOAN CREATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to save loan information'
        });
    }
};

// -------------------------------
// UPDATE loan information
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

        await req.db.promise().query(`UPDATE loan_information SET ${setData} WHERE ID = ?`, values);

        return res.send({
            code: 200,
            message: 'Loan information updated successfully'
        });

    } catch (error) {
        console.error('❌ LOAN UPDATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to update loan information'
        });
    }
};
