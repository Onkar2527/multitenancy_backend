const db = require('../utilities/dbModule')

function reqData(req) {
    let data = {

        APPLICANT_ID : req.body.APPLICANT_ID,
        APPLICANT_NO : req.body.APPLICANT_NO,
        NAME_OF_BANK : req.body.NAME_OF_BANK,
        NAME_OF_BANK2: req.body.NAME_OF_BANK2,
        NAME_OF_BANK3: req.body.NAME_OF_BANK3,
        NAME_OF_BANK4: req.body.NAME_OF_BANK4,
        BRANCH_NAME: req.body.BRANCH_NAME,
        BRANCH_NAME2: req.body.BRANCH_NAME2,
        ACCOUNT_NO: req.body.ACCOUNT_NO,
        ACCOUNT_NO2: req.body.ACCOUNT_NO2,
        DEBIT_CARD: req.body.DEBIT_CARD,
        DEBIT_CARD2: req.body.DEBIT_CARD2

    }

    return data;
}




exports.get = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const q = `select * from other_bank_account where APPLICANT_ID = ?` + (req.body.APPLICANT_NO ? ' AND APPLICANT_NO = ?' : '');
    const params = [req.body.APPLICANT_ID];
    if (req.body.APPLICANT_NO) {
        params.push(req.body.APPLICANT_NO);
    }

    try {
        const results = await db.executeQueryData(q, params, supportKey);
        res.send({
            "code": 200,
            "message": "OK",
            "data": results
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to get other bank account information"
        });
    }
};

exports.create = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const data = reqData(req);
    const q = `insert into other_bank_account set ?`;

    try {
        await db.executeQueryData(q, data, supportKey);
        res.send({
            "code": 200,
            "message": "Other bank account saved successfully"
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to save other bank account information"
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

    const q = `update other_bank_account set ${setData} where ID = ?`;
    recData.push(req.body.ID);

    try {
        await db.executeQueryData(q, recData, supportKey);
        res.send({
            "code": 200,
            "message": "Other bank account information updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to update other bank account information"
        });
    }
};
