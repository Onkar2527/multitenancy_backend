const reqData = (req) => {
    return {
        DOCUMENT_GROUP_ID: req.body.DOCUMENT_GROUP_ID,
        DOCUMENT_NAME: req.body.DOCUMENT_NAME
    };
};

// -------------------------------
// GET ALL DOCUMENTS (BANK DB)
exports.get = async (req, res) => {
    try {
        const [rows] = await req.db.promise().query(`SELECT * FROM document_master`);

        return res.send({
            code: 200,
            message: 'ok',
            data: rows
        });
    } catch (error) {
        console.error('❌ GET DOCUMENTS ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'failed to get documents'
        });
    }
};

// -------------------------------
// CREATE DOCUMENT (BANK DB)
exports.create = async (req, res) => {
    try {
        const data = reqData(req);

        if (!data.DOCUMENT_NAME) {
            return res.status(400).send({
                code: 400,
                message: 'DOCUMENT_NAME is required'
            });
        }

        await req.db.promise().query(`INSERT INTO document_master SET ?`, data);

        return res.send({
            code: 200,
            message: 'Document record inserted successfully.'
        });
    } catch (error) {
        console.error('❌ CREATE DOCUMENT ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to insert document record'
        });
    }
};
