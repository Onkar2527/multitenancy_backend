const db = require('../utilities/dbModule');

function reqData(req) {
    return {
        APPLICANT_FULL_NAME: req.body.APPLICANT_FULL_NAME,
        APPLICANT_NO: req.body.APPLICANT_NO,
        APPLICANT_ID: req.body.APPLICANT_ID,
        PAN_NUMBER: req.body.PAN_NUMBER,
        IS_VERIFIED: req.body.IS_VERIFIED ? 1 : 0,
        CATEGORY: req.body.CATEGORY,
    };
}

exports.get = async (req, res) => {
    const pool = req.db;
    try {
        const { PAN_NUMBER } = req.body;
        if (!PAN_NUMBER) {
            return res.send({ code: 200, message: "OK", data: [] });
        }
        const q = `SELECT * FROM pan_verified_list WHERE PAN_NUMBER = ?`;
        const [results] = await pool.promise().query(q, [PAN_NUMBER]);
        res.send({
            code: 200,
            message: "OK",
            data: results
        });
    } catch (error) {
        console.error("PAN GET ERROR:", error);
        res.status(400).send({
            code: 400,
            message: "Failed to get PAN verification info"
        });
    }
};

exports.create = async (req, res) => {
    const pool = req.db;
    let connection;
    try {
        const data = reqData(req);
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        await connection.query(`INSERT INTO pan_verified_list SET ?`, [data]);

        await connection.commit();
        res.send({
            code: 200,
            message: "PAN information saved successfully"
        });
    } catch (error) {
        console.error("PAN CREATE ERROR:", error);
        if (connection) await connection.rollback();
        res.status(400).send({
            code: 400,
            message: "Failed to save PAN info"
        });
    } finally {
        if (connection) connection.release();
    }
};

exports.update = async (req, res) => {
    const pool = req.db;
    let connection;
    try {
        const { ID } = req.body;
        const data = reqData(req);

        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        await connection.query(`UPDATE pan_verified_list SET ? WHERE ID = ?`, [data, ID]);

        await connection.commit();
        res.send({
            code: 200,
            message: "PAN information updated successfully"
        });
    } catch (error) {
        console.error("PAN UPDATE ERROR:", error);
        if (connection) await connection.rollback();
        res.status(400).send({
            code: 400,
            message: "Failed to update PAN info"
        });
    } finally {
        if (connection) connection.release();
    }
};
