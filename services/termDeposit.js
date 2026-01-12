// const db = require('../utilities/dbModule');



// function reqData(req) {
//     data = {

//         // APPLICANT_ID : req.body.APPLICANT_ID,
//         // ACCOUNT_TYPE : req.body.ACCOUNT_TYPE,
//         // MODE_OF_PAYMENT: req.body.MODE_OF_PAYMENT,
//         // TRANSFER_ACCOUNT_NO: req.body.TRANSFER_ACCOUNT_NO,
//         // CHAQUE_NO:req.body.CHAQUE_NO,
//         // DEPOSIT_AMOUNT : req.body.DEPOSIT_AMOUNT,
//         // DEPOSIT_FREQUANCY: req.body.DEPOSIT_FREQUANCY,
//         // RATE_OF_INTEREST : req.body.RATE_OF_INTEREST,
//         // TANURE_YEARS  : req.body.TANURE_YEARS,
//         // TANURE_MONTHS : req.body.TANURE_MONTHS,
//         // TANURE_DAYS : req.body.TANURE_DAYS,
//         // INTEREST_PAYOUT: req.body.INTEREST_PAYOUT,
//         // MODE_OF_INTEREST_PAYOUT: req.body.MODE_OF_INTEREST_PAYOUT,
//         // AUTO_RENEWAL: req.body.AUTO_RENEWAL,
//         // DEPOSIT_BANK_NAME: req.body.DEPOSIT_BANK_NAME,
//         // DEPOSIT_BRANCH_NAME: req.body.DEPOSIT_BRANCH_NAME,
//         // DEPOSIT_IFSC_CODE: req.body.DEPOSIT_IFSC_CODE,
//         // DEPOSIT_ACCOUNT_NUMBER: req.body.DEPOSIT_ACCOUNT_NUMBER,
//         // TDS : req.body.TDS,
//         // MATURITY_DATE  :req.body.MATURITY_DATE,
//         // MATURITY_AMOUNT  : req.body.MATURITY_AMOUNT,
//         // INITIAL_AMOUNT : req.body.INITIAL_AMOUNT,

//         APPLICANT_ID: req.body.APPLICANT_ID,
//         ACCOUNT_TYPE: req.body.ACCOUNT_TYPE,
//         INITIAL_AMOUNT: req.body.INITIAL_AMOUNT,
//         MODE_OF_PAYMENT: req.body.MODE_OF_PAYMENT,
//         TRANSFER_ACCOUNT_NO: req.body.TRANSFER_ACCOUNT_NO,
//         CHAQUE_NO: req.body.CHAQUE_NO,
//         DRAWN_BANK: req.body.DRAWN_BANK,
//         TRANSFER_DATE: req.body.TRANSFER_DATE,
//         DEPOSIT_AMOUNT: req.body.DEPOSIT_AMOUNT,
//         DEPOSIT_FREQUANCY: req.body.DEPOSIT_FREQUANCY,
//         RATE_OF_INTEREST: req.body.RATE_OF_INTEREST,
//         TANURE_YEARS: req.body.TANURE_YEARS,
//         TANURE_MONTHS: req.body.TANURE_MONTHS,
//         TANURE_DAYS: req.body.TANURE_DAYS,
//         INTEREST_PAYOUT: req.body.INTEREST_PAYOUT,
//         MODE_OF_INTEREST_PAYOUT: req.body.MODE_OF_INTEREST_PAYOUT,
//         AUTO_RENEWAL: req.body.AUTO_RENEWAL,
//         DEPOSIT_BANK_NAME: req.body.DEPOSIT_BANK_NAME,
//         DEPOSIT_BRANCH_NAME: req.body.DEPOSIT_BRANCH_NAME,
//         DEPOSIT_IFSC_CODE: req.body.DEPOSIT_IFSC_CODE,
//         DEPOSIT_ACCOUNT_NUMBER: req.body.DEPOSIT_ACCOUNT_NUMBER,
//         TDS: req.body.TDS,
//         MATURITY_DATE: req.body.MATURITY_DATE,
//         MATURITY_AMOUNT: req.body.MATURITY_AMOUNT,
//         ACCOUNT_TYPE: req.body.ACCOUNT_TYPE,
//         ACCOUNT_OPERATION: req.body.ACCOUNT_OPERATION,
//         MOBILE_NUMBER_2: req.body.MOBILE_NUMBER_2,

//         CHEQUE_BRANCH_NAME: req.body.CHEQUE_BRANCH_NAME,
//         CHEQUE_BANK_NAME: req.body.CHEQUE_BANK_NAME,

//         PAYMENT_INSTRUCTION: req.body.PAYMENT_INSTRUCTION,
//         SCHEME_CODE:req.body.SCHEME_CODE

//     }

//     return data;
// }

// exports.get = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const q = `select * from term_deposite where APPLICANT_ID = ?`;
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
//             "message": "Failed to get deposit details"
//         });
//     }
// };

// exports.create = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const data = reqData(req);
//     const q = `insert into term_deposite set ?`;

//     console.log("req body", req.body);

//     try {
//         await db.executeQueryData(q, data, supportKey);
//         console.log("data is ---- ", data);
//         res.send({
//             "code": 200,
//             "message": "Deposit information saved successfully"
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to save term deposit information"
//         });
//     }
// };

// exports.update = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const data = reqData(req);
//     let setData = '';
//     let recData = [];

//     Object.keys(data).forEach(key => {
//         setData += `${key} = ?,`;
//         recData.push(data[key]);
//     });

//     setData = setData.slice(0, -1);

//     const q = `update term_deposite set ${setData} where ID = ?`;
//     recData.push(req.body.ID);

//     try {
//         await db.executeQueryData(q, recData, supportKey);
//         res.send({
//             "code": 200,
//             "message": "Term deposit information updated successfully"
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to update term_deposit."
//         });
//     }
// };



// ❌ old dbModule
// const db = require('../utilities/dbModule');

exports.get = async(req, res) => {
    try {
        const { APPLICANT_ID } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        // 🏦 BANK DB
        const [rows] = await req.db
            .promise()
            .query(
                `SELECT * FROM term_deposite WHERE APPLICANT_ID = ?`, [APPLICANT_ID]
            );

        res.send({
            code: 200,
            message: 'OK',
            data: rows
        });

    } catch (error) {
        console.error('TERM DEPOSIT GET ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to get deposit details'
        });
    }
};

// -------------------------------

function reqData(req) {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        ACCOUNT_TYPE: req.body.ACCOUNT_TYPE,
        INITIAL_AMOUNT: req.body.INITIAL_AMOUNT,
        MODE_OF_PAYMENT: req.body.MODE_OF_PAYMENT,
        TRANSFER_ACCOUNT_NO: req.body.TRANSFER_ACCOUNT_NO,
        CHAQUE_NO: req.body.CHAQUE_NO,
        DRAWN_BANK: req.body.DRAWN_BANK,
        TRANSFER_DATE: req.body.TRANSFER_DATE,
        DEPOSIT_AMOUNT: req.body.DEPOSIT_AMOUNT,
        DEPOSIT_FREQUANCY: req.body.DEPOSIT_FREQUANCY,
        RATE_OF_INTEREST: req.body.RATE_OF_INTEREST,
        TANURE_YEARS: req.body.TANURE_YEARS,
        TANURE_MONTHS: req.body.TANURE_MONTHS,
        TANURE_DAYS: req.body.TANURE_DAYS,
        INTEREST_PAYOUT: req.body.INTEREST_PAYOUT,
        MODE_OF_INTEREST_PAYOUT: req.body.MODE_OF_INTEREST_PAYOUT,
        AUTO_RENEWAL: req.body.AUTO_RENEWAL,
        DEPOSIT_BANK_NAME: req.body.DEPOSIT_BANK_NAME,
        DEPOSIT_BRANCH_NAME: req.body.DEPOSIT_BRANCH_NAME,
        DEPOSIT_IFSC_CODE: req.body.DEPOSIT_IFSC_CODE,
        DEPOSIT_ACCOUNT_NUMBER: req.body.DEPOSIT_ACCOUNT_NUMBER,
        TDS: req.body.TDS,
        MATURITY_DATE: req.body.MATURITY_DATE,
        MATURITY_AMOUNT: req.body.MATURITY_AMOUNT,
        ACCOUNT_OPERATION: req.body.ACCOUNT_OPERATION,
        MOBILE_NUMBER_2: req.body.MOBILE_NUMBER_2,
        CHEQUE_BRANCH_NAME: req.body.CHEQUE_BRANCH_NAME,
        CHEQUE_BANK_NAME: req.body.CHEQUE_BANK_NAME,
        PAYMENT_INSTRUCTION: req.body.PAYMENT_INSTRUCTION,
        SCHEME_CODE: req.body.SCHEME_CODE
    };
}

// -------------------------------

// exports.create = async(req, res) => {
//     try {
//         const data = reqData(req);

//         await req.db
//             .promise()
//             .query(`INSERT INTO term_deposite SET ?`, data);

//         res.send({
//             code: 200,
//             message: 'Deposit information saved successfully'
//         });

//     } catch (error) {
//         console.error('TERM DEPOSIT CREATE ERROR:', error);
//         res.status(500).send({
//             code: 500,
//             message: 'Failed to save term deposit information'
//         });
//     }
// };


exports.create = async(req, res) => {
    try {
        const data = reqData(req);

        const [result] = await req.db
            .promise()
            .query(`INSERT INTO term_deposite SET ?`, data);

        // 🔥 IMPORTANT: send insertId back
        res.send({
            code: 200,
            message: 'Deposit information saved successfully',
            data: {
                ID: result.insertId
            }
        });

    } catch (error) {
        console.error('TERM DEPOSIT CREATE ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to save term deposit information'
        });
    }
};


// -------------------------------

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
                `UPDATE term_deposite SET ${setData} WHERE ID = ?`,
                values
            );

        res.send({
            code: 200,
            message: 'Term deposit information updated successfully'
        });

    } catch (error) {
        console.error('TERM DEPOSIT UPDATE ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to update term deposit'
        });
    }
};