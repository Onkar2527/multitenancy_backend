const mm = require('../utilities/dbModule');


const applicationkey = process.env.APPLICATION_KEY;

var addressInformation = "address_information";


exports.getAddress = async (req, res) => {
    const { pageIndex = '', pageSize = '', sortKey = 'ID', sortValue = 'DESC', filter = '' } = req.body;
    const supportKey = req.headers['supportkey'];

    let start = 0;
    let end = 0;

    if (pageIndex && pageSize) {
        start = (pageIndex - 1) * pageSize;
        end = pageSize;
    }

    const criteria = (pageIndex && pageSize)
        ? `${filter} order by ${sortKey} ${sortValue} LIMIT ${start},${end}`
        : `${filter} order by ${sortKey} ${sortValue}`;

    const countCriteria = filter;

    try {
        const [countResult, dataResult] = await Promise.all([
            mm.executeQuery(`select count(*) as cnt from pincode_master where 1 ${countCriteria}`, supportKey),
            mm.executeQuery(`select * from pincode_master where 1 ${criteria}`, supportKey)
        ]);

        res.send({
            "code": 200,
            "message": "success",
            "count": countResult[0].cnt,
            "data": dataResult
        });

    } catch (error) {
        console.log(error);
        logger.error(`${supportKey} ${req.method} ${req.url} ${JSON.stringify(error)}`, applicationkey);
        res.status(400).send({
            "code": 400,
            "message": "Failed to get address Information."
        });
    }
};
