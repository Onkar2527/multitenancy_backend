
const db = require('../utilities/dbModule');

function reqData(req) {
    return {
        AADHAAR_NUMBER: req.body.AADHAAR_NUMBER,
        APPLICANT_ID: req.body.APPLICANT_ID,
        APPLICANT_NO: req.body.APPLICANT_NO,
        DOB: req.body.DOB,
        APPLICANT_FULL_NAME: req.body.APPLICANT_FULL_NAME,
        GENDER: req.body.GENDER,
        PROFILE_IMAGE: req.body.PROFILE_IMAGE,
        IS_VERIFIED: req.body.IS_VERIFIED ? 1 : 0
    };
}

exports.create = async (req, res) => {
    const pool = req.db;
    let connection;
    try {
        const addressData = req.body.ADDRESS_ID || {}; // Assuming ADDRESS_ID object contains fields
        const aadhaarData = reqData(req);

        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        // 1. Insert/Update Address
        const [addressResult] = await connection.query(`INSERT INTO aadhaar_address SET ?`, [addressData]);
        aadhaarData.ADDRESS_ID = addressResult.insertId;

        // 2. Insert Aadhaar Verified Record
        await connection.query(`INSERT INTO aadhaar_verified_list SET ?`, [aadhaarData]);

        await connection.commit();
        res.send({
            code: 200,
            message: "Aadhaar information saved successfully"
        });
    } catch (error) {
        console.error("AADHAAR CREATE ERROR:", error);
        if (connection) await connection.rollback();
        res.status(400).send({
            code: 400,
            message: "Failed to save Aadhaar details"
        });
    } finally {
        if (connection) connection.release();
    }
};

exports.get = async (req, res) => {
    const pool = req.db;
    try {
        const { AADHAAR_NUMBER, APPLICANT_NO } = req.body;
        if (!AADHAAR_NUMBER) {
            return res.send({ code: 200, message: "OK", data: [] });
        }

        const q = `SELECT * FROM aadhaar_verified_list WHERE APPLICANT_NO = ? AND AADHAAR_NUMBER = ?`;
        const [results] = await pool.promise().query(q, [APPLICANT_NO, AADHAAR_NUMBER]);

        if (results.length > 0) {
            const [addressResults] = await pool.promise().query(`SELECT * FROM aadhaar_address WHERE ID = ?`, [results[0].ADDRESS_ID]);
            results[0].ADDRESS_DETAILS = addressResults.length > 0 ? addressResults[0] : null;

            res.send({
                code: 200,
                message: "OK",
                data: results
            });
        } else {
            res.send({
                code: 200,
                message: "No record found",
                data: []
            });
        }
    } catch (error) {
        console.error("AADHAAR GET ERROR:", error);
        res.status(400).send({
            code: 400,
            message: "Failed to get Aadhaar details"
        });
    }
};

exports.update = async (req, res) => {
    const pool = req.db;
    let connection;
    try {
        const { ID, ADDRESS_ID } = req.body;
        const aadhaarData = reqData(req);

        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        let finalAddressId;

        // Handle Address update or insert
        if (ADDRESS_ID && (Array.isArray(ADDRESS_ID) ? ADDRESS_ID[0]?.ID : ADDRESS_ID.ID)) {
            const addrObj = Array.isArray(ADDRESS_ID) ? ADDRESS_ID[0] : ADDRESS_ID;
            finalAddressId = addrObj.ID;
            await connection.query(`UPDATE aadhaar_address SET ? WHERE ID = ?`, [addrObj, finalAddressId]);
        } else if (ADDRESS_ID) {
            const [addrInsert] = await connection.query(`INSERT INTO aadhaar_address SET ?`, [ADDRESS_ID]);
            finalAddressId = addrInsert.insertId;
        }

        if (finalAddressId) {
            aadhaarData.ADDRESS_ID = finalAddressId;
        }

        await connection.query(`UPDATE aadhaar_verified_list SET ? WHERE ID = ?`, [aadhaarData, ID]);

        await connection.commit();
        res.send({ code: 200, message: "Aadhaar information updated successfully" });
    } catch (error) {
        console.error("AADHAAR UPDATE ERROR:", error);
        if (connection) await connection.rollback();
        res.status(400).send({
            code: 400,
            message: "Failed to update Aadhaar info"
        });
    } finally {
        if (connection) connection.release();
    }
};
