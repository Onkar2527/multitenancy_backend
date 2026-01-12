const status_table = 'track_master';

// -------------------------------
// GET STATUS LIST (BANK DB)
exports.getList = async (req, res) => {
    try {
        const [rows] = await req.db.promise().query(
            `SELECT * FROM ${status_table} WHERE VISIBLE = 1`
        );

        return res.send({
            code: 200,
            message: "success",
            data: rows
        });
    } catch (error) {
        console.error('❌ GET STATUS ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to get status"
        });
    }
};
