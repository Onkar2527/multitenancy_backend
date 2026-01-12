const db = require('../utilities/dbModule');

function reqData(req){
    data = {

        DOCUMENT_GROUP_ID : req.body.DOCUMENT_GROUP_ID,
        DOCUMENT_NAME : req.body.DOCUMENT_NAME
        
    }
    return data;
}

exports.get = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    try {
        const result = await db.executeQuery(`select * from document_master where 1`, supportKey);
        res.send({
            "code": 200,
            "message": "ok",
            "data": result
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "failed to get documents"
        });
    }
};

exports.create = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const data = reqData(req);
    try {
        await db.executeQueryData(`insert into document_master set ?`, data, supportKey);
        res.send({
            "code": 200,
            "message": "Document record inserted successfully."
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to insert document record"
        });
    }
};
