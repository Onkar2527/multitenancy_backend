const table = `doc_verify_rates`;

// ------------------------------
// GET RATES (BANK DB)
exports.getRates = async (req, res) => {
    try {
        const [rows] = await req.db.promise().query(`SELECT * FROM ??`, [table]);

        return res.send({
            code: 200,
            data: rows
        });
    } catch (error) {
        console.error('❌ GET RATES ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal Error",
            error: error.message
        });
    }
};

// ------------------------------
// SET RATE (BANK DB)
exports.setRate = async (req, res) => {
    try {
        const { ID, RATE } = req.body;

        if (ID === undefined || RATE === undefined) {
            return res.status(400).send({
                code: 400,
                message: "ID and RATE are required"
            });
        }

        await req.db.promise().query(`UPDATE ?? SET RATE = ? WHERE ID = ?`, [table, RATE, ID]);

        return res.send({
            code: 200,
            message: "Rate updated successfully."
        });
    } catch (error) {
        console.error('❌ SET RATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal Error",
            error: error.message
        });
    }
};
