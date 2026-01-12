// const db = require('../utilities/dbModule');

// const branch_master = 'branch_master';


// exports.get = async (req, res) => {
//     try {
//         let supportKey = req.headers['supportkey'];

//         let query = `select * from ${branch_master}`

//         let result = await db.executeQuery(query, supportKey);

//         res.send({
//             "message": "success",
//             "code": 200,
//             "data": result
//         })
//     }
//     catch (error) {
//         console.log(error)
//         res.send({
//             "message": "Failed to get branch",
//             "code": 400
//         })
//     }
// }




// ❌ OLD
// const db = require('../utilities/dbModule');

// const branch_master = 'branch_master';

// -------------------------------
// GET ALL BRANCHES (BANK DB)
// exports.get = async(req, res) => {
//     try {
//         // 🔐 JWT middleware already attached req.db
//         const [rows] = await req.db
//             .promise()
//             .query(`SELECT * FROM ${branch_master}`);

//         res.send({
//             code: 200,
//             message: 'success',
//             data: rows
//         });

//     } catch (error) {
//         console.error('GET BRANCH ERROR:', error);
//         res.status(500).send({
//             code: 500,
//             message: 'Failed to get branch'
//         });
//     }
// };




const db = require('../utilities/dbModule');

const branch_master = 'branch_master';

exports.get = async(req, res) => {
    try {
        // 🔐 JWT user context (optional validation)
        const user = req.user;

        if (!user || !user.BANK_ID) {
            return res.status(401).send({
                code: 401,
                message: 'User context missing'
            });
        }

        // ✅ MASTER DB QUERY (Bank-wise branch)
        const rows = await db.executeMasterQuery(
            `SELECT * FROM ${branch_master} WHERE BANK_ID = ?`, [user.BANK_ID]
        );

        res.send({
            code: 200,
            message: 'success',
            data: rows
        });

    } catch (error) {
        console.error('GET BRANCH ERROR:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to get branch'
        });
    }
};