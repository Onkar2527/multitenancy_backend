const db = require('../utilities/dbModule');

function reqData(req) {
    return {
        CLIENT_ID: req.body.CLIENT_ID,
        EPIC_NO: req.body.EPIC_NO,
        GENDER: req.body.GENDER,
        STATE: req.body.STATE,
        NAME: req.body.NAME,
        RELATION_NAME: req.body.RELATION_NAME,
        RELATION_TYPE: req.body.RELATION_TYPE,
        HOUSE_NO: req.body.HOUSE_NO,
        DOB: req.body.DOB,
        AGE: req.body.AGE,
        AREA: req.body.AREA,
        DISTRICT: req.body.DISTRICT,
        ADDITIONAL_CHECK: req.body.ADDITIONAL_CHECK,
        MULTIPLE: req.body.MULTIPLE,
        LAST_UPDATE: req.body.LAST_UPDATE,
        ASSEMBLY_CONSTITUENCY: req.body.ASSEMBLY_CONSTITUENCY,
        ASSEMBLY_CONSTITUENCY_NUMBER: req.body.ASSEMBLY_CONSTITUENCY_NUMBER,
        POLLING_STATION: req.body.POLLING_STATION,
        PART_NUMBER: req.body.PART_NUMBER,
        PART_NAME: req.body.PART_NAME,
        SLNO_INPART: req.body.SLNO_INPART,
        PS_LAT_LONG: req.body.PS_LAT_LONG,
        RLN_NAME_V1: req.body.RLN_NAME_V1,
        RLN_NAME_V2: req.body.RLN_NAME_V2,
        RLN_NAME_V3: req.body.RLN_NAME_V3,
        SECTION_NO: req.body.SECTION_NO,
        NAME_V1: req.body.NAME_V1,
        NAME_V2: req.body.NAME_V2,
        NAME_V3: req.body.NAME_V3,
        ST_CODE: req.body.ST_CODE,
        PARLIAMENTARY_CONSTITUENCY: req.body.PARLIAMENTARY_CONSTITUENCY,
        IS_VERIFIED: req.body.IS_VERIFIED ? 1 : 0
    };
}

exports.get = async (req, res) => {
    const pool = req.db;
    try {
        const { EPIC_NO } = req.body;
        if (!EPIC_NO) {
            return res.send({ code: 200, message: "OK", data: [] });
        }
        const q = `SELECT * FROM voterid_verification_master WHERE EPIC_NO = ?`;
        const [results] = await pool.promise().query(q, [EPIC_NO]);
        res.send({
            code: 200,
            message: "OK",
            data: results
        });
    } catch (error) {
        console.error("VOTER GET ERROR:", error);
        res.status(400).send({
            code: 400,
            message: "Failed to get voter verification info"
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

        await connection.query(`INSERT INTO voterid_verification_master SET ?`, [data]);

        await connection.commit();
        res.send({
            code: 200,
            message: "Voter information saved successfully"
        });
    } catch (error) {
        console.error("VOTER CREATE ERROR:", error);
        if (connection) await connection.rollback();
        res.status(400).send({
            code: 400,
            message: "Failed to save voter info"
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

        await connection.query(`UPDATE voterid_verification_master SET ? WHERE ID = ?`, [data, ID]);

        await connection.commit();
        res.send({
            code: 200,
            message: "Voter information updated successfully"
        });
    } catch (error) {
        console.error("VOTER UPDATE ERROR:", error);
        if (connection) await connection.rollback();
        res.status(400).send({
            code: 400,
            message: "Failed to update voter info"
        });
    } finally {
        if (connection) connection.release();
    }
};
