// -------------------------------
// Request body mapper
const reqData = (req) => {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        CHEQUE_BOOK: req.body.CHEQUE_BOOK,
        PASS_BOOK: req.body.PASS_BOOK,
        STATEMENT_BY_EMAIL: req.body.STATEMENT_BY_EMAIL,
        SMS_ALERT: req.body.SMS_ALERT,
        ATM_CARD: req.body.ATM_CARD,
        CONSENT_NEW_PRODUCT: req.body.CONSENT_NEW_PRODUCT,
        ADDON_CARD: req.body.ADDON_CARD,
        APPLICANT1_NAME: req.body.APPLICANT1_NAME,
        APPLICANT2_NAME: req.body.APPLICANT2_NAME,
        APPLICANT3_NAME: req.body.APPLICANT3_NAME,
        APPLICANT4_NAME: req.body.APPLICANT4_NAME,
        UPI: req.body.UPI,
        MOBILE_BANKING: req.body.MOBILE_BANKING
    };
};

// -------------------------------
// GET Facilities (BANK DB)
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
            `SELECT * FROM facilities WHERE APPLICANT_ID = ?`,
            [APPLICANT_ID]
        );

        return res.send({
            code: 200,
            message: 'OK',
            data: rows
        });

    } catch (error) {
        console.error('❌ FACILITIES GET ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get facilities details'
        });
    }
};

// -------------------------------
// CREATE Facilities (BANK DB)
exports.create = async (req, res) => {
    try {
        const data = reqData(req);

        if (!data.APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        await req.db.promise().query(`INSERT INTO facilities SET ?`, data);

        return res.send({
            code: 200,
            message: 'Facilities information saved successfully'
        });

    } catch (error) {
        console.error('❌ FACILITIES CREATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to save facilities information'
        });
    }
};

// -------------------------------
// UPDATE Facilities (BANK DB)
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

        await req.db.promise().query(`UPDATE facilities SET ${setData} WHERE ID = ?`, values);

        return res.send({
            code: 200,
            message: 'Facilities information updated successfully'
        });

    } catch (error) {
        console.error('❌ FACILITIES UPDATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to update facilities'
        });
    }
};
