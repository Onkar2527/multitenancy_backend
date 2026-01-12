const db = require('../utilities/dbModule');



function reqData(req)
{
    data = {
            APPLICANT_FULL_NAME : req.body.APPLICANT_FULL_NAME,
            APPLICANT_NO : req.body.APPLICANT_NO,
            APPLICANT_ID : req.body.APPLICANT_ID,
            PAN_NUMBER : req.body.PAN_NUMBER,
            IS_VERIFIED : req.body.IS_VERIFIED,
          CATEGORY : req.body.CATEGORY,

           
    }

    return data;
}

exports.get = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const q = `select * from pan_verified_list where PAN_NUMBER = ?`;
    try {
        const results = await db.executeQueryData(q, [req.body.PAN_NUMBER], supportKey);
        res.send({
            "code": 200,
            "message": "OK",
            "data": results
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to get pan verification info"
        });
    }
};

exports.create = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const data = reqData(req);
    const q = `insert into pan_verified_list set ?`;

    try {
        await db.executeQueryData(q, data, supportKey);
        res.send({
            "code": 200,
            "message": "PAN information saved successfully"
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to save PAN info"
        });
    }
};

exports.update = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const data = reqData(req);
    let setData = '';
    let recData = [];

    Object.keys(data).forEach(key => {
        setData += `${key} = ? ,`;
        recData.push(data[key]);
    });

    setData = setData.slice(0, -1);

    const q = `update pan_verified_list set ${setData} where ID = ?`;
    recData.push(req.body.ID);

    try {
        await db.executeQueryData(q, recData, supportKey);
        res.send({
            "code": 200,
            "message": "PAN information updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to update PAN info"
        });
    }
};
