// -------------------------------
// GET STATE (BANK DB)
exports.getState = async (req, res) => {
    try {
        const [rows] = await req.db.promise().query(
            `SELECT DISTINCT STATE FROM pincode_master WHERE COUNTRY = 'India' ORDER BY STATE ASC`
        );

        return res.send({
            code: 200,
            message: "success",
            data: rows
        });
    } catch (error) {
        console.error('❌ GET STATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to get states"
        });
    }
};

// -------------------------------
// GET DISTRICT (BANK DB)
exports.getDistrict = async (req, res) => {
    try {
        const { filter } = req.body;

        if (!filter) {
            return res.status(400).send({
                code: 400,
                message: "filter (STATE) is required"
            });
        }

        const [rows] = await req.db.promise().query(
            `SELECT DISTINCT DISTRICT FROM pincode_master WHERE STATE = ? ORDER BY DISTRICT ASC`,
            [filter]
        );

        return res.send({
            code: 200,
            message: "success",
            data: rows
        });
    } catch (error) {
        console.error('❌ GET DISTRICT ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to get districts"
        });
    }
};

// -------------------------------
// GET TALUKA (BANK DB)
exports.getTaluka = async (req, res) => {
    try {
        const { filter } = req.body;

        if (!filter) {
            return res.status(400).send({
                code: 400,
                message: "filter (DISTRICT) is required"
            });
        }

        const [rows] = await req.db.promise().query(
            `SELECT DISTINCT TALUKA FROM pincode_master WHERE DISTRICT = ? ORDER BY TALUKA ASC`,
            [filter]
        );

        return res.send({
            code: 200,
            message: "success",
            data: rows
        });
    } catch (error) {
        console.error('❌ GET TALUKA ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to get talukas"
        });
    }
};

// -------------------------------
// GET VILLAGE (BANK DB)
exports.getVillage = async (req, res) => {
    try {
        const { filter } = req.body;

        if (!filter) {
            return res.status(400).send({
                code: 400,
                message: "filter (TALUKA) is required"
            });
        }

        const [rows] = await req.db.promise().query(
            `SELECT DISTINCT VILLAGE FROM pincode_master WHERE TALUKA = ? ORDER BY VILLAGE ASC`,
            [filter]
        );

        return res.send({
            code: 200,
            message: "success",
            data: rows
        });
    } catch (error) {
        console.error('❌ GET VILLAGE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to get villages"
        });
    }
};
