const db = require('.././utilities/dbModule');
const rsa = require('../RSA/rsa')


// exports.getComponunts = async (req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const ROLE_ID = req.body.ROLE_ID;
//     const q = `select * from component_master where ROLE_ID = ? ORDER BY SEQ`;

//     try {
//         const componentData = await db.executeQueryData(q, [ROLE_ID], supportKey);
//         res.send({
//             "code": 200,
//             "message": "ok",
//             "data": componentData
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to get component details."
//         });
//     }
// };




// exports.getComponunts = async(req, res) => {
//     try {
//         const ROLE_ID = req.user.ROLE_ID; // 🔑 JWT मधून

//         const q = `
//             SELECT *
//             FROM component_master
//             WHERE ROLE_ID = ?
//             ORDER BY SEQ
//         `;

//         const componentData = await db.executeMasterQuery(q, [ROLE_ID]);

//         res.send({
//             code: 200,
//             message: "ok",
//             data: componentData
//         });
//     } catch (error) {
//         console.log("component error =>", error);
//         res.status(400).send({
//             code: 400,
//             message: "Failed to get component details."
//         });
//     }
// };


exports.getComponunts = async(req, res) => {

    try {
        const ROLE_ID = req.user.ROLE_ID; // 🔐 JWT मधून
        const q = `
            SELECT *
            FROM component_master
            WHERE ROLE_ID = ?
            ORDER BY SEQ
        `;

        const [rows] = await req.db.promise().query(q, [ROLE_ID]);

        res.send({
            code: 200,
            message: 'ok',
            data: rows
        });

    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            message: 'Failed to get component details'
        });
    }
};