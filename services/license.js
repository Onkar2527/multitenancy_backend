const db = require('../utilities/dbModule');



function reqData(req) {
    data = {
        CLIENT_ID: req.body.CLIENT_ID,
        LICENSE_NUMBER: req.body.LICENSE_NUMBER,
        STATE: req.body.STATE,
        NAME: req.body.NAME,
        PERMANENT_ADDRESS: req.body.PERMANENT_ADDRESS,
        PERMANENT_ZIP: req.body.PERMANENT_ZIP,
        TEMPORARY_ADDRESS: req.body.TEMPORARY_ADDRESS,
        TEMPORARY_ZIP: req.body.TEMPORARY_ZIP,
        CITIZENSHIP: req.body.CITIZENSHIP,
        OLA_NAME: req.body.OLA_NAME,
        OLA_CODE: req.body.OLA_CODE,
        GENDER: req.body.GENDER,
        FATHER_OR_HUSBAND_NAME: req.body.FATHER_OR_HUSBAND_NAME,
        DOB: req.body.DOB,
        DOE: req.body.DOE,
        TRANSPORT_DOE: req.body.TRANSPORT_DOE,
        DOI: req.body.DOI,
        TRANSPORT_DOI: req.body.TRANSPORT_DOI,
        PROFILE_IMAGE: req.body.PROFILE_IMAGE,
        BLOOD_GROUP: req.body.BLOOD_GROUP,
        VEHICLE_CLASSES: req.body.VEHICLE_CLASSES,
        INITIAL_DOI: req.body.INITIAL_DOI
    }

    return data;
}

exports.get = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const q = `select * from license_verified_list where LICENSE_NUMBER = ?`;
    try {
        const results = await db.executeQueryData(q, [req.body.LICENSE_NUMBER], supportKey);
        res.send({
            "code": 200,
            "message": "OK",
            "data": results
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to get license verification info"
        });
    }
};

exports.create = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const data = reqData(req);
    const q = `insert into license_verified_list set ?`;

    try {
        await db.executeQueryData(q, data, supportKey);
        res.send({
            "code": 200,
            "message": "License information saved successfully"
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to save license info"
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

    const q = `update license_verified_list set ${setData} where ID = ?`;
    recData.push(req.body.ID);

    try {
        await db.executeQueryData(q, recData, supportKey);
        res.send({
            "code": 200,
            "message": "License information updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to update license info"
        });
    }
};
