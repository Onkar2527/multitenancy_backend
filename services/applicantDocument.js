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

//     db.executeQueryData(`select * from applicant_documents where 1 AND APPLICANT_ID = ?`+ (req.body.APPLICANT_NO ? `APPLICANT_NO = ${req.body.APPLICANT_NO}`: ''), [data.APPLICANT_ID], supportKey, (error, applicantDocumentsRes)=>{
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
//                 "data": applicantDocumentsRes
//             })
//         }
//     })
// }

exports.getAllApplicants = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const { APPLICANT_ID, APPLICANT_NO } = req.body;
    
    let query = `select * from applicant_documents where APPLICANT_ID = ? `;
    const params = [APPLICANT_ID];

    if (APPLICANT_NO) {
        query += `AND APPLICANT_NO = ? `;
        params.push(APPLICANT_NO);
    }

    try {
        const applicantsDocResult = await db.executeQueryData(query, params, supportKey);

        if (applicantsDocResult.length > 0) {
            const resultsArray = await Promise.all(applicantsDocResult.map(async (applicant) => {
                if (applicant.FILE_LINK) {
                    try {
                        applicant.IMAGE_DATA = await fs.promises.readFile(applicant.FILE_LINK, { encoding: "utf-8" });
                    } catch (error) {
                        console.log(error);
                        applicant.IMAGE_DATA = "";
                    }
                }
                return applicant;
            }));
            res.send({ "code": 200, "data": resultsArray });
        } else {
            console.log("applicant record doesn't exist");
            res.send({ "code": 200, "data": [] });
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "failed to get applicant document information"
        });
    }
};


exports.create = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    let data = reqData(req);

    try {
        await db.executeQueryData(`insert into applicant_documents set ?`, data, supportKey);
        res.send({
            "code": 200,
            "message": "Document details saved successfully"
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to insert document details."
        });
    }
};

exports.update = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    let data = reqData(req);
    let setData = '';
    let recData = [];

    Object.keys(data).forEach(key => {
        setData += `${key} = ? ,`;
        recData.push(data[key]);
    });

    setData = setData.slice(0, -1);
    const query = `update applicant_documents set ${setData} where ID = ?`;
    recData.push(req.body.ID);

    try {
        await db.executeQueryData(query, recData, supportKey);
        res.send({
            "code": 200,
            "message": "Information saved successfully."
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to update applicant information."
        });
    }
};



exports.uploadDocument = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    let connection;
    try {
        connection = await db.openConnection();
        const applicantDocumentRes = await db.executeQueryData(`select * from applicant_documents where 1 AND ID = ?`, [req.body.ID], supportKey);

        if (applicantDocumentRes.length === 0) {
            return res.status(404).send({
                "code": 404,
                "message": "Unable to find document"
            });
        }

        let filePath = applicantDocumentRes[0].FILE_LINK;
        if (!filePath) {
            filePath = './uploads/applicantDocuments/' + genrateRandomKey(32) + '.' + 'jpg';
        }

        await fs.promises.writeFile(filePath, req.body.IMAGE_DATA, { flag: 'w' });

        const updateQuery = `update applicant_documents set APPLICANT_ID=?, APPLICANT_NO=?, DOCUMENT_NAME=?, FILE_TYPE=?, FILE_LINK=?, MAKER_REMARK=?, IS_APPROVED_CHECKER = ?, IS_APPROVED_VERIFIER = ? where ID = ?`;
        const updateParams = [req.body.APPLICANT_ID, req.body.APPLICANT_NO, req.body.DOCUMENT_NAME, req.body.FILE_TYPE, filePath, req.body.MAKER_REMARK, req.body.IS_APPROVED_CHECKER, req.body.IS_APPROVED_VERIFIER, req.body.ID];
        await db.executeQueryData(updateQuery, updateParams, supportKey);

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
