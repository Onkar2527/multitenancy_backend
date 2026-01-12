const db = require('../utilities/dbModule');

function reqData(req) {
    return {
        CLIENT_ID: req.body.CLIENT_ID,
        LICENSE_NUMBER: req.body.LICENSE_NUMBER,
        STATE: req.body.STATE,
        NAME: req.body.NAME,
        PERMANENT_ADDRESS: req.body.PERMANENT_ADDRESS,
        PERMANENT_ZIP: req.body.PERMANENT_ZIP,
        TEMPORARY_ADDRESS: req.body.TEMPORARY_ADDRESS,
        TEMPORARY_ZIP: req.body.TEMPORARY_ZIP,
        CITIZENSHIP: req.body.CITIZENSHIP,
        OLA_NAME: req.body.OLA_NAME,
        OLA_CODE: req.body.OLA_CODE,
        GENDER: req.body.GENDER,
        FATHER_OR_HUSBAND_NAME: req.body.FATHER_OR_HUSBAND_NAME,
        DOB: req.body.DOB,
        DOE: req.body.DOE,
        TRANSPORT_DOE: req.body.TRANSPORT_DOE,
        DOI: req.body.DOI,
        TRANSPORT_DOI: req.body.TRANSPORT_DOI,
        PROFILE_IMAGE: req.body.PROFILE_IMAGE,
        BLOOD_GROUP: req.body.BLOOD_GROUP,
        VEHICLE_CLASSES: req.body.VEHICLE_CLASSES,
        INITIAL_DOI: req.body.INITIAL_DOI
    };
}

exports.get = async (req, res) => {
    const pool = req.db;
    try {
        const { LICENSE_NUMBER } = req.body;
        if (!LICENSE_NUMBER) {
            return res.send({ code: 200, message: "OK", data: [] });
        }
        const q = `SELECT * FROM license_verified_list WHERE LICENSE_NUMBER = ?`;
        const [results] = await pool.promise().query(q, [LICENSE_NUMBER]);
        res.send({
            code: 200,
            message: "OK",
            data: results
        });
    } catch (error) {
        console.error("LICENSE GET ERROR:", error);
        res.status(400).send({
            code: 400,
            message: "Failed to get license verification info"
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

        await connection.query(`INSERT INTO license_verified_list SET ?`, [data]);

        await connection.commit();
        res.send({
            code: 200,
            message: "License information saved successfully"
        });
    } catch (error) {
        console.error("LICENSE CREATE ERROR:", error);
        if (connection) await connection.rollback();
        res.status(400).send({
            code: 400,
            message: "Failed to save license info"
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

        await connection.query(`UPDATE license_verified_list SET ? WHERE ID = ?`, [data, ID]);

        await connection.commit();
        res.send({
            code: 200,
            message: "License information updated successfully"
        });
    } catch (error) {
        console.error("LICENSE UPDATE ERROR:", error);
        if (connection) await connection.rollback();
        res.status(400).send({
            code: 400,
            message: "Failed to update license info"
        });
    } finally {
        if (connection) connection.release();
    }
};
