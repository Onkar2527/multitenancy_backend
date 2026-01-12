const remark_table = 'remark_master';

// -------------------------------
// Request body mapper
const getData = (req) => {
    return {
        REMARK: req.body.REMARK,
        USER_ID: req.user.USER_ID,
        REMARK_DATE: req.body.REMARK_DATE || new Date(),
        APPLICANT_ID: req.body.APPLICANT_ID,
        USER_NAME: req.body.USER_NAME,
        ROLE: req.user.ROLE_ID
    };
};

// -------------------------------
// CREATE REMARK (BANK DB)
exports.createRemark = async (req, res) => {
    try {
        const data = getData(req);

        if (!data.APPLICANT_ID || !data.REMARK) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID and REMARK are required'
            });
        }

        await req.db.promise().query(`INSERT INTO ${remark_table} SET ?`, data);

        return res.send({
            code: 200,
            message: 'Remark created'
        });

    } catch (error) {
        console.error('❌ CREATE REMARK ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to create remark'
        });
    }
};

// -------------------------------
// GET ALL REMARKS (by applicant) (BANK DB)
exports.getAllRemark = async (req, res) => {
    try {
        const { APPLICANT_ID } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        const [rows] = await req.db.promise().query(
            `SELECT * FROM ${remark_table} WHERE APPLICANT_ID = ? ORDER BY REMARK_DATE DESC`,
            [APPLICANT_ID]
        );

        return res.send({
            code: 200,
            data: rows
        });

    } catch (error) {
        console.error('❌ GET REMARK ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to get remark'
        });
    }
};
