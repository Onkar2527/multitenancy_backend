const db = require("../../utilities/dbModule")
const BalAPI = require("./balance")

const table = `doc_verify_hit_history`;

exports.hit = async (req, res) => {
    try {
        const BRANCH_ID = req.body.BRANCH_ID;
        const USER_ID = req.body.USER_ID;
        const DOC_TYPE = req.body.DOC_TYPE;
        const balance = await BalAPI.getBalanceI();
        let rate = 0;

        let getRateQ = `select RATE from doc_verify_rates where CODE = ${DOC_TYPE}`;
        let getRateR = await db.executeQuery(getRateQ, "");

        if (getRateR.length > 0) {
            rate = getRateR[0].RATE;
        }

        let rem_balance = balance - rate;

        BalAPI.updateBalanceI(rem_balance);

        let data = {
            TYPE_OF_DOC: DOC_TYPE,
            BRANCH_ID: BRANCH_ID,
            USER_ID: USER_ID,
            AMOUNT_DEDUCTED: rate
        }

        let hitQ = `INSERT INTO ${table} set ?`

        await db.executeQueryData(hitQ, data, "")

        res.send({
            "code": 200,
            "message": "Hit Successfully"
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

exports.getHits = async (req, res) => {
    try {
        const BRANCH = req.body.BRANCH;

        let getHitQ = `select * from ${table} where 1`

        let rem_balance = await BalAPI.getBalanceI();

        if (BRANCH != 'AL') {
            getHitQ += ` AND BRANCH_ID = ${BRANCH}`;
        }

        let getHitR = await db.executeQuery(getHitQ, "");

        let aadhaar = {
            hits: 0,
            amount: 0
        }

        let PAN = {
            hits: 0,
            amount: 0
        }

        let VID = {
            hits: 0,
            amount: 0
        }

        let license = {
            hits: 0,
            amount: 0
        }

        let passport = {
            hits: 0,
            amount: 0
        }


        for (let hit of getHitR) {
            if (hit.TYPE_OF_DOC == 1) {
                aadhaar.amount += hit.AMOUNT_DEDUCTED;
                aadhaar.hits += 1;
            }

            if (hit.TYPE_OF_DOC == 2) {
                PAN.amount += hit.AMOUNT_DEDUCTED;
                PAN.hits += 1;
            }

            if (hit.TYPE_OF_DOC == 3) {
                VID.amount += hit.AMOUNT_DEDUCTED;
                VID.hits += 1;
            }

            if (hit.TYPE_OF_DOC == 4) {
                license.amount += hit.AMOUNT_DEDUCTED;
                license.hits += 1;
            }

            if (hit.TYPE_OF_DOC == 5) {
                passport.amount += hit.AMOUNT_DEDUCTED;
                passport.hits += 1;
            }
        }

        let total_hits = aadhaar.hits + PAN.hits + VID.hits + license.hits + passport.hits;
        let total_deduction = aadhaar.amount + PAN.amount + VID.amount + license.amount + passport.amount;

        res.send({
            "code": 200,
            "message": "success",
            "BALANCE": rem_balance,
            "AADHAAR": { "amount": aadhaar.amount, "hitCount": aadhaar.hits },
            "PAN": { "amount": PAN.amount, "hitCount": PAN.hits },
            "VID": { "amount": VID.amount, "hitCount": VID.hits },
            "LICENSE": { "amount": license.amount, "hitCount": license.hits },
            "PASSPORT": { "amount": passport.amount, "hitCount": passport.hits },
            "TOTAL_HITS": total_hits,
            "TOTAL_DEDUCTION": total_deduction
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
