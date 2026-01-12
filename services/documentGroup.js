// -------------------------------
// GET ALL DOCUMENT GROUPS (BANK DB)
exports.get = async (req, res) => {
    try {
        const [rows] = await req.db.promise().query(`SELECT * FROM document_group_master`);

        return res.send({
            code: 200,
            message: 'ok',
            data: rows
        });
    } catch (error) {
        console.error('❌ GET DOCUMENT GROUPS ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'failed to get document groups'
        });
    }
};
