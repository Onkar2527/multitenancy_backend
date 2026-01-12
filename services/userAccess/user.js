const db = require('../../utilities/dbModule');
const jwt = require('jsonwebtoken');

var userMaster = 'user_master';
var viewUserMaster = 'view_' + userMaster

// exports.login = async (req, res) => {
//     try {
//         const { USER_NAME: username, PASSWORD: password } = req.body;
//         const supportKey = req.headers['supportkey'];

//         if (!username || !password) {
//             return res.status(400).send({
//                 "code": 400,
//                 "message": "Username or password parameter missing",
//             });
//         }

//         const results1 = await db.executeQueryData(`SELECT * FROM user_master WHERE BINARY USER_NAME = ? AND BINARY PASSWORD = ?`, [username, password], supportKey);

//         if (results1.length === 1) {
//             const current_dt = new Date().toISOString().slice(0, 19).replace('T', ' ');
//             const query = `UPDATE user_master SET LAST_LOGIN_TIME = '${current_dt}' WHERE ID = ${results1[0].ID}`;
//             await db.executeQuery(query, '');

//             const getDaysQ = `SELECT TIMESTAMPDIFF(DAY, '${results1[0].PASSWORD_RESET_DATE}', '${current_dt}') AS DAYS`;
//             const numDateR = await db.executeQuery(getDaysQ, '');
//             const numDate = (numDateR.length > 0) ? (numDateR[0]['DAYS'] || 0) : 0;

//             const send_data = {
//                 ID: results1[0].ID,
//                 ROLE_ID: results1[0].ROLE_ID,
//                 BRANCH_ID: results1[0].BRANCH_ID,
//                 NAME: results1[0].NAME,
//                 USER_NAME: results1[0].USER_NAME,
//                 LAST_LOGIN_TIME: current_dt,
//                 PASSWORD_RESET_DATE: results1[0].PASSWORD_RESET_DATE,
//                 DAYS_OF_RESET_PASS: numDate
//             };

//             res.send({ "code": 200, "data": send_data });
//         } else if (results1.length > 1) {
//             res.status(400).send({ "code": 400, "message": "More than one user." });
//         } else {
//             res.status(404).send({ "code": 404, "message": "Username OR Password does not exist" });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({ "code": 500, "message": "Internal server error" });
//     }
// };



// exports.login = async(req, res) => {
//     try {
//         const { USER_NAME: username, PASSWORD: password } = req.body;
//         const supportKey = req.headers['supportkey'];

//         if (!username || !password) {
//             return res.status(400).send({
//                 code: 400,
//                 message: "Username or password parameter missing",
//             });
//         }

//         const results1 = await db.executeMasterQuery(
//             `SELECT * FROM user_master 
//              WHERE BINARY USER_NAME = ? AND BINARY PASSWORD = ?`, [username, password],
//             supportKey
//         );

//         if (results1.length === 1) {

//             const current_dt = new Date().toISOString().slice(0, 19).replace('T', ' ');

//             await db.executeQuery(
//                 `UPDATE user_master 
//                  SET LAST_LOGIN_TIME = '${current_dt}' 
//                  WHERE ID = ${results1[0].ID}`,
//                 ''
//             );

//             const getDaysQ = `
//                 SELECT TIMESTAMPDIFF(
//                     DAY,
//                     '${results1[0].PASSWORD_RESET_DATE}',
//                     '${current_dt}'
//                 ) AS DAYS
//             `;

//             const numDateR = await db.executeQuery(getDaysQ, '');
//             // const numDate = numDateR ? .[0] ? .DAYS || 0;
//             const numDate =
//                 (numDateR && numDateR.length > 0 && numDateR[0].DAYS) ?
//                 numDateR[0].DAYS :
//                 0;


//             const send_data = {
//                 ID: results1[0].ID,
//                 ROLE_ID: results1[0].ROLE_ID,
//                 BRANCH_ID: results1[0].BRANCH_ID,
//                 NAME: results1[0].NAME,
//                 USER_NAME: results1[0].USER_NAME,
//                 LAST_LOGIN_TIME: current_dt,
//                 PASSWORD_RESET_DATE: results1[0].PASSWORD_RESET_DATE,
//                 DAYS_OF_RESET_PASS: numDate
//             };

//             // 🔐 JWT PAYLOAD (user wise)
//             const tokenPayload = {
//                 USER_ID: results1[0].ID,
//                 ROLE_ID: results1[0].ROLE_ID
//             };

//             // 🔐 JWT GENERATE
//             const token = jwt.sign(
//                 tokenPayload,
//                 process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1m' }
//             );

//             // ✅ FINAL RESPONSE (TOKEN + DATA)
//             return res.send({
//                 code: 200,
//                 token: token,
//                 data: send_data
//             });

//         } else if (results1.length > 1) {
//             return res.status(400).send({
//                 code: 400,
//                 message: "More than one user."
//             });
//         } else {
//             return res.status(404).send({
//                 code: 404,
//                 message: "Username OR Password does not exist"
//             });
//         }

//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             code: 500,
//             message: "Internal server error"
//         });
//     }
// };

// const jwt = require('jsonwebtoken');

// exports.login = async(req, res) => {
//     try {
//         const { USER_NAME: username, PASSWORD: password } = req.body;

//         if (!username || !password) {
//             return res.status(400).send({
//                 code: 400,
//                 message: "Username or password parameter missing",
//             });
//         }

//         // ✅ 1. LOGIN FROM MASTER DB
//         const users = await db.executeMasterQuery(
//             `SELECT * FROM user_master 
//        WHERE BINARY USER_NAME = ? 
//        AND BINARY PASSWORD = ? 
//        AND IS_ACTIVE = 1`, [username, password]
//         );

//         if (users.length !== 1) {
//             return res.status(404).send({
//                 code: 404,
//                 message: "Username OR Password does not exist"
//             });
//         }

//         const user = users[0];

//         // ✅ 2. UPDATE LAST LOGIN (MASTER DB)
//         const current_dt = new Date()
//             .toISOString()
//             .slice(0, 19)
//             .replace('T', ' ');

//         await db.executeMasterQuery(
//             `UPDATE user_master 
//        SET LAST_LOGIN_TIME = ? 
//        WHERE ID = ?`, [current_dt, user.ID]
//         );

//         // ✅ 3. PASSWORD AGE CHECK (MASTER DB)
//         let days = 0;
//         if (user.PASSWORD_RESET_DATE) {
//             const diff = await db.executeMasterQuery(
//                 `SELECT TIMESTAMPDIFF(
//             DAY,
//             ?,
//             ?
//          ) AS DAYS`, [user.PASSWORD_RESET_DATE, current_dt]
//             );
//             // days = diff[0] ? .DAYS || 0;
//             const days = (diff && diff.length > 0 && diff[0].DAYS) ? diff[0].DAYS : 0;

//         }

//         // ✅ 4. RESPONSE DATA
//         const send_data = {
//             ID: user.ID,
//             BANK_ID: user.BANK_ID,
//             ROLE_ID: user.ROLE_ID,
//             BRANCH_ID: user.BRANCH_ID,
//             NAME: user.NAME,
//             USER_NAME: user.USER_NAME,
//             LAST_LOGIN_TIME: current_dt,
//             PASSWORD_RESET_DATE: user.PASSWORD_RESET_DATE,
//             DAYS_OF_RESET_PASS: days
//         };

//         // 🔐 5. JWT PAYLOAD (VERY IMPORTANT)
//         const tokenPayload = {
//             USER_ID: user.ID,
//             BANK_ID: user.BANK_ID,
//             ROLE_ID: user.ROLE_ID
//         };

//         // 🔐 6. JWT GENERATION
//         const token = jwt.sign(
//             tokenPayload,
//             process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
//         );

//         // ✅ 7. FINAL RESPONSE
//         return res.send({
//             code: 200,
//             token,
//             data: send_data
//         });

//     } catch (error) {
//         console.error('LOGIN ERROR:', error);
//         return res.status(500).send({
//             code: 500,
//             message: "Internal server error"
//         });
//     }
// };


exports.login = async(req, res) => {
    try {
        const { USER_NAME: username, PASSWORD: password } = req.body;

        // ❌ Validation
        if (!username || !password) {
            return res.status(400).send({
                code: 400,
                message: "Username or password parameter missing"
            });
        }

        // ✅ 1. LOGIN FROM MASTER DB
        const users = await db.executeMasterQuery(
            `
            SELECT *
            FROM user_master
            WHERE BINARY USER_NAME = ?
              AND BINARY PASSWORD = ?
              AND IS_ACTIVE = 1
            `, [username, password]
        );

        if (users.length !== 1) {
            return res.status(404).send({
                code: 404,
                message: "Username OR Password does not exist"
            });
        }

        const user = users[0];

        // ✅ 2. UPDATE LAST LOGIN (MASTER DB)
        const current_dt = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        await db.executeMasterQuery(
            `
            UPDATE user_master
            SET LAST_LOGIN_TIME = ?
            WHERE ID = ?
            `, [current_dt, user.ID]
        );

        // ✅ 3. PASSWORD AGE CHECK
        let days = 0;

        if (user.PASSWORD_RESET_DATE) {
            const diff = await db.executeMasterQuery(
                `
                SELECT TIMESTAMPDIFF(
                    DAY,
                    ?,
                    ?
                ) AS DAYS
                `, [user.PASSWORD_RESET_DATE, current_dt]
            );

            days =
                diff &&
                diff.length > 0 &&
                diff[0].DAYS !== null ?
                diff[0].DAYS :
                0;
        }

        // ✅ 4. RESPONSE DATA (Frontend use)
        const send_data = {
            ID: user.ID,
            BANK_ID: user.BANK_ID,
            ROLE_ID: user.ROLE_ID,
            BRANCH_ID: user.BRANCH_ID,
            NAME: user.NAME,
            USER_NAME: user.USER_NAME,
            LAST_LOGIN_TIME: current_dt,
            PASSWORD_RESET_DATE: user.PASSWORD_RESET_DATE,
            DAYS_OF_RESET_PASS: days
        };

        // 🔐 5. JWT PAYLOAD (🔥 MOST IMPORTANT FIX 🔥)
        const tokenPayload = {
            USER_ID: user.ID,
            BANK_ID: user.BANK_ID,
            ROLE_ID: user.ROLE_ID,
            BRANCH_ID: user.BRANCH_ID
        };

        // 🔐 6. JWT GENERATE
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        // ✅ 7. FINAL RESPONSE
        return res.send({
            code: 200,
            token,
            data: send_data
        });

    } catch (error) {
        console.error('LOGIN ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal server error"
        });
    }
};



exports.getUser = async(req, res) => {
    try {
        let BRANCH_ID = req.body.BRANCH_ID;
        let ROLE_ID = req.body.ROLE_ID;
        let USER_ID = req.body.ID;

        let supportKey = req.headers['supportkey'];
        let query = ` select * from user_master where 1`

        if (BRANCH_ID) {
            query += ` AND BRANCH_ID = ${BRANCH_ID} `
        }
        if (ROLE_ID) {
            query += ` AND ROLE_ID = ${ROLE_ID}`
        }
        if (USER_ID) {
            query += ` AND ID = ${USER_ID}`
        }

        let result = await db.executeQuery(query, supportKey);

        console.log(query, result);

        res.send({
            "message": "success",
            "code": 200,
            "data": result
        })
    } catch (error) {
        console.log(error);
        res.send({
            "message": "Failed to get user details",
            "code": 400
        })
    }

}

// exports.getUserBranch = async(req, res) => {
//     try {
//         let supportKey = req.headers['supportkey'];
//         let BRANCH_ID = req.body.BRANCH_ID;
//         let query = `select * from branch_master where ID = ${BRANCH_ID}`

//         let result = await db.executeQuery(query, supportKey);

//         res.send({
//             "message": "success",
//             "code": 200,
//             "data": result
//         })
//     } catch (error) {
//         console.log(error)
//         res.send({
//             "message": "Failed to get user's branch",
//             "code": 400
//         })
//     }

// }

// exports.getUserRole = async(req, res) => {

//     try {
//         let supportKey = req.headers['supportkey'];
//         let ROLE_ID = req.body.ROLE_ID;

//         let query = `select * from role_master where ID = ${ROLE_ID}`

//         let result = await db.executeQuery(query, supportKey);

//         res.send({
//             "message": "success",
//             "code": 200,
//             "data": result
//         })
//     } catch (error) {
//         console.log(error)
//         res.send({
//             "message": "Failed to get user's role",
//             "code": 400
//         })
//     }

// }



exports.getUserBranch = async(req, res) => {
    try {
        const BRANCH_ID = req.user.BRANCH_ID; // 🔐 JWT मधून
        const query = `SELECT * FROM branch_master WHERE ID = ?`;

        const [result] = await req.db.promise().query(query, [BRANCH_ID]);

        return res.send({
            code: 200,
            message: "success",
            data: result ? [result] : []
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            code: 400,
            message: "Failed to get user's branch"
        });
    }
};


exports.getUserRole = async(req, res) => {
    try {
        const ROLE_ID = req.user.ROLE_ID; // 🔐 JWT मधून
        const query = `SELECT * FROM role_master WHERE ID = ?`;

        const [result] = await req.db.promise().query(query, [ROLE_ID]);

        return res.send({
            code: 200,
            message: "success",
            data: result ? [result] : []
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            code: 400,
            message: "Failed to get user's role"
        });
    }
};




exports.resetPassword = async(req, res) => {
    try {
        let username = req.body.username;
        let oldpass = req.body.oldpass;
        let newpass = req.body.newpass;

        const current_dt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        let selectQ = `SELECT * FROM user_master WHERE BINARY USER_NAME = ? and BINARY PASSWORD = ?`;

        let result = await db.executeQueryData(selectQ, [username, oldpass], "");

        if (result.length > 0) {
            let user_id = result[0].ID;

            let updatePassQ = `update user_master set PASSWORD = ?, PASSWORD_RESET_DATE = ? where ID = ?`

            await db.executeQueryData(updatePassQ, [newpass, current_dt, user_id]);

            res.send({
                "code": 200,
                "message": "success"
            })

        } else {
            res.send({
                "code": 404,
                "error": "No user found"
            })
        }
    } catch (error) {
        console.log(error);
        res.send({
            "code": 400,
            "error": error
        })
    }
}