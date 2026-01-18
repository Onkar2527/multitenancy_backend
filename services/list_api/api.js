const mysql = require('mysql2/promise');
const config = require('./config').config
const axios = require('axios');
const db = require('../../utilities/dbModule');
const fs = require('fs/promises')
const schedule = require('node-schedule')

const mode = config.mode;
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
    const tokenUrl = `${config[mode].api.host}:${config[mode].api.port}${config[mode].api.routes[0].url}`;

    try {
        const configuration = {
            headers: { "userName": 'cpc', "bankName": "Ajara", "branchName": "Uttur", "callerSystem": "FCO" }
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

    let promise = new Promise(async(resolve, reject) => {
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


        let masterUrl = `${config[mode].api.host}:${config[mode].api.port}${config[mode].api.routes[1].url}${table.ID}`

        let bearerKey = await getJWTToken();
        let configuration = {
            headers: { "Authorization": `Bearer ${bearerKey}`, "userName": `fco`, "bankName": "Ajara", "branchName": "Uttur", "callerSystem": "FCO" }
        }
        if (config[mode].api.isproxy) {
            configuration.proxy = proxy;
        }
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
        const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 10;
        rule.tz = 'Asia/Calcutta';

        console.log("inside synce")
            // const job = schedule.scheduleJob(rule, cacheMasters);
        var job = schedule.scheduleJob(" 1 1 23 * * 0", cacheMasters);
        console.log("job", job)
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

exports.onBoardCustomer = async(req, res) => {
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
            return res.status(404).send({
                code: 404,
                message: 'Applicant not found'
            });
        }

        if (guardianR) {
            guardianR.APPLICANTS_DATA =
                (basicR['APPLICANTS_DATA'] || []).find(v => v.APPLICANT_NO == guardianR.APPLICANT_NO) || null;
        }

        const account_opening_data = {
            "custobj": {
                "reg_mobileno": personalR?.MOBILE_NUMBER,
                "reg_emailid": personalR?.EMAIL_ID,
                "introbranch": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
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
                "idtproofid": Number(personalR?.ID_PROOF || 0),
                "idtproofidno": personalR?.ID_PROOF_NUMBER,
                "proofdetailsid": Number(personalR?.PERMANENT_ADDRESS_PROOF || 0),
                "addproofidno": personalR?.PERMANENT_ADDRESS_PROOF_NUMBER,
                "riskcat": Number(personalR?.RISK_CATEGORY || 0),
                "panno": personalR?.PAN_NO,
                "fatherspouse": personalR?.FATHER_OR_SPOUSE,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "religion": Number(personalR?.RELIGION || 0),
                "caste": Number(personalR?.CASTE || 0),
                "fatherlnm": personalR?.F_OR_H_LAST_NAME,
                "fatherfnm": personalR?.F_OR_H_FIRST_NAME,
                "fathermnm": personalR?.F_OR_H_MIDDLE_NAME,
                "motherlname": personalR?.MOTHERS_LAST_NAME,
                "motherfname": personalR?.MOTHERS_NAME,
                "mothermname": personalR?.MOTHERS_MIDDLE_NAME,
                "mothertitle": personalR?.MOTHER_TITLE,
                "issuiddocplace": basicR.DOCUMENTS_ISSUE_PLACE,
                "iddocissuauth": basicR.DOCUMENTS_AUTHORITY,
                "maritalstatus": personalR?.MARITAL_STATUS,
                "caste_code": Number(personalR?.CASTE || 0),
                "guardianid": (personalR?.IS_MINOR && guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? guardianR.APPLICANTS_DATA.CUSTOMER_ID : null
            },
            "custgurobj": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : {
                "reg_mobileno": guardianR?.MOBILE_NUMBER,
                "reg_emailid": guardianR?.EMAIL_ID,
                "introbranch": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "typeofcustomer": 1,
                "annualincome": guardianFinanceR?.INCOME?.toString() || "0",
                "smssubscription": serviceR?.SMS_ALERT ? "Y" : "N",
                "middlename": guardianR?.MIDDLE_NAME,
                "firstname": guardianR?.FIRST_NAME,
                "lastname": guardianR?.LAST_NAME,
                "createdfor": "A",
                "minor": guardianR?.IS_MINOR ? "Y" : "N",
                "birthdate": guardianR?.DATE_OF_BIRTH ? convertDate(guardianR.DATE_OF_BIRTH) : null,
                "gender": guardianR?.GENDER,
                "occupationid": Number(guardianR?.PROFESSION || 0),
                "title": basicR.CUSTOMER_TYPE_1,
                "idtproofid": Number(guardianR?.ID_PROOF || 0),
                "idtproofidno": guardianR?.ID_PROOF_NUMBER,
                "proofdetailsid": Number(guardianR?.PERMANENT_ADDRESS_PROOF || 0),
                "addproofidno": guardianR?.PERMANENT_ADDRESS_PROOF_NUMBER,
                "riskcat": Number(guardianR?.RISK_CATEGORY || 0),
                "panno": guardianR?.PAN_NO,
                "fatherspouse": guardianR?.FATHER_OR_SPOUSE,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "religion": Number(guardianR?.RELIGION || 0),
                "caste": Number(guardianR?.CASTE || 0),
                "fatherlnm": guardianR?.F_OR_H_LAST_NAME,
                "fatherfnm": guardianR?.F_OR_H_FIRST_NAME,
                "fathermnm": guardianR?.F_OR_H_MIDDLE_NAME,
                "motherlname": guardianR?.MOTHERS_LAST_NAME,
                "motherfname": guardianR?.MOTHERS_NAME,
                "mothermname": guardianR?.MOTHERS_MIDDLE_NAME,
                "mothertitle": guardianR?.MOTHER_TITLE,
                "issuiddocplace": basicR.DOCUMENTS_ISSUE_PLACE,
                "iddocissuauth": basicR.DOCUMENTS_AUTHORITY,
                "maritalstatus": guardianR?.MARITAL_STATUS,
                "caste_code": Number(guardianR?.CASTE || 0)
            },
            "acopn_hdr_obj": null,
            "acopn_tlr_obj": null,
            "addobj_P": {
                "addresstype": "P",
                "emailid": personalR?.EMAIL_ID,
                "countryid": 1,
                "stateid": await getStateCode(pool, personalR?.PERMANENT_STATE),
                "districtid": await getDistCode(pool, personalR?.PERMANENT_DISTRICT),
                "talukaid": await getTalukaCode(pool, personalR?.PERMANENT_TALUKA),
                "cityid": await getCityCode(pool, personalR?.PERMANENT_CITY),
                "areaid": await getAreaCode(pool, personalR?.PERMANENT_AREA),
                "mobile": personalR?.MOBILE_NUMBER,
                "pincode": personalR?.PERMANENT_PINCODE,
                "regionid": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "addressline1": `${personalR?.PERMANENT_ADDRESS} ${personalR?.PERMANENT_LANDMARK}`
            },
            "addobj_C": {
                "addresstype": "C",
                "countryid": 1,
                "stateid": await getStateCode(pool, personalR?.CURRENT_STATE),
                "districtid": await getDistCode(pool, personalR?.CURRENT_DISTRICT),
                "talukaid": await getTalukaCode(pool, personalR?.CURRENT_TALUKA),
                "cityid": await getCityCode(pool, personalR?.CURRENT_CITY),
                "areaid": await getAreaCode(pool, personalR?.CURRENT_AREA),
                "regionid": 1,
                "mobile": personalR?.MOBILE_NUMBER,
                "pincode": personalR?.CURRENT_PINCODE,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "addressline1": `${personalR?.CURRENT_ADDRESS} ${personalR?.CURRENT_LANDMARK}`
            },
            "addobj_O": {
                "addresstype": "O",
                "countryid": 1,
                "stateid": await getStateCode(pool, personalR?.OFFICE_STATE),
                "districtid": await getDistCode(pool, personalR?.OFFICE_DISTRICT),
                "talukaid": await getTalukaCode(pool, personalR?.OFFICE_TALUKA),
                "cityid": await getCityCode(pool, personalR?.OFFICE_CITY),
                "areaid": await getAreaCode(pool, personalR?.OFFICE_AREA),
                "regionid": 1,
                "mobile": personalR?.MOBILE_NUMBER,
                "pincode": personalR?.OFFICE_PINCODE,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "addressline1": `${personalR?.OFFICE_ADDRESS} ${personalR?.OFFICE_LANDMARK}`
            },
            "addobjgur_P": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : {
                "addresstype": "P",
                "emailid": guardianR?.EMAIL_ID,
                "countryid": 1,
                "stateid": await getStateCode(pool, guardianR?.PERMANENT_STATE),
                "districtid": await getDistCode(pool, guardianR?.PERMANENT_DISTRICT),
                "talukaid": await getTalukaCode(pool, guardianR?.PERMANENT_TALUKA),
                "cityid": await getCityCode(pool, guardianR?.PERMANENT_CITY),
                "areaid": await getAreaCode(pool, guardianR?.PERMANENT_AREA),
                "mobile": guardianR?.MOBILE_NUMBER,
                "pincode": guardianR?.PERMANENT_PINCODE,
                "regionid": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "addressline1": `${guardianR?.PERMANENT_ADDRESS} ${guardianR?.PERMANENT_LANDMARK}`
            },
            "addobjgur_C": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : {
                "addresstype": "C",
                "countryid": 1,
                "stateid": await getStateCode(pool, guardianR?.CURRENT_STATE),
                "districtid": await getDistCode(pool, guardianR?.CURRENT_DISTRICT),
                "talukaid": await getTalukaCode(pool, guardianR?.CURRENT_TALUKA),
                "cityid": await getCityCode(pool, guardianR?.CURRENT_CITY),
                "areaid": await getAreaCode(pool, guardianR?.CURRENT_AREA),
                "regionid": 1,
                "mobile": guardianR?.MOBILE_NUMBER,
                "pincode": guardianR?.CURRENT_PINCODE,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "addressline1": `${guardianR?.CURRENT_ADDRESS} ${guardianR?.CURRENT_LANDMARK}`
            },
            "addobjgur_O": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : {
                "addresstype": "O",
                "countryid": 1,
                "stateid": await getStateCode(pool, guardianR?.OFFICE_STATE),
                "districtid": await getDistCode(pool, guardianR?.OFFICE_DISTRICT),
                "talukaid": await getTalukaCode(pool, guardianR?.OFFICE_TALUKA),
                "cityid": await getCityCode(pool, guardianR?.OFFICE_CITY),
                "areaid": await getAreaCode(pool, guardianR?.OFFICE_AREA),
                "regionid": 1,
                "mobile": guardianR?.MOBILE_NUMBER,
                "pincode": guardianR?.OFFICE_PINCODE,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "addressline1": `${guardianR?.OFFICE_ADDRESS} ${guardianR?.OFFICE_LANDMARK}`
            },
            "kyccomobj": {
                "kcc_status": "F",
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID)
            },
            "kyccompdtlrobj": {
                "kcd_addproff": Number(personalR?.PERMANENT_ADDRESS_PROOF || 0),
                "kcd_addidno": personalR?.PERMANENT_ADDRESS_PROOF_NUMBER,
                "kcd_idproof": Number(personalR?.ID_PROOF || 0),
                "kcd_ididno": personalR?.ID_PROOF_NUMBER,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID)
            },
            "kyccomgurobj": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : {
                "kcc_status": "F",
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID)
            },
            "kyccompdtlrgurobj": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : {
                "kcd_addproff": Number(guardianR?.PERMANENT_ADDRESS_PROOF || 0),
                "kcd_addidno": guardianR?.PERMANENT_ADDRESS_PROOF_NUMBER,
                "kcd_idproof": Number(guardianR?.ID_PROOF || 0),
                "kcd_ididno": guardianR?.ID_PROOF_NUMBER,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID)
            },
            ...await getCurrent(req, basicR, serviceR, depositR),
            ...await getJoin(req, basicR, serviceR, depositR),

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
                "entryuser": await getUserNameByID(pool, basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(pool, basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(pool, basicR.VERIFIER_USER_ID),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "acctobeopn_atbrncd": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "accopendt": '15-10-2025 00:00:00',
                "opnormdf": "A"
            },
            "accdtl_obj": {
                "schemecode": Number(depositR?.SCHEME_CODE || 0),
                "changeno": 1,
                "bankcode": 1,
                "checkbookfacility": serviceR?.CHEQUE_BOOK ? "Y" : "N",
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "acctobeopn_atbrncd": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID)
            },
            "docdtl_obj": {
                "schemecode": Number(depositR?.SCHEME_CODE || 0),
                "docid": 1,
                "changeno": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "acctobeopn_atbrncd": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID)
            },
            "acnomobj": nomineeR ? {
                "and_nominame": nomineeR.NOMINEE_NAME,
                "and_nominaddrs": nomineeR.NOMINEE_ADDRESS,
                "and_relation": Relation(nomineeR.RELATION),
                "and_dtofbirth": convertDate(nomineeR.DOB),
                "brncode": await getBranchFromCBS(pool, basicR.CREATED_BRANCH_ID),
                "and_caretaker": `${nomineeR.APONITED_NAME}  ${nomineeR.APONITED_ADDRESS}`
            } : null,
            "m_kcd_iddocimage": await getDocument('Applicant ID Proof', documentR),
            "m_kcd_adddocimage": await getDocument('Applicant Address Proof', documentR),
            "m_kcd_photo": await getDocument('Applicant Photo', documentR),
            "m_kcd_sign": await getDocument('Signature', documentR),

            "m_kcd_photo_gur": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : await getDocument('Applicant Photo', guardianDocumentR),
            "m_kcd_iddocimage_gur": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : await getDocument('Applicant ID Proof', guardianDocumentR),
            "m_kcd_adddocimage_gur": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : await getDocument('Applicant Address Proof', guardianDocumentR),
            "m_kcd_sign_gur": (!personalR?.IS_MINOR || guardianR?.APPLICANTS_DATA?.IS_OLD_CUSTOMER) ? null : await getDocument('Signature', guardianDocumentR)
        }

        const posturl = `${config[mode].api.host}:${config[mode].api.port}${config[mode].api.routes[3].url}`
        const bearerKey = await getJWTToken(req);

        if (basicR.IS_OLD_CUSTOMER_1) {
            account_opening_data.custobj.customerid = basicR.CUSTOMER_ID_1;
        }
        if (personalR?.AADHAAR_NUMBER) {
            account_opening_data.custobj.custuin = personalR.AADHAAR_NUMBER;
        }
        if (account_opening_data.custobj_join != null || account_opening_data.custobj_const != null) {
            account_opening_data.acmst_obj.jointacc = 'Y'
        }

        const configuration = {
            headers: { "Authorization": `Bearer ${bearerKey}`, "userName": 'cpc', "bankName": "Ajara", "branchName": "Uttur", "callerSystem": "FCO" }
        }
        if (config[mode].api.isproxy) {
            configuration.proxy = proxy;
        }

        const accountCreatedData = await axios.post(posturl, account_opening_data, configuration)

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

        if (account_opening_data.custobj_join != null) {
            const customer_ids = accountCreatedData.data['Customer Code'].split(",");
            const primary_applicant = customer_ids[0];
            const other_ids = customer_ids[1].split("-")[1].split(',');
            const APPLICANT_DATA = basicR['APPLICANT_DATA'] || [];

            for (let i = 0; i < APPLICANT_DATA.length; i++) {
                if (other_ids[i]) APPLICANT_DATA[i].CUSTOMER_ID = other_ids[i];
            }

            basicUpdateQ = `update basic_details set ACCOUNT_NUMBER = ?, CUSTOMER_ID_1 = ?, APPLICANT_DATA = ? where ID = ?`
            basicUpdateParams = [accountCreatedData.data['Account number'], primary_applicant, JSON.stringify(APPLICANT_DATA), applicant_id];
        }

        if (account_opening_data.custobj_const != null) {
            const customer_ids = accountCreatedData.data['Customer Code'].split(",");
            const primary_applicant = customer_ids[0];
            const other_ids = customer_ids[1].split("-")[1].split(',');
            const APPLICANT_DATA = basicR['APPLICANT_DATA'] || [];

            for (let i = 0; i < APPLICANT_DATA.length; i++) {
                if (other_ids[i]) APPLICANT_DATA[i].CUSTOMER_ID = other_ids[i];
            }

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
        console.error('❌ onBoardCustomer error:', error);
        res.status(400).send({
            "code": 400,
            "message": "Failed",
            "error": error.message || error
        })
    }

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
            "introbranch": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
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
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(pool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(pool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(pool, basic_details.VERIFIER_USER_ID),
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
            "stateid": await getStateCode(pool, customer.PERMANENT_STATE),
            "districtid": await getDistCode(pool, customer.PERMANENT_DISTRICT),
            "talukaid": await getTalukaCode(pool, customer.PERMANENT_TALUKA),
            "cityid": await getCityCode(pool, customer.PERMANENT_CITY),
            "areaid": await getAreaCode(pool, customer.PERMANENT_AREA),
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.PERMANENT_PINCODE,
            "regionid": 1,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(pool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(pool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(pool, basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.PERMANENT_ADDRESS} ${customer.PERMANENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const c_add = {
            "addresstype": "C",
            "countryid": 1,
            "stateid": await getStateCode(pool, customer.CURRENT_STATE),
            "districtid": await getDistCode(pool, customer.CURRENT_DISTRICT),
            "talukaid": await getTalukaCode(pool, customer.CURRENT_TALUKA),
            "cityid": await getCityCode(pool, customer.CURRENT_CITY),
            "areaid": await getAreaCode(pool, customer.CURRENT_AREA),
            "regionid": 1,
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.CURRENT_PINCODE,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
            "entryuser": await getUserNameByID(pool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(pool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(pool, basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.CURRENT_ADDRESS} ${customer.CURRENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_1 = {
            "kcc_status": "F",
            "entryuser": await getUserNameByID(pool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(pool, basic_details.CHACKER_USER_ID),
            "bankcode": 1,
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_2 = {
            "kcd_addproff": Number(customer.PERMANENT_ADDRESS_PROOF || 0),
            "kcd_addidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "kcd_idproof": Number(customer.ID_PROOF || 0),
            "kcd_ididno": customer.ID_PROOF_NUMBER,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
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
            "introbranch": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
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
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(pool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(pool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(pool, basic_details.VERIFIER_USER_ID),
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
            "stateid": await getStateCode(pool, customer.PERMANENT_STATE),
            "districtid": await getDistCode(pool, customer.PERMANENT_DISTRICT),
            "talukaid": await getTalukaCode(pool, customer.PERMANENT_TALUKA),
            "cityid": await getCityCode(pool, customer.PERMANENT_CITY),
            "areaid": await getAreaCode(pool, customer.PERMANENT_AREA),
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.PERMANENT_PINCODE,
            "regionid": 1,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(pool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(pool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(pool, basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.PERMANENT_ADDRESS} ${customer.PERMANENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const c_add = {
            "addresstype": "C",
            "countryid": 1,
            "stateid": await getStateCode(pool, customer.CURRENT_STATE),
            "districtid": await getDistCode(pool, customer.CURRENT_DISTRICT),
            "talukaid": await getTalukaCode(pool, customer.CURRENT_TALUKA),
            "cityid": await getCityCode(pool, customer.CURRENT_CITY),
            "areaid": await getAreaCode(pool, customer.CURRENT_AREA),
            "regionid": 1,
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.CURRENT_PINCODE,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
            "entryuser": await getUserNameByID(pool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(pool, basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(pool, basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.CURRENT_ADDRESS} ${customer.CURRENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_1 = {
            "kcc_status": "F",
            "entryuser": await getUserNameByID(pool, basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(pool, basic_details.CHACKER_USER_ID),
            "bankcode": 1,
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_2 = {
            "kcd_addproff": Number(customer.PERMANENT_ADDRESS_PROOF || 0),
            "kcd_addidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "kcd_idproof": Number(customer.ID_PROOF || 0),
            "kcd_ididno": customer.ID_PROOF_NUMBER,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(pool, basic_details.CREATED_BRANCH_ID),
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
    let dateArr = date.split("/");

    // let converted_date = new Date(dateArr[2], dateArr[1], dateArr[0], 0, 0, 0)

    let converted_date = `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}`

    console.log("Date :", converted_date);

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

async function getUserNameByID(pool, id) {
    try {
        if (!id) return '-';
        const [rows] = await pool.promise().query('select CBS_USER_NAME from user_master where ID = ?', [id]);
        return (rows.length > 0 && rows[0].CBS_USER_NAME) ? rows[0].CBS_USER_NAME : '-';
    } catch (error) {
        return '-';
    }
}

// exports.getMasters = async(req, res) => {

//     try {

//         if (!connection) {
//             await connect();
//         }


//         let masterCode = req.body.code;
//         let filter = req.body.filter;

//         let masterQ = `select NAME from masters_list where ID = ${masterCode}`

//         let [masterR, masterF] = await connection.execute(masterQ, '');

//         console.log("userR", masterR);

//         let table_name = ``

//         if (masterR.length > 0) {
//             if (masterR[0].NAME) {
//                 table_name = masterR[0].NAME;

//                 let getMasterQ = `select * from ${table_name} where 1 ${filter}`

//                 let [result, resultF] = await connection.query(getMasterQ);

//                 res.send({
//                     "code": 200,
//                     "data": result
//                 })

//             } else {
//                 res.send({
//                     "code": 200,
//                     "message": "no data",
//                     "data": []
//                 });
//             }

//         } else {
//             res.send({
//                 "code": 200,
//                 "message": "no data",
//                 "data": []
//             })
//         }
//     } catch (error) {
//         console.log(error);
//         res.send({
//             "code": 400,
//             "message": "failed"
//         })
//     }


// }

exports.getMasters = async(req, res) => {
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
exports.getCustomer = async(req, res) => {
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


        let getCustomer = `${config[mode].api.host}:${config[mode].api.port}${config[mode].api.routes[2].url}${search_key}=${search_value}`

        let bearerKey = await getJWTToken(req);

        let configuration = {
            headers: { "Authorization": `Bearer ${bearerKey}`, "userName": `ajara.ba`, "bankName": "Ajara", "branchName": "Uttur", "callerSystem": "FCO" }
        }
        if (config[mode].api.isproxy) {
            configuration.proxy = proxy;
        }

        let customerData = await getRequest(getCustomer, configuration);

        console.log("customerData", customerData);


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

            ALREADY_EXIST: customerData['Having individual account']

            // STATE: '',
            // DISTRICT: '',
            // TALUKA: '',
            // CITY: '',
            // AREA: '',
            // PINCODE: ''
        }

        if (customerData) {
            res.send({
                "code": 200,
                "message": "fetched",
                "original_data": customerData,
                "data": res_body
            })
        } else {
            res.send({
                "code": 404,
                "message": "no customer"
            })
        }


        // {
        //     "Customer Details": {
        //         "CHANGEDATE": "31-01-2024 00:00:00",
        //         "CUSTUIN": "111111111111",
        //         "RISKCAT": "1",
        //         "ENTRYUSER": "LIST",
        //         "FIRSTNAME": "P",
        //         "ENTRYDATE": "31-01-2024 00:00:00",
        //         "FATHERLNM": "KULKARNI",
        //         "MIDDLENAME": "A",
        //         "REC_ID": "634136",
        //         "REG_MOBILENO": "9764074605",
        //         "INTROBRANCH": "101",
        //         "FATHERFNM": "A",
        //         "LASTNAME": "KULKARNI",
        //         "IDTPROOFIDNO": "BHAPG1234Q",
        //         "GOVAUTH_SCRNG": "Y",
        //         "SHORTNAME": "KULK_PA",
        //         "PROOFDETAILSID": "1",
        //         "CUSTCDOLDSTYL": "KPA0000005",
        //         "TDSAPPLICABLE": "Y",
        //         "ENTRYSTATUS": "F",
        //         "MINOR": "N",
        //         "BIRTHDATE": "16-10-1991 00:00:00",
        //         "TYPEOFCUSTOMER": "1",
        //         "FATHERMNM": "G",
        //         "CREATEDDATE": "31-01-2024 01:24:30",
        //         "CUSTOMERID": "0000103962",
        //         "OCCUPATIONID": "1",
        //         "SCN_NO": "1103396",
        //         "MARITALSTATUS": "M",
        //         "BRNCODE": "101",
        //         "MOTHERFNAME": "A",
        //         "GENDER": "F",
        //         "IDTPROOFID": "1",
        //         "KYCSRNO": "7228",
        //         "AUTHDATE": "31-01-2024 01:24:30",
        //         "PEP_CUST": "Y",
        //         "AUTHUSER": "LIST",
        //         "TEMPCUSTID": "85295",
        //         "INTRODUCTIONMODE": "1",
        //         "ADDPROOFIDNO": "1111",
        //         "FATHERSPOUSE": "S",
        //         "INTRODATE": "31-01-2024 00:00:00",
        //         "CREATEDFOR": "A",
        //         "MOTHERMNAME": "A",
        //         "INTROVERIFIEDBY": "LIST",
        //         "BANKCODE": "1",
        //         "FREEZCUST": "N",
        //         "CHANGENO": "1",
        //         "STAFF": "N",
        //         "PANNO": "BHAPG1234Q",
        //         "TITLE": "MRS",
        //         "MOTHERLNAME": "KULKARNI"
        //     },
        //     "Address Details": [
        //         {
        //             "ENTRYSTATUS": "F",
        //             "CHANGEDATE": "31-01-2024 00:00:00",
        //             "ADDRESSTYPE": "P",
        //             "CITYSERVEYNO": "11",
        //             "CITYID": "1",
        //             "VERIFIEDDATE": "31-01-2024 00:00:00",
        //             "ENTRYUSER": "LIST",
        //             "ENTRYDATE": "31-01-2024 00:00:00",
        //             "DISTRICTID": "1",
        //             "PINCODE": "416416",
        //             "FLOORNO": "1",
        //             "REGIONID": "1",
        //             "CUSTOMERID": "0000103962",
        //             "REC_ID": "761639",
        //             "SCN_NO": "1785820",
        //             "BRNCODE": "101",
        //             "SEQUENCENO": "1",
        //             "AUTHDATE": "31-01-2024 01:24:29",
        //             "AUTHUSER": "LIST",
        //             "CREATEDBRANCH": "0",
        //             "VERIFIEDBY": "LIST",
        //             "TEMPCUSTID": "85295",
        //             "COUNTRYID": "1",
        //             "AREAID": "1",
        //             "FLATPLOTNO": "1",
        //             "LANDMARK": "aa",
        //             "BANKCODE": "1",
        //             "CHANGENO": "1",
        //             "ADDRESSLINE1": "aa",
        //             "STREETNAME": "aa",
        //             "STATEID": "17",
        //             "APARTMENTBUILDING": "aa",
        //             "TALUKAID": "1"
        //         }
        //     ],
        //     "Having individual account:": "Y",
        //     "KYC Details": {
        //         "KCC_AUTHDT": "31-01-2024 00:00:00",
        //         "KCD_IDPROOF": "1",
        //         "KCC_SRNO": "7228",
        //         "KCC_BRNSRNO": "6960",
        //         "KCD_ADDPROFF": "1",
        //         "KCC_DATE": "31-01-2024 00:00:00",
        //         "KCC_STATUS": "A",
        //         "KCC_ENTRYBY": "LIST",
        //         "KCC_NEXTVALIDATIONDT": "31-01-2034 00:00:00",
        //         "KCC_ENTRYDT": "31-01-2024 00:00:00",
        //         "KCC_CONFBY": "LIST",
        //         "KCD_IDIDNO": "BHAPG1234Q",
        //         "KCC_CONFDT": "2024-01-31 00:00:00",
        //         "KCC_CUSTID": "0000103962",
        //         "KCD_SRNO": "7228",
        //         "KYC_TYPE": "N",
        //         "KCC_AUTHBY": "LIST",
        //         "KCC_ENTINBRANCH": "101",
        //         "KCD_ADDIDNO": "1111"
        //     }
        // }
    } catch (error) {
        console.log(error);
        res.send({
            "code": 400,
            "error": error
        })
    }

}