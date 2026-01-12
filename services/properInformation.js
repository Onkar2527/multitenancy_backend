// const db = require('../utilities/dbModule');


// function reqData(req) {

//     let data = {
//         APPLICANT_ID: req.body.APPLICANT_ID,
//         APPLICANT_NO: req.body.APPLICANT_NO,
//         IS_FOUR_WHEELER: req.body.IS_FOUR_WHEELER,
//         IS_TWO_WHEELER: req.body.IS_TWO_WHEELER,
//         IS_HOME_THEATER: req.body.IS_HOME_THEATER,
//         IS_AC: req.body.IS_AC,
//         IS_DIGITAL_CAMERA: req.body.IS_DIGITAL_CAMERA,
//         IS_VIDEO_PLAYER: req.body.IS_VIDEO_PLAYER,
//         IS_MICROWAVE: req.body.IS_MICROWAVE,
//         IS_LCD_TV: req.body.IS_LCD_TV,
//         IS_COMPUTER: req.body.IS_COMPUTER,
//         IS_WASHING_MACHINE: req.body.IS_WASHING_MACHINE,
//         FOUR_WHEELER_MODEL: req.body.FOUR_WHEELER_MODEL,
//         HOUSE_DETAIL: req.body.HOUSE_DETAIL
//     }

//     return data;
// }

// exports.get = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const q = `select * from property_information where APPLICANT_ID = ?` + (req.body.APPLICANT_NO ? ' AND APPLICANT_NO = ?' : '');
//     const params = [req.body.APPLICANT_ID];
//     if (req.body.APPLICANT_NO) {
//         params.push(req.body.APPLICANT_NO);
//     }

//     try {
//         const results = await db.executeQueryData(q, params, supportKey);
//         res.send({
//             "code": 200,
//             "message": "OK",
//             "data": results
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to get property information"
//         });
//     }
// };

// exports.create = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const data = reqData(req);
//     const q = `insert into property_information set ?`;

//     try {
//         await db.executeQueryData(q, data, supportKey);
//         res.send({
//             "code": 200,
//             "message": "Property information saved successfully"
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to save property information"
//         });
//     }
// };

// exports.update = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const data = reqData(req);
//     let setData = '';
//     let recData = [];

//     Object.keys(data).forEach(key => {
//         setData += `${key} = ? ,`;
//         recData.push(data[key]);
//     });

//     setData = setData.slice(0, -1);

//     const q = `update property_information set ${setData} where ID = ?`;
//     recData.push(req.body.ID);

//     try {
//         await db.executeQueryData(q, recData, supportKey);
//         res.send({
//             "code": 200,
//             "message": "Property information updated successfully"
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to update property information"
//         });
//     }
// };





// ❌ OLD
// const db = require('../utilities/dbModule');

// -------------------------------
// Request body mapper
function reqData(req) {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        APPLICANT_NO: req.body.APPLICANT_NO,
        IS_FOUR_WHEELER: req.body.IS_FOUR_WHEELER,
        IS_TWO_WHEELER: req.body.IS_TWO_WHEELER,
        IS_HOME_THEATER: req.body.IS_HOME_THEATER,
        IS_AC: req.body.IS_AC,
        IS_DIGITAL_CAMERA: req.body.IS_DIGITAL_CAMERA,
        IS_VIDEO_PLAYER: req.body.IS_VIDEO_PLAYER,
        IS_MICROWAVE: req.body.IS_MICROWAVE,
        IS_LCD_TV: req.body.IS_LCD_TV,
        IS_COMPUTER: req.body.IS_COMPUTER,
        IS_WASHING_MACHINE: req.body.IS_WASHING_MACHINE,
        FOUR_WHEELER_MODEL: req.body.FOUR_WHEELER_MODEL,
        HOUSE_DETAIL: req.body.HOUSE_DETAIL
    };
}

// -------------------------------
// GET property information
exports.get = async(req, res) => {
    try {
        const { APPLICANT_ID, APPLICANT_NO } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        let sql = `SELECT * FROM property_information WHERE APPLICANT_ID = ?`;
        const params = [APPLICANT_ID];

        if (APPLICANT_NO) {
            sql += ` AND APPLICANT_NO = ?`;
            params.push(APPLICANT_NO);
        }

        const [rows] = await req.db
            .promise()
            .query(sql, params);

        res.send({
            code: 200,
            message: 'OK',
            data: rows
        });

    } catch (error) {
        console.error('PROPERTY GET ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to get property information'
        });
    }
};

// -------------------------------
// CREATE property information
exports.create = async(req, res) => {
    try {
        const data = reqData(req);

        if (!data.APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        await req.db
            .promise()
            .query(
                `INSERT INTO property_information SET ?`,
                data
            );

        res.send({
            code: 200,
            message: 'Property information saved successfully'
        });

    } catch (error) {
        console.error('PROPERTY CREATE ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to save property information'
        });
    }
};

// -------------------------------
// UPDATE property information
exports.update = async(req, res) => {
    try {
        const data = reqData(req);
        const { ID } = req.body;

        if (!ID) {
            return res.status(400).send({
                code: 400,
                message: 'ID is required'
            });
        }

        let setData = '';
        const values = [];

        Object.keys(data).forEach(key => {
            setData += `${key} = ?, `;
            values.push(data[key]);
        });

        setData = setData.slice(0, -2);
        values.push(ID);

        await req.db
            .promise()
            .query(
                `UPDATE property_information SET ${setData} WHERE ID = ?`,
                values
            );

        res.send({
            code: 200,
            message: 'Property information updated successfully'
        });

    } catch (error) {
        console.error('PROPERTY UPDATE ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to update property information'
        });
    }
};