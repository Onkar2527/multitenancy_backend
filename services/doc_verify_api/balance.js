const db = require("../../utilities/dbModule")

const table = `amount_remaining`;

exports.checkSufficientBalance = async (req, res) => {
    try {
        const doc_code = req.body.DOC_TYPE;
        let rem_amount = 0;
        let rate = 0;
        let isSufficient = true;

        let getBalanceQ = `select AMOUNT from ${table}`;
        let getRateQ = `select RATE from doc_verify_rates where CODE = ${doc_code}`

        let getBalanceR = await db.executeQuery(getBalanceQ, "");
        let getRateR = await db.executeQuery(getRateQ, "")

        console.log(getBalanceR);

        if (getBalanceR.length > 0) {
            rem_amount = getBalanceR[0].AMOUNT;
        }

        if (getRateR.length > 0) {
            rate = getRateR[0].RATE;
        }

        let difference = rem_amount - rate;

        if (difference < 0) {
            isSufficient = false;
        }

        res.send({
            "code": "200",
            "isSufficient": isSufficient,
            "difference": difference,
            "rate": rate,
            "remaining_amount": rem_amount
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

exports.getBalanceI = async () => {

    try {
        let getBalanceQ = `select AMOUNT from ${table}`;
        let getBalanceR = await db.executeQuery(getBalanceQ, "");

        if (getBalanceR.length > 0) {
            return getBalanceR[0].AMOUNT;
        }
        else {
            throw new Error("Balance is nor set.");
        }
    }

    catch (error) {
        throw new Error(error)
    }
}

exports.getBalanceE = async (req, res) => {
    try {
        let getBalanceQ = `select AMOUNT from ${table}`;
        let getBalanceR = await db.executeQuery(getBalanceQ, "");

        if (getBalanceR.length > 0) {
            res.send({
                "code": 200,
                "amount": getBalanceR[0].AMOUNT
            })
        }
        else {
            res.send({
                "code": 200,
                "message": "No balance found sending 0",
                "amount": 0
            })
        }


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

exports.updateBalanceI = async (newBalance) => {
    try {
        let updateBalQ = `update ${table} set AMOUNT = ${newBalance}`;

        await db.executeQuery(updateBalQ, "");
    }

    catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

exports.updateBalanceE = async (req, res) => {
    try {
        const newBalance = req.body.NEW_BALANCE;
        let updateBalQ = `update ${table} set AMOUNT = ${newBalance} where ID = 1`;

        await db.executeQuery(updateBalQ, "");

        res.send({
            "code": 200,
            "message": "updated"
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
