const db = require('../utilities/dbModule')
const rsa = require('../RSA/rsa')


// exports.getTabs = async (req, res) => {
//     const { APPLICANT_ID } = req.body;
//     const supportKey = req.headers['supportkey'];
//     const q = `select * from view_tab_master where APPLICANT_ID = ? ORDER BY view_tab_master.INDEX`;

//     try {
//         const ResTabs = await db.executeQueryData(q, [APPLICANT_ID], supportKey);
//         res.send({
//             "code": 200,
//             "message": "ok",
//             "data": ResTabs
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to get tabs"
//         });
//     }
// };



exports.getTabs = async(req, res) => {
    try {
        const { APPLICANT_ID } = req.body;

        // 🔐 JWT middleware मधून
        const user = req.user;
        const dbConn = req.db;

        if (!user) {
            return res.status(401).send({
                code: 401,
                message: 'User context missing'
            });
        }

        if (!APPLICANT_ID) {
            return res.status(400).send({
                code: 400,
                message: 'APPLICANT_ID is required'
            });
        }

        const q = `
            SELECT *
            FROM view_tab_master
            WHERE APPLICANT_ID = ?
            ORDER BY view_tab_master.INDEX
        `;

        const [rows] = await dbConn.promise().query(q, [APPLICANT_ID]);

        return res.send({
            code: 200,
            message: 'ok',
            data: rows
        });

    } catch (error) {
        console.log('getTabs error:', error);
        return res.status(400).send({
            code: 400,
            message: 'Failed to get tabs'
        });
    }
};