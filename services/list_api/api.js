const mysql = require('mysql2/promise');
const { masterPool } = require('../../utilities/dbConfig');
const axios = require('axios');
const db = require('../../utilities/dbModule');
const fs = require('fs/promises')
const schedule = require('node-schedule')

// const mode = config.mode; // 🔴 Removed config.js dependency
async function getJWTToken(req) {
    if (!req.cbsDb) {
        throw new Error('CBS DB pool missing in request');
    }

    const pool = req.cbsDb.promise();
    const table = `jwt_token`;

    try {
        const [maxRows] = await pool.query(`SELECT ID FROM ${table} ORDER BY ID DESC LIMIT 1`);

        if (maxRows.length > 0) {
            const maxID = maxRows[0].ID;
            const [tokenRows] = await pool.query(`SELECT TOKEN FROM ${table} WHERE ID = ? AND IS_EXPIRED = 0`, [maxID]);

            if (tokenRows.length > 0) {
                return tokenRows[0].TOKEN;
            }
        }

        return await generateToken(req);
    } catch (error) {
        console.error('❌ getJWTToken error:', error);
        throw error;
    }
}

async function generateToken(req) {
    if (!req.cbsDb) {
        throw new Error('CBS DB pool missing in request');
    }

    const pool = req.cbsDb.promise();
    const table = `jwt_token`;

    // 🌐 DYNAMIC CBS URL (Multitenancy)
    const host = process.env.CBS_API_HOST || req.cbsApiHost || 'http://10.35.250.3';
    const port = process.env.CBS_API_PORT || req.cbsApiPort || 9098;
    const tokenUrl = `${host}:${port}/CustomerInfo/api/auth/getJwt`;

    try {
        const configuration = {
            headers: {
                "UserName": req.userName || 'cpc',
                "BankName": req.bankName || "Ajara",
                "BranchName": req.cbsBranchName || "Uttur",
                "CallerSystem": req.cbsCallerSystem || "System5"
            }
        };
        // proxy check if needed (skipped for brevity unless explicitly required)

        const response = await axios.get(tokenUrl, configuration);
        const token = response.data.token || response.data;

        await pool.query(
            `INSERT INTO ${table} (TOKEN, IS_EXPIRED, CREATED_DATE) VALUES (?, 0, NOW())`, [token]
        );

        return token;
    } catch (error) {
        console.error('❌ generateToken error:', error);
        throw error;
    }
}


function getRequest(url, config) {

    let promise = new Promise(async (resolve, reject) => {
        try {
            let result = await axios.get(url, config);
            // // console.log("result",result)
            resolve(result.data);
        } catch (error) {
            // console.log(error);
            reject(error);
        }
    });

    return promise;
}


async function cacheMasters() {


    if (!connection) {
        await connect();
    }

    let masters_table = `masters_list`;

    let getmasterQ = `select * from ${masters_table} where IS_ACTIVE = 1`;

    let [masters_data, masters_fields] = await connection.execute(getmasterQ);

    console.log("Masters Data", masters_data);

    for (let table of masters_data) { // console
        let checkQ = `SHOW TABLES LIKE '${table.NAME}'`;

        let [checkR, checkF] = await connection.execute(checkQ);

        console.log('table name : ', table.NAME, 'result : ', checkR);

        if (checkR.length > 0) {
            let dropQ = `DROP TABLE ${table.NAME}`
            await connection.execute(dropQ);
        }


        // 🌐 DYNAMIC CBS URL (Multitenancy)
        const host = process.env.CBS_API_HOST || req.cbsApiHost || 'http://10.35.250.3';
        const port = process.env.CBS_API_PORT || req.cbsApiPort || 9098;
        let masterUrl = `${host}:${port}/MasterLOV/customer/getMasterLOV/${table.ID}`

        let bearerKey = await getJWTToken(req);
        let configuration = {
            headers: {
                "Authorization": `Bearer ${bearerKey}`,
                "UserName": req.userName || `fco`,
                "BankName": req.bankName || "Ajara",
                "BranchName": req.cbsBranchName || "Uttur",
                "CallerSystem": req.cbsCallerSystem || "System5"
            }
        }
        // if (config[mode].api.isproxy) {
        //     configuration.proxy = proxy;
        // }
        let masterResult = await getRequest(masterUrl, configuration);

        console.log("masterResult", masterResult);

        for (let result of masterResult) {
            // let checkQ2 = `SHOW TABLES LIKE '${table.NAME}'`;

            let [checkR2, checkF2] = await connection.execute(checkQ);

            if (checkR2.length == 0) {
                let createTableQ = `CREATE TABLE ${table.NAME}(ID INT UNSIGNED NOT NULL AUTO_INCREMENT, ${returnUniqueKey(masterResult)} PRIMARY KEY (\`ID\`))`;
                console.log('table name : ', table.NAME, 'result : ', checkR2);

                let createTableR = await connection.execute(createTableQ);

                console.log("query", createTableQ, "result", createTableR);
            }

            let insertQ = `INSERT INTO ${table.NAME} set ${returnInsertQ(result)}`
            let insertR = await connection.execute(insertQ);

            console.log("query", insertQ, "result", insertR);
        }

    }

}

exports.syncMasters = () => {
    try {
        /*const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 10;
        rule.tz = 'Asia/Calcutta';

        console.log("inside synce")
        // const job = schedule.scheduleJob(rule, cacheMasters);
        var job = schedule.scheduleJob(" 1 1 23 * * 0", cacheMasters);
        console.log("job", job)*/

        cacheMasters();
    } catch (error) {
        console.log(error);

    }
}

// generateToken();

// cacheMasters();


function returnUniqueKey(arr) {
    let res = ''
    if (arr.length != 0) {
        let keys = Object.keys(arr[0]);

        for (let key of keys) {
            res += `${key} TEXT,`
        }

    }

    return res
}

function returnInsertQ(obj) {
    let q = ''
    let sep = '\"'
    for (let key of Object.keys(obj)) {
        if (typeof obj[key] == 'string') {
            if (obj[key].includes('\"')) {
                sep = '\''
            } else {
                sep = '\"'
            }
        }
        q += `${key} = ${sep}${obj[key]}${sep},`
    }

    q = q.slice(0, -1);

    console.log("insert q", q)

    return q;

}

// Resolve local document_master.ID to CBS master ID (id_proof_master.ID).
// If local row has `CBS_ID` it is returned. Otherwise, try to lookup in CBS by name
// and persist the mapping locally for future calls.
async function getCbsDocId(req, localDocId) {
    try {
        if (!localDocId) return 0;

        const [
            [localRow]
        ] = await req.db.promise().query('SELECT ID, DOCUMENT_NAME, CBS_ID FROM document_master WHERE ID = ?', [localDocId]);

        if (!localRow) return 0;

        if (localRow.CBS_ID) return localRow.CBS_ID;

        if (!req.cbsDb) return 0;

        // try to find by name in CBS id_proof_master
        const name = localRow.DOCUMENT_NAME;
        if (!name) return 0;

        const [cbsRows] = await req.cbsDb.promise().query('SELECT ID FROM id_proof_master WHERE NAME = ?', [name]);

        if (cbsRows && cbsRows.length > 0) {
            const cbsId = cbsRows[0].ID;
            // persist mapping locally
            await req.db.promise().query('UPDATE document_master SET CBS_ID = ? WHERE ID = ?', [cbsId, localDocId]);
            return cbsId;
        }

        return 0;
    } catch (err) {
        console.warn('getCbsDocId warning:', err.message || err);
        return 0;
    }
}




exports.onBoardCustomer = async (req, res) => {
    try {
        const applicant_id = req.body.APPLICANT_ID;
        const pool = req.db;

        if (!pool) {
            return res.status(400).send({
                code: 400,
                message: 'Database pool not found'
            });
        }

        const basicT = `basic_details`
        const personalT = `applicants_personal_details`
        const depositT = `term_deposite`
        const serviceT = `facilities`
        const documentT = `applicant_documents`
        const financeT = `financial_information`
        const nomineeT = `nominee_details`

        const basicQ = `select * from ?? where ID = ?`;
        const personalQ = `select * from ?? where APPLICANT_ID = ? AND APPLICANT_NO = 1`;
        const depositQ = `select * from ?? where APPLICANT_ID = ?`;
        const documentQ = `select * from ?? where APPLICANT_ID = ? AND APPLICANT_NO = 1`;
        const serviceQ = `select * from ?? where APPLICANT_ID = ?`;
        const financeQ = `select * from ?? where APPLICANT_ID = ? AND APPLICANT_NO = 1`
        const nomineeQ = `select * from ?? where APPLICANT_ID = ?`

        const guardianQ = `select * from ?? where APPLICANT_ID = ? AND APPLICANT_NO = 2`;
        const guardianFinanceQ = `select * from ?? where APPLICANT_ID = ? AND APPLICANT_NO = 2`;
        const guardianDocumentQ = `select * from ?? where APPLICANT_ID = ? AND APPLICANT_NO = 2`;


        const [
            [basicR]
        ] = await pool.promise().query(basicQ, [basicT, applicant_id]);
        const [
            [personalR]
        ] = await pool.promise().query(personalQ, [personalT, applicant_id]);
        const [
            [depositR]
        ] = await pool.promise().query(depositQ, [depositT, applicant_id]);
        const [
            [serviceR]
        ] = await pool.promise().query(serviceQ, [serviceT, applicant_id]);
        const [
            [financeR]
        ] = await pool.promise().query(financeQ, [financeT, applicant_id]);
        const [documentR] = await pool.promise().query(documentQ, [documentT, applicant_id]);
        const [
            [nomineeR]
        ] = await pool.promise().query(nomineeQ, [nomineeT, applicant_id]);

        const [
            [guardianR]
        ] = await pool.promise().query(guardianQ, [personalT, applicant_id]);
        const [
            [guardianFinanceR]
        ] = await pool.promise().query(guardianFinanceQ, [financeT, applicant_id]);
        const [guardianDocumentR] = await pool.promise().query(guardianDocumentQ, [documentT, applicant_id]);

        if (!basicR) {
            throw new Error('Applicant not found');
        }

        if (guardianR) {
            guardianR.APPLICANTS_DATA =
                (basicR['APPLICANTS_DATA'] || []).find(v => v.APPLICANT_NO == guardianR.APPLICANT_NO) || null;
        }

        const account_opening_data = {
            "custobj": {
                "reg_mobileno": personalR?.MOBILE_NUMBER,
                "reg_emailid": personalR?.EMAIL_ID,
                "introbranch": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "typeofcustomer": 1,
                "annualincome": financeR?.INCOME?.toString() || "0",
                "smssubscription": serviceR?.SMS_ALERT ? "Y" : "N",
                "middlename": personalR?.MIDDLE_NAME,
                "firstname": personalR?.FIRST_NAME,
                "lastname": personalR?.LAST_NAME,
                "createdfor": "A",
                "minor": personalR?.IS_MINOR ? "Y" : "N",
                "birthdate": personalR?.DATE_OF_BIRTH ? convertDate(personalR.DATE_OF_BIRTH) : null,
                "gender": personalR?.GENDER,
                "occupationid": Number(personalR?.PROFESSION || 0),
                "title": basicR.CUSTOMER_TYPE_1,
                "idtproofid": Number(await getCbsDocId(req, personalR?.ID_PROOF) || 0),
                "idtproofidno": personalR?.ID_PROOF_NUMBER,
                "proofdetailsid": Number(personalR?.PERMANENT_ADDRESS_PROOF || 0),
                "addproofidno": personalR?.PERMANENT_ADDRESS_PROOF_NUMBER,
                "riskcat": Number(personalR?.RISK_CATEGORY || 0),
                "panno": personalR?.PAN_NO,
                "fatherspouse": personalR?.FATHER_OR_SPOUSE,
                "bankcode": 1,
                "brncode": Number(await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID) || 0),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(masterPool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(masterPool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(masterPool, basicR.VERIFIER_USER_ID),
                "religion": Number(personalR?.RELIGION || 0),
                "caste": Number(personalR?.CASTE || 0),
                "fatherlnm": personalR?.F_OR_H_LAST_NAME,
                "fatherfnm": personalR?.F_OR_H_FIRST_NAME,
                "fathermnm": personalR?.F_OR_H_MIDDLE_NAME,
                "motherlname": personalR?.MOTHER_LAST_NAME,
                "motherfname": personalR?.MOTHER_NAME,
                "mothermname": personalR?.MOTHER_MIDDLE_NAME,
                "mothertitle": personalR?.MOTHER_TITLE,
                "issuiddocplace": basicR.DOCUMENTS_ISSUE_PLACE,
                "iddocissuauth": basicR.DOCUMENTS_AUTHORITY,
                "maritalstatus": personalR?.MARITAL_STATUS,
                "caste_code": Number(personalR?.CASTE || 0),
            },
            "addobj_P": {
                "addresstype": "P",
                "emailid": personalR?.EMAIL_ID,
                "countryid": 356,
                "stateid": await getStateCode(req.cbsDb, personalR?.PERMANENT_STATE),
                "districtid": await getDistCode(req.cbsDb, personalR?.PERMANENT_DISTRICT),
                "talukaid": await getTalukaCode(req.cbsDb, personalR?.PERMANENT_TALUKA),
                "cityid": await getCityCode(req.cbsDb, personalR?.PERMANENT_CITY),
                "areaid": await getAreaCode(req.cbsDb, personalR?.PERMANENT_AREA),
                "mobile": personalR?.MOBILE_NUMBER.toString(),
                "pincode": personalR?.PERMANENT_PINCODE.toString(),
                "regionid": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(masterPool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(masterPool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(masterPool, basicR.VERIFIER_USER_ID),
                "addressline1": `${personalR?.PERMANENT_ADDRESS} ${personalR?.PERMANENT_LANDMARK}`
            },
            "addobj_C": {
                "addresstype": "C",
                "countryid": 356,
                "stateid": await getStateCode(req.cbsDb, personalR?.CURRENT_STATE),
                "districtid": await getDistCode(req.cbsDb, personalR?.CURRENT_DISTRICT),
                "talukaid": await getTalukaCode(req.cbsDb, personalR?.CURRENT_TALUKA),
                "cityid": await getCityCode(req.cbsDb, personalR?.CURRENT_CITY),
                "areaid": await getAreaCode(req.cbsDb, personalR?.CURRENT_AREA),
                "regionid": 1,
                "mobile": personalR?.MOBILE_NUMBER.toString(),
                "pincode": personalR?.CURRENT_PINCODE.toString(),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(masterPool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(masterPool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(masterPool, basicR.VERIFIER_USER_ID),
                "addressline1": `${personalR?.CURRENT_ADDRESS} ${personalR?.CURRENT_LANDMARK}`
            },
            "kyccomobj": {
                "kcc_status": "F",
                "entryuser": await getUserNameByID(masterPool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(masterPool, basicR.CHACKER_USER_ID),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID)
            },
            "kyccompdtlrobj": {
                "kcd_addproff": Number(personalR?.PERMANENT_ADDRESS_PROOF || 0),
                "kcd_addidno": personalR?.PERMANENT_ADDRESS_PROOF_NUMBER.toString(),
                "kcd_idproof": Number(await getCbsDocId(req, personalR?.ID_PROOF) || 0),
                "kcd_ididno": personalR?.ID_PROOF_NUMBER.toString(),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID)
            },
            "acmst_obj": {
                "checkbookfacility": serviceR?.CHEQUE_BOOK ? "Y" : "N",
                "schemecode": Number(depositR?.SCHEME_CODE || 0),
                "acctitle": `${personalR?.LAST_NAME} ${personalR?.FIRST_NAME} ${personalR?.MIDDLE_NAME}`,
                "jointacc": "N",
                "constitution": Number(personalR?.CONSTITUTION || 0),
                "operinstructions": Number(depositR?.ACCOUNT_OPERATION || 0),
                "paymentinstructions": Number(depositR?.PAYMENT_INSTRUCTION || 0),
                "entrystatus": "F",
                "smssubscrbd": serviceR?.SMS_ALERT ? "Y" : "N",
                "entryuser": await getUserNameByID(masterPool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(masterPool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(masterPool, basicR.VERIFIER_USER_ID),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "acctobeopn_atbrncd": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "accopendt": '16-02-2026 00:00:00',
                "opnormdf": "A"
            },
            "accdtl_obj": {
                "schemecode": Number(depositR?.SCHEME_CODE || 0),
                "changeno": 1,
                "bankcode": 1,
                "checkbookfacility": serviceR?.CHEQUE_BOOK ? "Y" : "N",
                "brncode": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "acctobeopn_atbrncd": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID)
            },
            "docdtl_obj": {
                "schemecode": Number(depositR?.SCHEME_CODE || 0),
                "docid": Number(await getCbsDocId(req, personalR?.ID_PROOF) || 0),
                "changeno": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "acctobeopn_atbrncd": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID)
            },
            "acnomobj": nomineeR ? {
                "and_nominame": nomineeR.NOMINEE_NAME,
                "and_nominaddrs": nomineeR.NOMINEE_ADDRESS,
                "and_relation": Relation(nomineeR.RELATION),
                "and_dtofbirth": convertDate(nomineeR.DOB),
                "brncode": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "and_caretaker": `${nomineeR.APONITED_NAME}  ${nomineeR.APONITED_ADDRESS}`,
                "seq_no": 1,
                "and_cancel": "N",
                "and_percentage": Number(nomineeR.SHARE_PERCENTAGE || 0),
                "and_acopn_brncd": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "and_acopened_atbrn": await getBranchFromCBS(masterPool, basicR.CREATED_BRANCH_ID),
                "bankcode": 1
            } : null,
            "m_kcd_iddocimage": await getDocument('Applicant ID Proof', documentR),
            "m_kcd_adddocimage": await getDocument('Applicant Address Proof', documentR),
            "m_kcd_photo": await getDocument('Applicant Photo', documentR),
            "m_kcd_sign": await getDocument('Signature', documentR)
        }

        const host = process.env.CBS_API_HOST || req.cbsApiHost || 'http://10.35.250.3';
        const port = process.env.CBS_API_PORT || req.cbsApiPort || 9098;
        const posturl = `${host}:${port}/OnBoardCustomer/customer/onBoard`;

        const bearerKey = await getJWTToken(req);

        // 📅 2026-04-03 - Dynamic headers (FINAL FIX)
        const configuration = {
            headers: {
                "Authorization": `Bearer ${bearerKey}`,
                "UserName": req.userName,
                "BankName": req.bankName,
                "BranchName": req.cbsBranchName,
                "CallerSystem": req.cbsCallerSystem
            }
        };

        // DEBUG (remove later)
        console.log("🚀 FINAL HEADERS:", configuration.headers);

        // 📁 Save onboarding payload to JSON file locally in backend
        try {
            const path = require('path');
            const logDir = path.join(__dirname, '..', '..', 'account_json');
            await fs.mkdir(logDir, { recursive: true });
            const logFilePath = path.join(logDir, `onboard_${applicant_id}.json`);
            await fs.writeFile(logFilePath, JSON.stringify(account_opening_data, null, 4), 'utf8');
            console.log(`🟢 [onBoardCustomer] Logged payload JSON to: ${logFilePath}`);
        } catch (fileErr) {
            console.error('❌ [onBoardCustomer] Failed to save payload JSON file:', fileErr);
        }

        const accountCreatedData = await axios.post(
            posturl,
            account_opening_data,
            configuration
        );

        if (account_opening_data.custobj.entryuser === '-' ||
            account_opening_data.custobj.verifiedby === '-' ||
            account_opening_data.custobj.authuser === '-') {
            console.warn('⚠️ [WARNING] Some teller/user names are missing (sent as "-"). Please check user_master table.');
            console.log('➡️ EntryUser:', account_opening_data.custobj.entryuser);
            console.log('➡️ VerifiedBy:', account_opening_data.custobj.verifiedby);
            console.log('➡️ AuthUser:', account_opening_data.custobj.authuser);
        }

        if (account_opening_data.custobj.brncode === 1) {
            console.warn('⚠️ [WARNING] BrnCode is 1 (Fallback). Please check if CREATED_BRANCH_ID is valid in basic_details.');
        }

        let basicUpdateQ = `update basic_details set ACCOUNT_NUMBER = ?, CUSTOMER_ID_1 = ? where ID = ?`;
        let basicUpdateParams = [accountCreatedData.data['Account number'], accountCreatedData.data['Customer Code'], applicant_id];

        if (personalR?.IS_MINOR && depositR?.ACCOUNT_TYPE == 'A') {
            const customer_ids = accountCreatedData.data['Customer Code'].split(",");
            const primary_applicant = customer_ids[0];
            const guardian_applicant = customer_ids[1].split("-")[1];
            const APPLICANT_DATA = basicR['APPLICANT_DATA'] || [];

            if (APPLICANT_DATA[1]) APPLICANT_DATA[1].CUSTOMER_ID = guardian_applicant;

            basicUpdateQ = `update basic_details set ACCOUNT_NUMBER = ?, CUSTOMER_ID_1 = ?, APPLICANT_DATA = ? where ID = ?`
            basicUpdateParams = [accountCreatedData.data['Account number'], primary_applicant, JSON.stringify(APPLICANT_DATA), applicant_id];
        }

        await pool.promise().query(basicUpdateQ, basicUpdateParams);

        res.send({
            "code": 200,
            "data": account_opening_data,
            "success_data": accountCreatedData.data
        })

    } catch (error) {

        console.log("FULL ERROR => ", error);
        console.log("ERROR RESPONSE => ", error?.response);
        console.log("ERROR DATA => ", error?.response?.data);
        console.log("ERROR MESSAGE => ", error?.message);

        res.status(400).send({
            code: 400,
            message:
                error?.response?.data ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed'
        });
    }

}



function substring5(str, strict = 0) {
    if (!(typeof str == 'string')) {
        if (strict === 1) {
            throw new Error(`str : ${str} is not a string`);
        }
        return "-";
    }

    return str.substring(0, 4);
}


async function getJoin(req, basic_details, serviceDetails, depositeDetails) {
    const pool = req.db;
    const query = `
        SELECT per.*, fin.*
        FROM applicants_personal_details per
        LEFT OUTER JOIN financial_information fin 
          ON fin.APPLICANT_NO = per.APPLICANT_NO
          AND fin.APPLICANT_ID = per.APPLICANT_ID 
        WHERE per.APPLICANT_NO != 1 
          AND per.APPLICANT_ID = ?
    `;

    const [customers] = await pool.promise().query(query, [basic_details.ID]);

    if (basic_details.IS_MINOR == 1 || depositeDetails.ACCOUNT_TYPE != 'A') {
        return {
            "custobj_join": null,
            "custadd_join_P_obj": null,
            "custadd_join_C_obj": null,
            "kyc1_join_input": null,
            "kyc2_join_input": null
        }
    }

    for (let i = 0; i < customers.length; i++) {
        customers[i]["APPLICANTS_DATA"] = (basic_details['APPLICANTS_DATA'] || []).find((val) => val.APPLICANT_NO == customers[i]["APPLICANT_NO"]);
    }

    const obj = {
        "custobj_join": [],
        "custadd_join_P_obj": [],
        "custadd_join_C_obj": [],
        "kyc1_join_input": [],
        "kyc2_join_input": []
    }

    for (const customer of customers) {
        const cust = {
            "reg_mobileno": customer.MOBILE_NUMBER,
            "reg_emailid": customer.EMAIL_ID,
            "introbranch": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "typeofcustomer": 1,
            "annualincome": customer.INCOME ? customer.INCOME.toString() : '0',
            "smssubscription": serviceDetails.SMS_ALERT ? "Y" : "N",
            "middlename": customer.MIDDLE_NAME,
            "firstname": customer.FIRST_NAME,
            "lastname": customer.LAST_NAME,
            "createdfor": "A",
            "minor": customer.IS_MINOR ? "Y" : "N",
            "birthdate": customer.DATE_OF_BIRTH ? convertDate(customer.DATE_OF_BIRTH) : null,
            "gender": customer.GENDER,
            "occupationid": Number(customer.PROFESSION || 0),
            "title": customer.APPLICANTS_DATA?.CUSTOMER_TYPE || '',
            "idtproofid": Number(customer.ID_PROOF || 0),
            "idtproofidno": customer.ID_PROOF_NUMBER,
            "proofdetailsid": Number(customer.PERMANENT_ADDRESS_PROOF || 0),
            "addproofidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "riskcat": Number(customer.RISK_CATEGORY || 0),
            "panno": customer.PAN_NO,
            "fatherspouse": customer.FATHER_OR_SPOUSE,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(masterPool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(masterPool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(masterPool, basic_details.VERIFIER_USER_ID),
            "religion": Number(customer.RELIGION || 0),
            "caste": Number(customer.CASTE || 0),
            "fatherlnm": customer.F_OR_H_LAST_NAME,
            "fatherfnm": customer.F_OR_H_FIRST_NAME,
            "fathermnm": customer.F_OR_H_MIDDLE_NAME,
            "motherlname": customer.MOTHERS_LAST_NAME,
            "motherfname": customer.MOTHERS_NAME,
            "mothermname": customer.MOTHERS_MIDDLE_NAME,
            "mothertitle": customer.MOTHER_TITLE,
            "issuiddocplace": basic_details.DOCUMENTS_ISSUE_PLACE,
            "iddocissuauth": basic_details.DOCUMENTS_AUTHORITY,
            "maritalstatus": customer.MARITAL_STATUS,
            "caste_code": Number(customer.CASTE || 0),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const p_add = {
            "addresstype": "P",
            "emailid": customer.EMAIL_ID,
            "countryid": 1,
            "stateid": await getStateCode(req.cbsDb, customer.PERMANENT_STATE),
            "districtid": await getDistCode(req.cbsDb, customer.PERMANENT_DISTRICT),
            "talukaid": await getTalukaCode(req.cbsDb, customer.PERMANENT_TALUKA),
            "cityid": await getCityCode(req.cbsDb, customer.PERMANENT_CITY),
            "areaid": await getAreaCode(req.cbsDb, customer.PERMANENT_AREA),
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.PERMANENT_PINCODE,
            "regionid": 1,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(masterPool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(masterPool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(masterPool, basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.PERMANENT_ADDRESS} ${customer.PERMANENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const c_add = {
            "addresstype": "C",
            "countryid": 1,
            "stateid": await getStateCode(req.cbsDb, customer.CURRENT_STATE),
            "districtid": await getDistCode(req.cbsDb, customer.CURRENT_DISTRICT),
            "talukaid": await getTalukaCode(req.cbsDb, customer.CURRENT_TALUKA),
            "cityid": await getCityCode(req.cbsDb, customer.CURRENT_CITY),
            "areaid": await getAreaCode(req.cbsDb, customer.CURRENT_AREA),
            "regionid": 1,
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.CURRENT_PINCODE,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "entryuser": await getUserNameByID(masterPool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(masterPool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(masterPool, basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.CURRENT_ADDRESS} ${customer.CURRENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_1 = {
            "kcc_status": "F",
            "entryuser": await getUserNameByID(masterPool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(masterPool, basic_details.CHACKER_USER_ID),
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_2 = {
            "kcd_addproff": Number(customer.PERMANENT_ADDRESS_PROOF || 0),
            "kcd_addidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "kcd_idproof": Number(customer.ID_PROOF || 0),
            "kcd_ididno": customer.ID_PROOF_NUMBER,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        obj['custobj_join'].push(cust);
        obj['custadd_join_P_obj'].push(p_add);
        obj['custadd_join_C_obj'].push(c_add);
        obj['kyc1_join_input'].push(kyc_1);
        obj['kyc2_join_input'].push(kyc_2);
    }

    for (let o in obj) {
        if (obj[o].length == 0) {
            obj[o] = null;
        }
    }

    return obj;
}

async function getCurrent(req, basic_details, serviceDetails, depositeDetails) {
    const pool = req.db;
    const query = `
        SELECT per.*, fin.*
        FROM applicants_personal_details per
        LEFT OUTER JOIN financial_information fin 
          ON fin.APPLICANT_NO = per.APPLICANT_NO
          AND fin.APPLICANT_ID = per.APPLICANT_ID 
        WHERE per.APPLICANT_NO != 1 
          AND per.APPLICANT_ID = ?
    `;

    const [customers] = await pool.promise().query(query, [basic_details.ID]);

    if (depositeDetails.ACCOUNT_TYPE != 'C') {
        return {
            "custobj_const": null,
            "custadd_const_P_obj": null,
            "custadd_const_C_obj": null,
            "kyc1_const_input": null,
            "kyc2_const_input": null,
        }
    }

    for (let i = 0; i < customers.length; i++) {
        customers[i]["APPLICANTS_DATA"] = (basic_details['APPLICANTS_DATA'] || []).find((val) => val.APPLICANT_NO == customers[i]["APPLICANT_NO"]);
    }

    const obj = {
        "custobj_const": [],
        "custadd_const_P_obj": [],
        "custadd_const_C_obj": [],
        "kyc1_const_input": [],
        "kyc2_const_input": []
    }

    for (const customer of customers) {
        const cust = {
            "reg_mobileno": customer.MOBILE_NUMBER,
            "reg_emailid": customer.EMAIL_ID,
            "introbranch": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "typeofcustomer": 1,
            "annualincome": customer.INCOME ? customer.INCOME.toString() : '0',
            "smssubscription": serviceDetails.SMS_ALERT ? "Y" : "N",
            "middlename": customer.MIDDLE_NAME,
            "firstname": customer.FIRST_NAME,
            "lastname": customer.LAST_NAME,
            "createdfor": "A",
            "minor": customer.IS_MINOR ? "Y" : "N",
            "birthdate": customer.DATE_OF_BIRTH ? convertDate(customer.DATE_OF_BIRTH) : null,
            "gender": customer.GENDER,
            "occupationid": Number(customer.PROFESSION || 0),
            "title": customer.APPLICANTS_DATA?.CUSTOMER_TYPE || '',
            "idtproofid": Number(customer.ID_PROOF || 0),
            "idtproofidno": customer.ID_PROOF_NUMBER,
            "proofdetailsid": Number(customer.PERMANENT_ADDRESS_PROOF || 0),
            "addproofidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "riskcat": Number(customer.RISK_CATEGORY || 0),
            "panno": customer.PAN_NO,
            "fatherspouse": customer.FATHER_OR_SPOUSE,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(masterPool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(masterPool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(masterPool, basic_details.VERIFIER_USER_ID),
            "religion": Number(customer.RELIGION || 0),
            "caste": Number(customer.CASTE || 0),
            "fatherlnm": customer.F_OR_H_LAST_NAME,
            "fatherfnm": customer.F_OR_H_FIRST_NAME,
            "fathermnm": customer.F_OR_H_MIDDLE_NAME,
            "motherlname": customer.MOTHERS_LAST_NAME,
            "motherfname": customer.MOTHERS_NAME,
            "mothermname": customer.MOTHERS_MIDDLE_NAME,
            "mothertitle": customer.MOTHER_TITLE,
            "issuiddocplace": basic_details.DOCUMENTS_ISSUE_PLACE,
            "iddocissuauth": basic_details.DOCUMENTS_AUTHORITY,
            "maritalstatus": customer.MARITAL_STATUS,
            "caste_code": Number(customer.CASTE || 0),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const p_add = {
            "addresstype": "P",
            "emailid": customer.EMAIL_ID,
            "countryid": 1,
            "stateid": await getStateCode(req.cbsDb, customer.PERMANENT_STATE),
            "districtid": await getDistCode(req.cbsDb, customer.PERMANENT_DISTRICT),
            "talukaid": await getTalukaCode(req.cbsDb, customer.PERMANENT_TALUKA),
            "cityid": await getCityCode(req.cbsDb, customer.PERMANENT_CITY),
            "areaid": await getAreaCode(req.cbsDb, customer.PERMANENT_AREA),
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.PERMANENT_PINCODE,
            "regionid": 1,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(masterPool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(masterPool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(masterPool, basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.PERMANENT_ADDRESS} ${customer.PERMANENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const c_add = {
            "addresstype": "C",
            "countryid": 1,
            "stateid": await getStateCode(req.cbsDb, customer.CURRENT_STATE),
            "districtid": await getDistCode(req.cbsDb, customer.CURRENT_DISTRICT),
            "talukaid": await getTalukaCode(req.cbsDb, customer.CURRENT_TALUKA),
            "cityid": await getCityCode(req.cbsDb, customer.CURRENT_CITY),
            "areaid": await getAreaCode(req.cbsDb, customer.CURRENT_AREA),
            "regionid": 1,
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.CURRENT_PINCODE,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "entryuser": await getUserNameByID(masterPool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(masterPool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(masterPool, basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.CURRENT_ADDRESS} ${customer.CURRENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_1 = {
            "kcc_status": "F",
            "entryuser": await getUserNameByID(masterPool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(masterPool, basic_details.CHACKER_USER_ID),
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_2 = {
            "kcd_addproff": Number(customer.PERMANENT_ADDRESS_PROOF || 0),
            "kcd_addidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "kcd_idproof": Number(customer.ID_PROOF || 0),
            "kcd_ididno": customer.ID_PROOF_NUMBER,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(masterPool, basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        obj['custobj_const'].push(cust);
        obj['custadd_const_P_obj'].push(p_add);
        obj['custadd_const_C_obj'].push(c_add);
        obj['kyc1_const_input'].push(kyc_1);
        obj['kyc2_const_input'].push(kyc_2);
    }

    for (let o in obj) {
        if (obj[o].length == 0) {
            obj[o] = null;
        }
    }

    return obj;
}

async function getDocument(NAME, arr) {
    let filelink = ''
    for (let doc of arr) {
        if (doc.DOCUMENT_NAME == NAME) {
            filelink = doc.FILE_LINK;
            break;
        }
    }

    if (filelink != '') {
        let pathD = filelink;

        let res = await fs.readFile(pathD, { encoding: 'utf-8' });

        res = res.replace("data:image/jpeg;base64,", '');
        return res;
    } else return '';
}


function convertDate(date, srcFormate = 'dd/mm/yyyy') {
    // 🗓️ Handle both '/' and '-' to be safe
    let dateArr = date.includes("/") ? date.split("/") : date.split("-");

    if (dateArr.length < 3) return date; // Return original if not a proper date

    let converted_date = `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}`

    console.log("Converted Date:", converted_date);

    return converted_date;
}


function addZ(n) { return n < 10 ? '0' + n : '' + n; }

function generateNewDate() {
    let day = new Date().getDate();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();

    let hour = new Date().getHours();
    let minute = new Date().getMinutes();
    let second = new Date().getSeconds();



    let date = `${addZ(day)}-${addZ(month)}-${year} ${addZ(hour)}:${addZ(minute)}:${addZ(second)}`

    return date;
}


// console.log("current date = ",generateNewDate());

async function getStateCode(pool, id) {
    try {
        if (!id) return 1;
        const [rows] = await pool.promise().query('select STATEID from state_master where ID = ?', [id]);
        return (rows.length > 0 && rows[0].STATEID) ? Number(rows[0].STATEID) : 1;
    } catch (error) {
        console.error('❌ getStateCode error:', error);
        return 1;
    }
}

async function getDistCode(pool, id) {
    try {
        if (!id) return 1;
        const [rows] = await pool.promise().query('select DISTRICTID from district_master where ID = ?', [id]);
        return (rows.length > 0 && rows[0].DISTRICTID) ? Number(rows[0].DISTRICTID) : 1;
    } catch (error) {
        return 1;
    }
}

async function getTalukaCode(pool, id) {
    try {
        if (!id) return 1;
        const [rows] = await pool.promise().query('select TALUKAID from taluka_master where ID = ?', [id]);
        return (rows.length > 0 && rows[0].TALUKAID) ? Number(rows[0].TALUKAID) : 1;
    } catch (error) {
        return 1;
    }
}

async function getCityCode(pool, id) {
    try {
        if (!id) return 1;
        const [rows] = await pool.promise().query('select CITYID from city_master where ID = ?', [id]);
        return (rows.length > 0 && rows[0].CITYID) ? Number(rows[0].CITYID) : 1;
    } catch (error) {
        return 1;
    }
}

async function getAreaCode(pool, id) {
    try {
        if (!id) return 1;
        const [rows] = await pool.promise().query('select AREAID from address_master where ID = ?', [id]);
        return (rows.length > 0 && rows[0].AREAID) ? Number(rows[0].AREAID) : 1;
    } catch (error) {
        return 1;
    }
}

async function getBranchFromCBS(pool, branchID) {
    try {
        if (!branchID) return 1;
        const [rows] = await pool.promise().query('select BRANCH_CODE from branch_master where ID = ?', [branchID]);
        return (rows.length > 0 && rows[0].BRANCH_CODE) ? Number(rows[0].BRANCH_CODE) : 1;
    } catch (error) {
        return 1;
    }
}

async function getUserNameByID(masterPool, id) {
    try {
        if (!id) return '-';
        const [rows] = await masterPool.promise().query('SELECT USER_NAME, NAME FROM user_master WHERE ID = ?', [id]);
        if (rows && rows.length > 0) {
            const userName = rows[0].USER_NAME || rows[0].NAME;
            return substring5(userName, 0);
        }
        return '-';
    } catch (error) {
        console.warn('getUserNameByID error:', error.message || error);
        return '-';
    }
}


exports.getMasters = async (req, res) => {
    try {

        // 🔒 CBS DB available आहे का?
        if (!req.cbsDb) {
            return res.status(400).send({
                code: 400,
                message: 'CBS not enabled for this bank'
            });
        }

        const masterCode = req.body.code;
        const filter = req.body.filter || '';

        if (!masterCode) {
            return res.status(400).send({
                code: 400,
                message: 'Master code is required'
            });
        }

        /* ---------- STEP 1: masters_list मधून table नाव ---------- */

        const masterQ = `
            SELECT NAME 
            FROM masters_list 
            WHERE ID = ?
        `;

        const [masterR] = await req.cbsDb
            .promise()
            .query(masterQ, [masterCode]);

        if (masterR.length === 0 || !masterR[0].NAME) {
            return res.send({
                code: 200,
                message: 'no data',
                data: []
            });
        }

        const table_name = masterR[0].NAME;

        /* ---------- STEP 2: dynamic master table query ---------- */

        const getMasterQ = `
            SELECT * 
            FROM ${table_name}
            WHERE 1 ${filter}
        `;

        const [result] = await req.cbsDb
            .promise()
            .query(getMasterQ);

        return res.send({
            code: 200,
            data: result
        });

    } catch (error) {
        console.error('❌ getMasters error:', error);
        return res.status(500).send({
            code: 500,
            message: 'failed'
        });
    }
};


function Relation(code) {
    let valid_codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    if (!valid_codes.includes(code)) {
        return '';
    }

    optionList = {
        'A': 'Father',
        'B': 'Mother',
        'C': 'Brother',
        'D': 'Sister',
        'E': 'Son',
        'F': 'Daughter',
        'G': 'Husband',
        'H': 'Wife'
    }

    return optionList[code];

}

const proxy = {
    host: '127.0.0.1', // proxy server
    port: 8080
};
exports.getCustomer = async (req, res) => {
    try {
        let search_mode = req.body.mode;
        let search_key = 'customerCode';
        let search_value = req.body.CUSTOMER_ID;
        if (search_mode == 'CUSTOMER_ID') {
            search_key = 'customerCode';
            search_value = req.body.CUSTOMER_ID;
        } else if (search_mode == 'AADHAAR_NO') {
            search_key = 'adharNo'
            search_value = req.body.AADHAAR_NO;
        } else if (search_mode == 'PAN') {
            search_key = 'panCardNo';
            search_value = req.body.PAN_NO;
        }


        // 🌐 DYNAMIC CBS URL (Multitenancy)
        const host = process.env.CBS_API_HOST || req.cbsApiHost || 'http://10.35.250.3';
        const port = process.env.CBS_API_PORT || req.cbsApiPort || 9098;
        let getCustomer = `${host}:${port}/CustomerInfo/customer/getCustomerInfo?${search_key}=${search_value}`

        let bearerKey = await getJWTToken(req);

        let configuration = {
            headers: {
                "Authorization": `Bearer ${bearerKey}`,
                "UserName": req.userName || `ajara.ba`,
                "BankName": req.bankName || "Ajara",
                "BranchName": req.cbsBranchName || "Uttur",
                "CallerSystem": req.cbsCallerSystem || "FCO"
            }
        }
        // if (config[mode].api.isproxy) {
        //     configuration.proxy = proxy;
        // }

        let customerData = await getRequest(getCustomer, configuration);

        console.log("customerData", customerData);

        if (!customerData || !customerData['Customer Details']) {
            return res.send({
                "code": 404,
                "message": "no customer"
            });
        }

        let res_body = {
            CUSTOMER_ID: customerData['Customer Details'].CUSTOMERID,
            CUSTUIN: customerData['Customer Details'].CUSTUIN,
            FIRST_NAME: customerData['Customer Details'].FIRSTNAME,
            MIDDLE_NAME: customerData['Customer Details'].MIDDLENAME,
            LAST_NAME: customerData['Customer Details'].LASTNAME,
            // RISKCAT: '',
            MOBILE: customerData['Customer Details'].REG_MOBILENO,
            // OCCUPATION: '',
            // ID_PROOF: '',
            // ID_PROOF_NUMBER: '',
            // ADDRESS_PROOF: '',
            // ADDRESS_PROOF_NUMBER: '',
            PAN: customerData['Customer Details'].PANNO,
            // TITLE: customerData['Customer Details'].TITLE,
            BIRTHDATE: customerData['Customer Details'].BIRTHDATE,
            GENDER: customerData['Customer Details'].GENDER,

            ALREADY_EXIST: customerData['Having individual account'] || customerData['Having individual account:'],
            KYC_DETAILS: customerData['KYC Details'] || null

            // STATE: '',
            // DISTRICT: '',
            // TALUKA: '',
            // CITY: '',
            // AREA: '',
            // PINCODE: ''
        }

        res.send({
            "code": 200,
            "message": "fetched",
            "original_data": customerData,
            "data": res_body
        });

    } catch (error) {
        console.error("❌ getCustomer error:", error);
        if (error.response && error.response.status === 404) {
            return res.send({
                "code": 404,
                "message": "no customer"
            });
        }
        res.send({
            "code": 400,
            "error": error.message || error
        })
    }
}

async function getCustomerIdFromCBS(req, aadhaarNo, panNo) {
    try {
        let search_key = '';
        let search_value = '';
        if (aadhaarNo && String(aadhaarNo).trim() !== '') {
            search_key = 'adharNo';
            search_value = String(aadhaarNo).replace(/\s+/g, '').trim();
        } else if (panNo && String(panNo).trim() !== '') {
            search_key = 'panCardNo';
            search_value = String(panNo).replace(/\s+/g, '').trim();
        } else {
            return null;
        }

        const host = process.env.CBS_API_HOST || req.cbsApiHost || 'http://10.35.250.3';
        const port = process.env.CBS_API_PORT || req.cbsApiPort || 9098;
        let getCustomerUrl = `${host}:${port}/CustomerInfo/customer/getCustomerInfo?${search_key}=${search_value}`;

        let bearerKey = await getJWTToken(req);
        let configuration = {
            headers: {
                "Authorization": `Bearer ${bearerKey}`,
                "UserName": req.userName || `ajara.ba`,
                "BankName": req.bankName || "Ajara",
                "BranchName": req.cbsBranchName || "Uttur",
                "CallerSystem": req.cbsCallerSystem || "System5"
            }
        };

        let customerData = await getRequest(getCustomerUrl, configuration);
        if (customerData && customerData['Customer Details']) {
            return customerData['Customer Details'].CUSTOMERID;
        }
    } catch (e) {
        console.error('Error fetching customer ID from CBS:', e.message || e);
    }
    return null;
}

exports.checkLocalDuplicate = async (req, res) => {
    try {
        const pool = req.db;
        const { value, type, applicantId } = req.body;

        if (!value || !type) {
            return res.send({ code: 400, message: "value and type are required" });
        }

        const typeMap = {
            'AADHAAR_NO': ['AADHAAR_NUMBER'],
            'PAN': ['PAN_NO'],
            'DL': ['DRIVING_LICENSE_NO'],
            'VOTER_ID': ['VOTER_ID'],
            'PASSPORT': ['PASSPORT_NO', 'PASSPORT']
        };

        const cols = typeMap[type];
        if (!cols) {
            return res.send({ code: 400, message: "Invalid document type" });
        }

        let sanitizedValue = String(value).replace(/\s+/g, '').trim();

        let query = `
            SELECT 
                apd.APPLICANT_ID, 
                apd.APPLICANT_NO, 
                apd.FIRST_NAME, 
                apd.MIDDLE_NAME, 
                apd.LAST_NAME,
                apd.AADHAAR_NUMBER,
                apd.PAN_NO,
                bd.CUSTOMER_ID_1,
                bd.CUSTOMER_ID_2,
                bd.CUSTOMER_ID_3,
                bd.CUSTOMER_ID_4
            FROM applicants_personal_details apd
            LEFT JOIN basic_details bd ON apd.APPLICANT_ID = bd.ID
            WHERE `;
        let queryParts = [];
        let params = [];

        for (const col of cols) {
            queryParts.push(`(REPLACE(apd.??, ' ', '') = ? AND apd.?? != '')`);
            params.push(col, sanitizedValue, col);
        }

        query += `(${queryParts.join(' OR ')})`;

        if (applicantId && applicantId !== 'undefined' && applicantId !== 'null' && applicantId !== 0) {
            query += ` AND apd.APPLICANT_ID != ?`;
            params.push(applicantId);
        }

        const [rows] = await pool.promise().query(query, params);

        if (rows.length > 0) {
            const applicant = rows[0];
            const fullName = [applicant.FIRST_NAME, applicant.MIDDLE_NAME, applicant.LAST_NAME].filter(Boolean).join(' ');
            const customerIdKey = `CUSTOMER_ID_${applicant.APPLICANT_NO}`;
            let customerId = applicant[customerIdKey];

            if (!customerId || String(customerId).trim() === '') {
                // Fetch Customer ID dynamically from CBS using matching applicant's Aadhaar or PAN
                customerId = await getCustomerIdFromCBS(req, applicant.AADHAAR_NUMBER, applicant.PAN_NO);
            }

            const profileName = customerId ? `${fullName}(${customerId})` : fullName;

            return res.send({
                code: 200,
                isDuplicate: true,
                message: `Duplicate document found! This ${type} already exists in another profile of '${profileName}'.`
            });
        }

        res.send({
            code: 200,
            isDuplicate: false,
            message: "No duplicates found"
        });

    } catch (error) {
        console.error("❌ checkLocalDuplicate error:", error);
        res.send({
            code: 500,
            message: "Internal server error during duplicate check",
            error: error.message || error
        });
    }
};
