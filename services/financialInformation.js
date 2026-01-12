// const db = require('../utilities/dbModule');


// function reqData(req) {
//     let data = {

//         APPLICANT_ID : req.body.APPLICANT_ID,
//         APPLICANT_NO : req.body.APPLICANT_NO,
//         INCOME : req.body.INCOME,
//         SOURCE_OF_BUSINESS : req.body.SOURCE_OF_BUSINESS

//     }

//     return data;
// }


// exports.get = async (req, res) => {
//     const q = `select * from financial_information where APPLICANT_ID = ? ` + (req.body.APPLICANT_NO ? 'AND APPLICANT_NO = ?' : '');
//     const params = [req.body.APPLICANT_ID];
//     if (req.body.APPLICANT_NO) {
//         params.push(req.body.APPLICANT_NO);
//     }
//     const supportKey = req.headers['supportkey'];
//     try {
//         const results = await db.executeQueryData(q, params, supportKey);
//         res.send({
//             "code": 200,
//             "message": "ok",
//             "data": results
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to get financial information"
//         });
//     }
// };


// exports.create = async (req, res) => {
//     let data = reqData(req);
//     const q = `insert into financial_information set ?`;
//     const supportKey = req.headers['supportkey'];
//     try {
//         await db.executeQueryData(q, data, supportKey);
//         res.send({
//             "code": 200,
//             "message": "Financial information saved successfully"
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to save financial information"
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

//     const q = `update financial_information set ${setData} where ID = ?`;
//     recData.push(req.body.ID);

//     try {
//         await db.executeQueryData(q, recData, supportKey);
//         res.send({
//             "code": 200,
//             "message": "Financial information updated successfully"
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to update financial information."
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
        INCOME: req.body.INCOME,
        SOURCE_OF_BUSINESS: req.body.SOURCE_OF_BUSINESS
    };
}

// -------------------------------
// GET financial information
exports.get = async(req, res) => {
    try {
        const { APPLICANT_ID, APPLICANT_NO } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        let sql = `SELECT * FROM financial_information WHERE APPLICANT_ID = ?`;
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
            message: 'ok',
            data: rows
        });

    } catch (error) {
        console.error('FINANCIAL GET ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to get financial information'
        });
    }
};

// -------------------------------
// CREATE financial information
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
                `INSERT INTO financial_information SET ?`,
                data
            );

        res.send({
            code: 200,
            message: 'Financial information saved successfully'
        });

    } catch (error) {
        console.error('FINANCIAL CREATE ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to save financial information'
        });
    }
};

// -------------------------------
// UPDATE financial information
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
                `UPDATE financial_information SET ${setData} WHERE ID = ?`,
                values
            );

        res.send({
            code: 200,
            message: 'Financial information updated successfully'
        });

    } catch (error) {
        console.error('FINANCIAL UPDATE ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to update financial information'
        });
    }
};