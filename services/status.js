const db = require('../utilities/dbModule');

const status_table = 'track_master';

exports.getList = async (req, res) => {
    try {
        let filter = ' AND VISIBLE = 1';
        let supportKey = req.headers['supportkey'];

        let query = `select * from ${status_table} where 1 ${filter}`

        let result = await db.executeQuery(query, supportKey);

        res.send({
            "message": "success",
            "code": 200,
            "data": result
        })
    }
    catch (error) {
        console.log(error);
        res.send({
            "message": "Failed to get status",
            "code": 400
        })
    }

}
