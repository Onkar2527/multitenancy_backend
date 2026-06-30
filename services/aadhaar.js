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
        let addressData = req.body.ADDRESS_ID || {};
        if (Array.isArray(addressData)) {
            addressData = addressData[0] || {};
        }
        const aadhaarData = reqData(req);

        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        // 1. Insert Address
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
            // For frontend compatibility, set ADDRESS_ID to the array of address results
            results[0].ADDRESS_ID = addressResults;
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
        let addressData = ADDRESS_ID || {};

        // Handle Address update or insert
        if (addressData && (Array.isArray(addressData) ? addressData[0]?.ID : addressData.ID)) {
            const addrObj = Array.isArray(addressData) ? addressData[0] : addressData;
            finalAddressId = addrObj.ID;
            // Clean ID field from the object to prevent mysql errors during update
            const { ID: addrId, ...addrFields } = addrObj;
            await connection.query(`UPDATE aadhaar_address SET ? WHERE ID = ?`, [addrFields, finalAddressId]);
        } else if (addressData) {
            const addrObj = Array.isArray(addressData) ? addressData[0] : addressData;
            const [addrInsert] = await connection.query(`INSERT INTO aadhaar_address SET ?`, [addrObj]);
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