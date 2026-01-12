const db = require("../../utilities/dbModule")

const table = `doc_verify_rates`

exports.getRates = async (req, res) => {
    try {
        let getRateQ = `select * from ${table}`;

        let getRateR = await db.executeQuery(getRateQ, "");

        res.send({
            "code": 200,
            "data": getRateR
        })
    }
    catch (error) {
        console.log(error);
        res.send({
            "code": 400,
            "message": "Internal Error",
            "error": error
        })
    }

}

exports.setRate = async (req, res) => {
    try {
        let ID = req.body.ID;
        let RATE = req.body.RATE;

        let updateRateQ = `update ${table} set RATE = ${RATE} where ID = ${ID}`;

        await db.executeQuery(updateRateQ, "");

        res.send({
            "code": 200,
            "message": "updated"
        })
    }
    catch (error) {
        console.log(error)
        res.send({
            "code": 400,
            "message": "Internal Error",
            "error": error
        })
    }
}
