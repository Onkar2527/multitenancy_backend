
const db = require('../utilities/dbModule');

function reqData(req) {
    const data = {
        AADHAAR_NUMBER: req.body.AADHAAR_NUMBER,
        APPLICANT_ID: req.body.APPLICANT_ID,
        APPLICANT_NO: req.body.APPLICANT_NO,
        ADDRESS_ID: req.body.ADDRESS_ID,

        DOB: req.body.DOB,
        APPLICANT_FULL_NAME: req.body.APPLICANT_FULL_NAME,
        GENDER: req.body.GENDER,
        PROFILE_IMAGE: req.body.PROFILE_IMAGE,
        IS_VERIFIED: req.body.IS_VERIFIED ? 1 : 0
    }
    return data
}


exports.create = async (req, res) => {
    let data = reqData(req)
    let supportKey = req.headers['supportKey']
    var setData = "";
    var recordData = [];

    Object.keys(data).forEach(key => {
        setData += `${key} ,`;
        recordData.push(data[key]);
    });


    console.log("data from req", data);


    try {
        const results = await db.executeQueryData(`insert into aadhaar_address set ?`, data.ADDRESS_ID, supportKey);
        data.ADDRESS_ID = results.insertId;
        console.log("insertid", results);
        console.log("data at the end", data);

        await db.executeQueryData(`insert into aadhaar_verified_list set ?`, data, supportKey);

        res.send({
            "code": 200,
            "message": "Aadhaar information saved successfully"
        })
    }

    catch (error) {
        console.log("error", error);
        res.send({
            "code": 400,
            "message": "failed"
        })
    }

}

exports.get = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    let q = ``;
    if (req.body.AADHAAR_NUMBER) {
        q = `select * from aadhaar_verified_list where APPLICANT_NO = ${req.body.APPLICANT_NO} AND AADHAAR_NUMBER = ${req.body.AADHAAR_NUMBER} `;
    } else {
        q = `select * from aadhaar_verified_list where 0`;
    }

    try {
        const results = await db.executeQuery(q, supportKey);
        if (results.length > 0) {
            const resultAdress = await db.executeQuery(`select * from aadhaar_address where ID = ${results[0].ADDRESS_ID}`, supportKey);
            results[0].ADDRESS_ID = resultAdress;
            res.send({
                "code": 200,
                "message": "OK",
                "data": results
            });
        } else {
            res.status(400).send({
                "code": 400,
                "message": "Something went wrong"
            });
        }
    } catch (error) {
        console.log("err", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to get Aadhaar details"
        });
    }
};

exports.update = async (req, res) => {
    let data = reqData(req)
    let ID = req.body.ID;
    let supportKey = req.headers['supportKey']
    var setData = "";
    var recordData = [];


    Object.keys(data).forEach(key => {
        setData += `${key} ,`;
        recordData.push(data[key]);
    });

    let address_result;

    try {
        if (!data.ADDRESS_ID[0].ID) {
            address_result = await db.executeQueryData(`insert into aadhaar_address set ?`, data.ADDRESS_ID, supportKey);
            data.ADDRESS_ID = address_result.insertId;
        }
        else {
            await db.executeQueryData(`update aadhaar_address set ? where ID = ?`, [data.ADDRESS_ID[0], data.ADDRESS_ID[0].ID], supportKey);
            data.ADDRESS_ID = data.ADDRESS_ID[0].ID;
        }

        await db.executeQueryData(`update aadhaar_verified_list set ? where ID = ?`, [data, ID], supportKey);


        res.send({
            "code": 200
        })
    }
    catch (error) {
        console.log(error);
        res.send({
            "code": 400,
            "message": "Failed to update aadhaar info"
        })
    }

}
