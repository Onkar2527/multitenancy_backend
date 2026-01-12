const BalAPI = require("./balance");

const table = `doc_verify_hit_history`;

// ------------------------------
// RECORD HIT (BANK DB)
exports.hit = async (req, res) => {
    try {
        const { BRANCH_ID, USER_ID, DOC_TYPE } = req.body;

        // Pass req to getBalanceI
        const balance = await BalAPI.getBalanceI(req);
        let rate = 0;

        const [getRateR] = await req.db.promise().query(`SELECT RATE FROM doc_verify_rates WHERE CODE = ?`, [DOC_TYPE]);

        if (getRateR.length > 0) {
            rate = getRateR[0].RATE;
        }

        if (balance >= rate) {
            await req.db.promise().query(
                `INSERT INTO ?? (BRANCH_ID, USER_ID, DOC_TYPE, AMOUNT) VALUES (?, ?, ?, ?)`,
                [table, BRANCH_ID, USER_ID, DOC_TYPE, rate]
            );

            // Pass req to deductBalanceI
            await BalAPI.deductBalanceI(req, rate);

            return res.send({
                code: 200,
                message: "Hit recorded."
            });
        } else {
            return res.status(400).send({
                code: 400,
                message: "Insufficient balance."
            });
        }

    } catch (error) {
        console.error('❌ RECORD HIT ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal Error",
            error: error.message
        });
    }
};

// ------------------------------
// GET HITS (BANK DB)
exports.getHits = async (req, res) => {
    try {
        const { BRANCH } = req.body;

        let queryParams = [table];
        let getHitQ = `SELECT * FROM ?? WHERE 1`;

        const rem_balance = await BalAPI.getBalanceI(req);

        if (BRANCH && BRANCH !== 'AL') {
            getHitQ += ` AND BRANCH_ID = ?`;
            queryParams.push(BRANCH);
        }

        const [getHitR] = await req.db.promise().query(getHitQ, queryParams);

        let aadhaar = { hits: 0, amount: 0 };
        let PAN = { hits: 0, amount: 0 };
        let VID = { hits: 0, amount: 0 };
        let DL = { hits: 0, amount: 0 };
        let PASSPORT = { hits: 0, amount: 0 };

        getHitR.forEach(hit => {
            const docType = String(hit.DOC_TYPE).toUpperCase();
            if (docType === 'ADR' || docType === '1') {
                aadhaar.hits++;
                aadhaar.amount += hit.AMOUNT;
            } else if (docType === 'PAN' || docType === '2') {
                PAN.hits++;
                PAN.amount += hit.AMOUNT;
            } else if (docType === 'VID' || docType === '3') {
                VID.hits++;
                VID.amount += hit.AMOUNT;
            } else if (docType === 'DL' || docType === '4') {
                DL.hits++;
                DL.amount += hit.AMOUNT;
            } else if (docType === 'PASSPORT' || docType === '5') {
                PASSPORT.hits++;
                PASSPORT.amount += hit.AMOUNT;
            }
        });

        return res.send({
            code: 200,
            BALANCE: rem_balance,
            AADHAAR: { amount: aadhaar.amount, hitCount: aadhaar.hits },
            PAN: { amount: PAN.amount, hitCount: PAN.hits },
            VID: { amount: VID.amount, hitCount: VID.hits },
            LICENSE: { amount: DL.amount, hitCount: DL.hits },
            PASSPORT: { amount: PASSPORT.amount, hitCount: PASSPORT.hits },
            TOTAL_HITS: getHitR.length,
            TOTAL_DEDUCTION: getHitR.reduce((sum, h) => sum + h.AMOUNT, 0)
        });

    } catch (error) {
        console.error('❌ GET HITS ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal Error",
            error: error.message
        });
    }
};
