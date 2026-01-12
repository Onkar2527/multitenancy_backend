const db = require('../utilities/dbModule')

exports.getState = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    try {
        const result = await db.executeQuery(`select distinct STATE from pincode_master where COUNTRY = 'India' order by STATE asc`, supportKey);
        res.send({
            "code": 200,
            "message": "success",
            "data": result
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed"
        });
    }
};

exports.getDistrict = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const q = `select distinct DISTRICT from pincode_master where 1 AND STATE = ? order by DISTRICT ASC`;
    try {
        const result = await db.executeQueryData(q, [req.body.filter], supportKey);
        res.send({
            "code": 200,
            "message": "success",
            "data": result
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed"
        });
    }
};

exports.getTaluka = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const q = `select distinct TALUKA from pincode_master where 1 AND DISTRICT = ? order by TALUKA asc`;
    try {
        const result = await db.executeQueryData(q, [req.body.filter], supportKey);
        res.send({
            "code": 200,
            "message": "success",
            "data": result
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed"
        });
    }
};

exports.getVillage = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const q = `select distinct VILLAGE from pincode_master where 1 AND TALUKA = ? order by VILLAGE asc`;
    try {
        const result = await db.executeQueryData(q, [req.body.filter], supportKey);
        res.send({
            "code": 200,
            "message": "success",
            "data": result
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed"
        });
    }
};
