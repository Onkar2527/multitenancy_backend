const reqData = (req) => {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        IS_MINOR: req.body.IS_MINOR,
        DOB: req.body.DOB,
        NOMINEE_NAME: req.body.NOMINEE_NAME,
        NOMINEE_MIDDLE_NAME: req.body.NOMINEE_MIDDLE_NAME,
        NOMINEE_LAST_NAME: req.body.NOMINEE_LAST_NAME,
        RELATION: req.body.RELATION,
        NOMINEE_ADDRESS: req.body.NOMINEE_ADDRESS,
        NOMINEE_DOB: req.body.NOMINEE_DOB,
        NOMINEE_AGE: req.body.NOMINEE_AGE,
        APONITED_NAME: req.body.APONITED_NAME,
        APONITED_ADDRESS: req.body.APONITED_ADDRESS,
        SHARE_PERCENTAGE: req.body.SHARE_PERCENTAGE,
        NOMINATION_TYPE: req.body.NOMINATION_TYPE,
        OTHER_RELATION: req.body.OTHER_RELATION
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
            `SELECT * FROM nominee_details WHERE APPLICANT_ID = ?`,
            [APPLICANT_ID]
        );

        return res.send({
            code: 200,
            message: 'OK',
            data: rows
        });

    } catch (error) {
        console.error('❌ NOMINEE GET ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get Nominee Details'
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

        await req.db.promise().query(`INSERT INTO nominee_details SET ?`, data);

        return res.send({
            code: 200,
            message: 'Nominee Details saved successfully'
        });

    } catch (error) {
        console.error('❌ NOMINEE CREATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to save Nominee Details'
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

        await req.db.promise().query(`UPDATE nominee_details SET ${setData} WHERE ID = ?`, values);

        return res.send({
            code: 200,
            message: 'Nominee Details updated successfully'
        });

    } catch (error) {
        console.error('❌ NOMINEE UPDATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to update Nominee Details'
        });
    }
};

// -------------------------------
// DELETE Nominee
exports.delete = async (req, res) => {
    try {
        const { ID } = req.body;

        if (!ID) {
            return res.status(400).send({
                code: 400,
                message: 'ID is required'
            });
        }

        await req.db.promise().query(
            `DELETE FROM nominee_details WHERE ID = ?`,
            [ID]
        );

        return res.send({
            code: 200,
            message: 'Nominee Details deleted successfully'
        });

    } catch (error) {
        console.error('❌ NOMINEE DELETE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to delete Nominee Details'
        });
    }
};

