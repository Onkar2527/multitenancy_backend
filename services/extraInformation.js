const db = require('../utilities/dbModule');
const rsa = require('../RSA/rsa')


// exports.update = async (req, res) => {
//     let dt = {
//         IS_CHECKED: req.body.IS_CHECKED,
//         IS_PROVIDED: req.body.IS_PROVIDED,
//         IS_VERIFIED: req.body.IS_VERIFIED,
//         SEND_TO_REFILL: req.body.SEND_TO_REFILL,
//         SEND_TO_REFILL_COUNT: req.body.SEND_TO_REFILL_COUNT,
//         CHECKER_REMARK: req.body.CHECKER_REMARK,
//         MAKER_REMARK: req.body.MAKER_REMARK,
//         VERIFIER_REMARK: req.body.VERIFIER_REMARK,
//         REFILL_BY: req.body.REFILL_BY
//     };
//     const supportKey = req.headers['supportkey'];
//     try {
//         await db.executeQueryData(`update extra_information set ? where ID = ?`, [dt, req.body.ID], supportKey);
//         res.send({
//             "code": 200,
//             "message": "extraInformation updated successfully",
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to update extraInformation"
//         });
//     }
// };


// exports.update = async(req, res) => {
//     try {
//         const user = req.user; // 🔐 JWT
//         const { ID } = req.body;

//         if (!ID) {
//             return res.status(400).send({
//                 code: 400,
//                 message: 'ExtraInformation ID required'
//             });
//         }

//         let dt = {
//             IS_CHECKED: req.body.IS_CHECKED,
//             IS_PROVIDED: req.body.IS_PROVIDED,
//             IS_VERIFIED: req.body.IS_VERIFIED,
//             SEND_TO_REFILL: req.body.SEND_TO_REFILL,
//             SEND_TO_REFILL_COUNT: req.body.SEND_TO_REFILL_COUNT
//         };

//         // 🔑 Role based remark & refill_by
//         if (user.ROLE_ID == 1) {
//             dt.MAKER_REMARK = req.body.MAKER_REMARK;
//         } else if (user.ROLE_ID == 2) {
//             dt.CHECKER_REMARK = req.body.CHECKER_REMARK;
//         } else if (user.ROLE_ID == 3) {
//             dt.VERIFIER_REMARK = req.body.VERIFIER_REMARK;
//             dt.REFILL_BY = user.USER_ID;
//         }

//         await req.db.promise().query(
//             `UPDATE extra_information SET ? WHERE ID = ?`, [dt, ID]
//         );

//         res.send({
//             code: 200,
//             message: 'Extra information updated successfully'
//         });

//     } catch (error) {
//         console.log('extraInformation update error:', error);
//         res.status(400).send({
//             code: 400,
//             message: 'Failed to update extraInformation'
//         });
//     }
// };


exports.update = async(req, res) => {
    try {
        const dt = {
            IS_CHECKED: req.body.IS_CHECKED,
            IS_PROVIDED: req.body.IS_PROVIDED,
            IS_VERIFIED: req.body.IS_VERIFIED,
            SEND_TO_REFILL: req.body.SEND_TO_REFILL,
            SEND_TO_REFILL_COUNT: req.body.SEND_TO_REFILL_COUNT,
            CHECKER_REMARK: req.body.CHECKER_REMARK,
            MAKER_REMARK: req.body.MAKER_REMARK,
            VERIFIER_REMARK: req.body.VERIFIER_REMARK,
            REFILL_BY: req.body.REFILL_BY
        };

        console.log('🔵 UPDATE TAB PAYLOAD:', dt);
        console.log('🟡 UPDATE TAB ID:', req.body.ID);

        const [result] = await req.db
            .promise()
            .query(
                `UPDATE extra_information SET ? WHERE ID = ?`, [dt, req.body.ID]
            );

        console.log('🟢 UPDATE RESULT:', result);

        res.send({
            code: 200,
            message: 'extraInformation updated successfully'
        });

    } catch (error) {
        console.log('❌ UPDATE TAB ERROR:', error);
        res.status(400).send({
            code: 400,
            message: 'Failed to update extraInformation'
        });
    }
};