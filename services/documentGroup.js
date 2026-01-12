const db = require('../utilities/dbModule');





exports.get = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    try {
        const result = await db.executeQuery(`select * from document_group_master where 1`, supportKey);
        res.send({
            "code": 200,
            "message": "ok",
            "data": result
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "failed to get documents document groups"
        });
    }
};
