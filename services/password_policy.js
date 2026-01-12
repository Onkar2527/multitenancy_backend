// const db = require('../utilities/dbModule')


// let reqBody = (req) => {
//     let data = {
//         FR_SMALL_LETTERS: req.body.FR_SMALL_LETTERS,
//         FR_CAPITAL_LETTERS: req.body.FR_CAPITAL_LETTERS,
//         FR_NUMBERS: req.body.FR_NUMBERS,
//         FR_SYMBOLS: req.body.FR_SYMBOLS,
//         PASSWORD_LENGTH: req.body.PASSWORD_LENGTH,
//         FR_PASSWORD_RESET: req.body.FR_PASSWORD_RESET,
//         UPDATE_DATE: req.body.UPDATE_DATE,
//     }

//     return data;
// }

// exports.get = async (req, res) => {
//     try {
//         let query = 'select * from password_policy';

//         let result = await db.executeQuery(query, "");
//         if (result.length > 0) {
//             res.send({
//                 "code": 200,
//                 "data": result[0]
//             })
//         }
//         else {
//             res.send({
//                 "code": 404,
//                 "message": "not found"
//             })
//         }

//     }
//     catch (error) {
//         console.log(error)
//         res.send({
//             "code": 200,
//             "error": error
//         })
//     }
// }

// exports.save = async (req, res) => {
//     try {

//         let updateData = reqBody(req);

//         const current_dt = new Date().toISOString().slice(0, 19).replace('T', ' ');

//         updateData.UPDATE_DATE = current_dt;

//         let query = 'update password_policy set ?';

//         await db.executeQueryData(query, updateData, "");

//         res.send({
//             "code": 200,
//             "message": "Updated"
//         })

//     }

//     catch (error) {
//         console.log(error)
//         res.send({
//             "code": 200,
//             "error": error
//         })
//     }
// }



const db = require('../utilities/dbModule');

exports.get = async(req, res) => {
    try {

        const query = `
            SELECT *
            FROM password_policy
            WHERE IS_ACTIVE = 1
            ORDER BY UPDATE_DATE DESC
            LIMIT 1
        `;

        const result = await db.executeMasterQuery(query, []);

        if (result && result.length > 0) {
            return res.send({
                code: 200,
                data: result[0]
            });
        } else {
            return res.send({
                code: 404,
                message: 'Password policy not found'
            });
        }

    } catch (error) {
        console.log('password_policy.get error:', error);
        return res.send({
            code: 500,
            message: 'Internal server error'
        });
    }
};

exports.save = async(req, res) => {
    try {

        const current_dt = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        const updateData = {
            FR_SMALL_LETTERS: req.body.FR_SMALL_LETTERS,
            FR_CAPITAL_LETTERS: req.body.FR_CAPITAL_LETTERS,
            FR_NUMBERS: req.body.FR_NUMBERS,
            FR_SYMBOLS: req.body.FR_SYMBOLS,
            PASSWORD_LENGTH: req.body.PASSWORD_LENGTH,
            FR_PASSWORD_RESET: req.body.FR_PASSWORD_RESET,
            UPDATE_DATE: current_dt
        };

        const query = `UPDATE password_policy SET ?`;

        await db.executeMasterQuery(query, updateData);

        return res.send({
            code: 200,
            message: 'Password policy updated successfully'
        });

    } catch (error) {
        console.log('password_policy.save error:', error);
        return res.send({
            code: 500,
            message: 'Internal server error'
        });
    }
};