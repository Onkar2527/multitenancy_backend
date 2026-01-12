// const db = require('../utilities/dbModule');



// function reqData(req)
// {
//     data = {
//             APPLICANT_ID : req.body.APPLICANT_ID,
//             IS_MINOR:req.body.IS_MINOR,
//             DOB:req.body.DOB,
//             NOMINEE_NAME:req.body.NOMINEE_NAME,
//             RELATION :req.body.RELATION,
//             NOMINEE_ADDRESS :req.body.NOMINEE_ADDRESS,
//             APONITED_NAME:req.body.APONITED_NAME,
//             APONITED_ADDRESS:req.body.APONITED_ADDRESS,
//             NOMINEE_MIDDLE_NAME : req.body.NOMINEE_MIDDLE_NAME,
//             NOMINEE_LAST_NAME : req.body.NOMINEE_LAST_NAME,
//             NOMINEE_DOB : req.body.NOMINEE_DOB,
//             NOMINEE_AGE : req.body.NOMINEE_AGE

//     }

//     return data;
// }

// exports.get = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const q = `select * from nominee_details where APPLICANT_ID = ?`;
//     try {
//         const results = await db.executeQueryData(q, [req.body.APPLICANT_ID], supportKey);
//         res.send({
//             "code": 200,
//             "message": "OK",
//             "data": results
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to get Nominee Details"
//         });
//     }
// };

// exports.create = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const data = reqData(req);
//     const q = `insert into nominee_details set ?`;

//     try {
//         await db.executeQueryData(q, data, supportKey);
//         res.send({
//             "code": 200,
//             "message": "Nominee Details information saved successfully"
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to save Nominee Details information"
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

//     const q = `update nominee_details set ${setData} where ID = ?`;
//     recData.push(req.body.ID);

//     try {
//         await db.executeQueryData(q, recData, supportKey);
//         res.send({
//             "code": 200,
//             "message": "Nominee details information updated successfully"
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to update nominee_details."
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
        IS_MINOR: req.body.IS_MINOR,
        DOB: req.body.DOB,
        NOMINEE_NAME: req.body.NOMINEE_NAME,
        NOMINEE_MIDDLE_NAME: req.body.NOMINEE_MIDDLE_NAME,
        NOMINEE_LAST_NAME: req.body.NOMINEE_LAST_NAME,
        RELATION: req.body.RELATION,
        NOMINEE_ADDRESS: req.body.NOMINEE_ADDRESS,
        NOMINEE_DOB: req.body.NOMINEE_DOB,
        NOMINEE_AGE: req.body.NOMINEE_AGE,
        APONITED_NAME: req.body.APONITED_NAME,
        APONITED_ADDRESS: req.body.APONITED_ADDRESS
    };
}

// -------------------------------
// GET Nominee
exports.get = async(req, res) => {
    try {
        const { APPLICANT_ID } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        // 🏦 BANK DB (from middleware)
        const [rows] = await req.db
            .promise()
            .query(
                `SELECT * FROM nominee_details WHERE APPLICANT_ID = ?`, [APPLICANT_ID]
            );

        res.send({
            code: 200,
            message: 'OK',
            data: rows
        });

    } catch (error) {
        console.error('NOMINEE GET ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to get Nominee Details'
        });
    }
};

// -------------------------------
// CREATE Nominee
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
                `INSERT INTO nominee_details SET ?`,
                data
            );

        res.send({
            code: 200,
            message: 'Nominee Details saved successfully'
        });

    } catch (error) {
        console.error('NOMINEE CREATE ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to save Nominee Details'
        });
    }
};

// -------------------------------
// UPDATE Nominee
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
                `UPDATE nominee_details SET ${setData} WHERE ID = ?`,
                values
            );

        res.send({
            code: 200,
            message: 'Nominee Details updated successfully'
        });

    } catch (error) {
        console.error('NOMINEE UPDATE ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to update Nominee Details'
        });
    }
};