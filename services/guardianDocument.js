const db = require('../utilities/dbModule')
const fs = require('fs');
const path = require('path');
const async = require('async');

function reqData(req) {
    data = {
        APPLICANT_ID: req.body.APPLICANT_ID,
     APPLICANT_NO: req.body.APPLICANT_NO,
        DOCUMENT_NAME: req.body.DOCUMENT_NAME,
        FILE_TYPE: req.body.FILE_TYPE,
        CHECKER_REMARK: req.body.CHECKER_REMARK,
        MAKER_REMARK: req.body.MAKER_REMARK,
        VERIFIER_REMARK: req.body.VERIFIER_REMARK,
        IS_APPROVED_CHECKER: req.body.IS_APPROVED_CHECKER ? 1 : 0,
        IS_APPROVED_VERIFIER: req.body.IS_APPROVED_VERIFIER ? 1 : 0,
        REFILL_COUNT: req.body.REFILL_COUNT

    }

    return data
}

// exports.get = (req, res) =>{
//     const supportKey = req.headers['supportkey'];
//     let data = reqData(req);

//     db.executeQueryData(`select * from guardian_documents where 1 AND guardian_ID = ?`+ (req.body.guardian_NO ? `guardian_NO = ${req.body.guardian_NO}`: ''), [data.guardian_ID], supportKey, (error, guardianDocumentsRes)=>{
//         if(error)
//         {
//             console.log("error", error);
//             res.send({
//                 "code": 400,
//                 "message": "Failed to get document details."
//             })
//         }
//         else{
//             res.send({
//                 "code": 200,
//                 "message": "ok",
//                 "data": guardianDocumentsRes
//             })
//         }
//     })
// }

exports.getAllguardians = (req, res) => {
    const supportKey = req.headers['supportkey']
    let resultsArray = [];

    db.executeQueryData(`select * from guardian_documents where APPLICANT_ID = ? ` + (req.body.APPLICANT_NO ? `AND APPLICANT_NO = ? ` : ``), [req.body.APPLICANT_ID, req.body.APPLICANT_NO], supportKey, (error, guardiansDocResult) => {
        if (error) {
            console.log("error", error);
            res.send({
                "code": 400,
                "message": "failed to get applicats document information"
            })

        }
        else {
            console.log("appPhoto", guardiansDocResult);

            if (guardiansDocResult.length > 0) {


                async.eachSeries(guardiansDocResult, function itrateOverAllguardian(guardian, callback) {
                    if (guardian.FILE_LINK != null && guardian.FILE_LINK != undefined && guardian.FILE_LINK != '') {
                        try {
                            guardian.IMAGE_DATA = fs.readFileSync(guardian.FILE_LINK, { encoding: "utf-8" });
                        }
                        catch (error) {
                            console.log(error);
                            guardian.IMAGE_DATA = ""
                        }

                        resultsArray.push(guardian)
                        callback();
                    }
                    else {
                        resultsArray.push(guardian)
                        callback()
                    }
                },
                    function resultFunction(error) {
                        if (error) {
                            console.log("error async", error);
                        }
                        else {
                            res.send({
                                "code": 200,
                                "data": resultsArray
                            })
                        }


                    })

            }
            else {
                console.log("applican record doent exist");
                res.send({
                    "code": 200,
                    "data": []
                })
            }

        }
    })
}


exports.create = (req, res) => {
    const supportKey = req.headers['supportkey'];
    let data = reqData(req);


    db.executeQueryData(`insert into guardian_documents set ?`, data, supportKey, (error, documentInsertResult) => {
        if (error) {
            console.log("error", error);
            res.send({
                "code": 400,
                "message": "Failed to insert document details."
            })
        }
        else {
            res.send({
                "code": 200,
                "message": "Document details saved successfully"
            })
        }
    })

}

exports.update = (req, res) => {
    const supportKey = req.headers['supportkey']
    let data = reqData(req);
    let setData = ''
    let recData = []

    Object.keys(data).forEach(key => {
        setData += `${key} = ? ,`;
        recData.push(data[key])
    })

    setData = setData.slice(0, -1);
    db.executeQueryData(`update guardian_documents set ${setData} where ID = ${req.body.ID}`, recData, supportKey, (error) => {
        if (error) {
            console.log("error", error);
            res.send({
                "code": 400,
                "message": "Failed to update guardian information."
            })
        }
        else {
            res.send({
                "code": 200,
                "message": "information saved successful."
            })
        }
    })
}



exports.uploadDocument = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    let connection;
    try {
        connection = await db.openConnection();
        const [guardianDocumentRes] = await db.executeQueryDataAsyncAwait(`select * from guardian_documents where 1 AND ID = ?`, [req.body.ID], supportKey);

        if (guardianDocumentRes.length === 0) {
            return res.status(404).send({
                "code": 404,
                "message": "Unable to find document"
            });
        }

        let filePath = guardianDocumentRes[0].FILE_LINK;
        if (!filePath) {
            filePath = './uploads/guardianDocuments/' + genrateRandomKey(32) + '.' + 'jpg';
        }

        await fs.promises.writeFile(filePath, req.body.IMAGE_DATA, { flag: 'w' });

        const updateQuery = `update guardian_documents set APPLICANT_ID=?, APPLICANT_NO=?, DOCUMENT_NAME=?, FILE_TYPE=?, FILE_LINK=?, MAKER_REMARK=?, IS_APPROVED_CHECKER = ?, IS_APPROVED_VERIFIER = ? where ID = ?`;
        const updateParams = [req.body.APPLICANT_ID, req.body.APPLICANT_NO, req.body.DOCUMENT_NAME, req.body.FILE_TYPE, filePath, req.body.MAKER_REMARK, req.body.IS_APPROVED_CHECKER, req.body.IS_APPROVED_VERIFIER, req.body.ID];
        await db.executeQueryDataAsyncAwait(updateQuery, updateParams, supportKey);

        await db.commitConnection(connection);
        res.send({
            "code": 200,
            "message": "Document details saved successfully"
        });

    } catch (error) {
        console.log("Error in uploadDocument:", error);
        if (connection) {
            await db.rollbackConnection(connection);
        }
        res.status(400).send({
            "code": 400,
            "message": "Failed to save document."
        });
    }
}


function genrateRandomKey(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$-#@&';
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;


}
