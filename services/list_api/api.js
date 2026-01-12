const mysql = require('mysql2/promise');
const config = require('./config').config
const axios = require('axios');
const db = require('../../utilities/dbModule');
const fs = require('fs/promises')
const schedule = require('node-schedule')
let connection

const mode = config.mode;

function connect() {
    let promise = new Promise(async(resolve, reject) => {
        try {
            const database = {
                user: config[mode].database_config.user,
                password: config[mode].database_config.password,
                database: config[mode].database_config.database_name,
                host: config[mode].database_config.host,
                port: config[mode].database_config.port,
                namedPlaceholders: true
            }
            connection = await mysql.createConnection(database);

            resolve(connection)
        } catch (error) {
            // console.log(error);
            reject(error);
        }

    })

    return promise;
}


let proxy = {
    host: '127.0.0.1',
    port: 8080
}


async function getJWTToken() {

    if (!connection) {
        await connect();
    }

    let maxID

    const table = `jwt_token`;

    let get_max_id = `SELECT ID FROM ${table} ORDER BY ID DESC LIMIT 0, 1`;

    let token = ``

    let promise = new Promise(async(resolve, reject) => {
        try {
            let [max_query_result, max_query_fields] = await connection.execute(get_max_id);

            if (max_query_result.length > 0) {
                // console.log(max_query_result);
                maxID = max_query_result[0].ID;
                let get_query = `select TOKEN from ${table} where ID = ${maxID} AND IS_EXPIRED = 0;`
                let [get_token_result, get_token_fields] = await connection.execute(get_query);

                if (get_token_result.length > 0) {
                    token = get_token_result[0].TOKEN;
                    resolve(token);
                } else {
                    token = await generateToken()
                    resolve(token);
                }
            } else {
                token = await generateToken()
                resolve(token);
            }
        } catch (error) {
            // console.log(error);
            reject(error);
        }
    });

    return promise;
}


async function generateToken() {
    const table = `jwt_token`;

    if (!connection) {
        await connect();
    }

    setData = {
        CREATED_DATE: '22/10/2023',
        TOKEN: '',
        IS_EXPIRED: 0
    }

    let tokenurl = `${config[mode].api.host}:${config[mode].api.port}${config[mode].api.routes[0].url}`

    let promise = new Promise(async(resolve, reject) => {
        try {


            let configuration = {
                headers: { "userName": 'cpc', "bankName": "Ajara", "branchName": "Uttur", "callerSystem": "FCO" }
            }
            if (config[mode].api.isproxy) {
                configuration.proxy = proxy;
            }
            let token_result = await getRequest(tokenurl, configuration);

            let token = token_result.token;

            setData.TOKEN = token;
            console.log("real token", token, setData)

            let insert_query = `insert into ${table} set CREATED_DATE = '${setData.CREATED_DATE}', TOKEN = '${setData.TOKEN}' ,IS_EXPIRED = '${setData.IS_EXPIRED}'`;

            await connection.execute(insert_query, );

            resolve(token);

        } catch (error) {
            // console.log(error)
            reject(error);
        }
    });

    return promise;
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
        let applicant_id = req.body.APPLICANT_ID;

        if (!connection) {
            await connect();
        }

        let basicT = `basic_details`
        let personalT = `applicants_personal_details`
        let depositT = `term_deposite`
        let serviceT = `facilities`
        let documentT = `applicant_documents`
        let financeT = `financial_information`
        let nomineeT = `nominee_details`

        let basicQ = `select * from ${basicT} where ID = ${applicant_id};`;
        let personalQ = `select * from ${personalT} where APPLICANT_ID = ${applicant_id} AND APPLICANT_NO = 1;`;
        let depositQ = `select * from ${depositT} where APPLICANT_ID = ${applicant_id};`;
        let documentQ = `select * from ${documentT} where APPLICANT_ID = ${applicant_id} AND APPLICANT_NO = 1;`;
        let serviceQ = `select * from ${serviceT} where APPLICANT_ID = ${applicant_id};`;
        let financeQ = `select * from ${financeT} where APPLICANT_ID = ${applicant_id} AND APPLICANT_NO = 1;`
        let nomineeQ = `select * from ${nomineeT} where APPLICANT_ID = ${applicant_id};`

        let guardianQ = `select * from ${personalT} where APPLICANT_ID = ${applicant_id} AND APPLICANT_NO = 2;`;
        let guardianFinanceQ = `select * from ${financeT} where APPLICANT_ID = ${applicant_id} AND APPLICANT_NO = 2;`;
        let guardianDocumentQ = `select * from ${documentT} where APPLICANT_ID = ${applicant_id} AND APPLICANT_NO = 2;`;


        let [basicR, basicF] = await db.executeQuery(basicQ, '');
        let [personalR, personalF] = await db.executeQuery(personalQ, '');
        let [depositR, depositF] = await db.executeQuery(depositQ, '');
        let [serviceR, serviceF] = await db.executeQuery(serviceQ, '');
        let [financeR, financeF] = await db.executeQuery(financeQ, '');
        let documentR = await db.executeQuery(documentQ, '');
        let [nomineeR, nomineeF] = await db.executeQuery(nomineeQ, '');

        let [guardianR, guardianF] = await db.executeQuery(guardianQ, '');
        let [guardianFinanceR, guardianFinanceF] = await db.executeQuery(guardianFinanceQ, '');
        let guardianDocumentR = await db.executeQuery(guardianDocumentQ, '');

        console.log("basicR", basicR);
        console.log("personalR", personalR);
        console.log("depositR", depositR);
        console.log("documentR", documentR);
        console.log("nomineeR", nomineeR);
        console.log("guardianR", guardianR);
        console.log("guardianFinanceR", guardianFinanceR);
        console.log("guardianDocumentR", guardianDocumentR);

        // guardianR["APPLICANTS_DATA"] = basicR['APPLICANTS_DATA'].find((val) => val.APPLICANT_NO == guardianR["APPLICANT_NO"]);


        if (guardianR && guardianR.length === 1) {
            guardianR[0].APPLICANTS_DATA =
                basicR['APPLICANTS_DATA'].find(v => v.APPLICANT_NO == guardianR[0].APPLICANT_NO) || null;
        }

        let account_opening_data = {
            "custobj": {
                "reg_mobileno": personalR.MOBILE_NUMBER,
                "reg_emailid": personalR.EMAIL_ID,
                "introbranch": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "typeofcustomer": 1,
                "annualincome": financeR.INCOME.toString(),
                "smssubscription": serviceR.SMS_ALERT ? "Y" : "N",
                "middlename": personalR.MIDDLE_NAME,
                "firstname": personalR.FIRST_NAME,
                "lastname": personalR.LAST_NAME,
                "createdfor": "A",
                "minor": personalR.IS_MINOR ? "Y" : "N",
                "birthdate": convertDate(personalR.DATE_OF_BIRTH),
                "gender": personalR.GENDER,
                "occupationid": Number(personalR.PROFESSION),
                "title": basicR.CUSTOMER_TYPE_1,
                "idtproofid": Number(personalR.ID_PROOF),
                "idtproofidno": personalR.ID_PROOF_NUMBER,
                "proofdetailsid": Number(personalR.PERMANENT_ADDRESS_PROOF),
                "addproofidno": personalR.PERMANENT_ADDRESS_PROOF_NUMBER,
                "riskcat": Number(personalR.RISK_CATEGORY),
                "panno": personalR.PAN_NO, //"GTFDT8976M",
                "fatherspouse": personalR.FATHER_OR_SPOUSE,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),


                //if minor is y guardian id should be provided.

                //meritial status can be provided.(value will be provided)

                //special cat should be added.

                //relgion and caste can be provided. (masters)

                //services (sms subscription) field can be provided. (y/n)

                //email id can be provided.

                //mother name title.

                //father name title.
                "religion": Number(personalR.RELIGION),
                "caste": Number(personalR.CASTE),

                "fatherlnm": personalR.F_OR_H_LAST_NAME,
                "fatherfnm": personalR.F_OR_H_FIRST_NAME,
                "fathermnm": personalR.F_OR_H_MIDDLE_NAME,

                "motherlname": personalR.MOTHERS_LAST_NAME,
                "motherfname": personalR.MOTHERS_NAME,
                "mothermname": personalR.MOTHERS_MIDDLE_NAME,
                // "subconstitution": Number(personalR.CONSTITUTION)
                // "custuin": personalR.AADHAAR_NUMBER,

                "mothertitle": personalR.MOTHER_TITLE,
                "issuiddocplace": basicR.DOCUMENTS_ISSUE_PLACE,
                "iddocissuauth": basicR.DOCUMENTS_AUTHORITY,
                "maritalstatus": personalR.MARITAL_STATUS, //married = 'M', single = 'U',Divorced:'D'
                "caste_code": Number(personalR.CASTE),
                "guardianid": personalR.IS_MINOR && guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER ? guardianR["APPLICANTS_DATA"].CUSTOMER_ID : null
            },
            "custgurobj": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : {
                "reg_mobileno": guardianR.MOBILE_NUMBER,
                "reg_emailid": guardianR.EMAIL_ID,
                "introbranch": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "typeofcustomer": 1,
                "annualincome": guardianFinanceR.INCOME.toString(),
                "smssubscription": serviceR.SMS_ALERT ? "Y" : "N",
                "middlename": guardianR.MIDDLE_NAME,
                "firstname": guardianR.FIRST_NAME,
                "lastname": guardianR.LAST_NAME,
                "createdfor": "A",
                "minor": guardianR.IS_MINOR ? "Y" : "N",
                "birthdate": convertDate(guardianR.DATE_OF_BIRTH),
                "gender": guardianR.GENDER,
                "occupationid": Number(guardianR.PROFESSION),
                "title": basicR.CUSTOMER_TYPE_1,
                "idtproofid": Number(guardianR.ID_PROOF),
                "idtproofidno": guardianR.ID_PROOF_NUMBER,
                "proofdetailsid": Number(guardianR.PERMANENT_ADDRESS_PROOF),
                "addproofidno": guardianR.PERMANENT_ADDRESS_PROOF_NUMBER,
                "riskcat": Number(guardianR.RISK_CATEGORY),
                "panno": guardianR.PAN_NO, //"GTFDT8976M",
                "fatherspouse": guardianR.FATHER_OR_SPOUSE,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),


                //if minor is y guardian id should be provided.

                //meritial status can be provided.(value will be provided)

                //special cat should be added.

                //relgion and caste can be provided. (masters)

                //services (sms subscription) field can be provided. (y/n)

                //email id can be provided.

                //mother name title.

                //father name title.
                "religion": Number(guardianR.RELIGION),
                "caste": Number(guardianR.CASTE),

                "fatherlnm": guardianR.F_OR_H_LAST_NAME,
                "fatherfnm": guardianR.F_OR_H_FIRST_NAME,
                "fathermnm": guardianR.F_OR_H_MIDDLE_NAME,

                "motherlname": guardianR.MOTHERS_LAST_NAME,
                "motherfname": guardianR.MOTHERS_NAME,
                "mothermname": guardianR.MOTHERS_MIDDLE_NAME,
                // "subconstitution": Number(guardianR.CONSTITUTION)
                // "custuin": guardianR.AADHAAR_NUMBER,

                "mothertitle": guardianR.MOTHER_TITLE,
                "issuiddocplace": basicR.DOCUMENTS_ISSUE_PLACE,
                "iddocissuauth": basicR.DOCUMENTS_AUTHORITY,
                "maritalstatus": guardianR.MARITAL_STATUS, //married = 'M', single = 'U',Divorced:'D'
                "caste_code": Number(guardianR.CASTE)
            },
            "acopn_hdr_obj": null,
            "acopn_tlr_obj": null,
            "addobj_P": {
                "addresstype": "P",
                "emailid": personalR.EMAIL_ID,
                "countryid": 1, //constant
                "stateid": await getStateCode(personalR.PERMANENT_STATE),
                "districtid": await getDistCode(personalR.PERMANENT_DISTRICT),
                "talukaid": await getTalukaCode(personalR.PERMANENT_TALUKA),
                "cityid": await getCityCode(personalR.PERMANENT_CITY),
                "areaid": await getAreaCode(personalR.PERMANENT_AREA),
                "mobile": personalR.MOBILE_NUMBER,
                "pincode": personalR.PERMANENT_PINCODE,
                "regionid": 1,
                // "sequenceno": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),
                "addressline1": `${personalR.PERMANENT_ADDRESS} ${personalR.PERMANENT_LANDMARK}`
            },
            "addobj_C": {
                "addresstype": "C",
                "countryid": 1,
                "stateid": await getStateCode(personalR.CURRENT_STATE),
                "districtid": await getDistCode(personalR.CURRENT_DISTRICT),
                "talukaid": await getTalukaCode(personalR.CURRENT_TALUKA),
                "cityid": await getCityCode(personalR.CURRENT_CITY),
                "areaid": await getAreaCode(personalR.CURRENT_AREA),
                "regionid": 1,
                "mobile": personalR.MOBILE_NUMBER,
                "pincode": personalR.CURRENT_PINCODE,
                // "sequenceno": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),
                "addressline1": `${personalR.CURRENT_ADDRESS} ${personalR.CURRENT_LANDMARK}`
            },
            "addobj_O": {
                "addresstype": "O",
                "countryid": 1,
                "stateid": await getStateCode(personalR.OFFICE_STATE),
                "districtid": await getDistCode(personalR.OFFICE_DISTRICT),
                "talukaid": await getTalukaCode(personalR.OFFICE_TALUKA),
                "cityid": await getCityCode(personalR.OFFICE_CITY),
                "areaid": await getAreaCode(personalR.OFFICE_AREA),
                "regionid": 1,
                "mobile": personalR.MOBILE_NUMBER,
                "pincode": personalR.OFFICE_PINCODE,
                // "sequenceno": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),
                "addressline1": `${personalR.OFFICE_ADDRESS} ${personalR.OFFICE_LANDMARK}`
            },
            "addobjgur_P": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : {
                "addresstype": "P",
                "emailid": guardianR.EMAIL_ID,
                "countryid": 1, //constant
                "stateid": await getStateCode(guardianR.PERMANENT_STATE),
                "districtid": await getDistCode(guardianR.PERMANENT_DISTRICT),
                "talukaid": await getTalukaCode(guardianR.PERMANENT_TALUKA),
                "cityid": await getCityCode(guardianR.PERMANENT_CITY),
                "areaid": await getAreaCode(guardianR.PERMANENT_AREA),
                "mobile": guardianR.MOBILE_NUMBER,
                "pincode": guardianR.PERMANENT_PINCODE,
                "regionid": 1,
                // "sequenceno": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "entrystatus": "F",
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),
                "addressline1": `${guardianR.PERMANENT_ADDRESS} ${guardianR.PERMANENT_LANDMARK}`
            },
            "addobjgur_C": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : {
                "addresstype": "C",
                "countryid": 1,
                "stateid": await getStateCode(guardianR.CURRENT_STATE),
                "districtid": await getDistCode(guardianR.CURRENT_DISTRICT),
                "talukaid": await getTalukaCode(guardianR.CURRENT_TALUKA),
                "cityid": await getCityCode(guardianR.CURRENT_CITY),
                "areaid": await getAreaCode(guardianR.CURRENT_AREA),
                "regionid": 1,
                "mobile": guardianR.MOBILE_NUMBER,
                "pincode": guardianR.CURRENT_PINCODE,
                // "sequenceno": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),
                "addressline1": `${guardianR.CURRENT_ADDRESS} ${guardianR.CURRENT_LANDMARK}`
            },
            "addobjgur_O": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : {
                "addresstype": "O",
                "countryid": 1,
                "stateid": await getStateCode(guardianR.OFFICE_STATE),
                "districtid": await getDistCode(guardianR.OFFICE_DISTRICT),
                "talukaid": await getTalukaCode(guardianR.OFFICE_TALUKA),
                "cityid": await getCityCode(guardianR.OFFICE_CITY),
                "areaid": await getAreaCode(guardianR.OFFICE_AREA),
                "regionid": 1,
                "mobile": guardianR.MOBILE_NUMBER,
                "pincode": guardianR.OFFICE_PINCODE,
                // "sequenceno": 1,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),
                "addressline1": `${guardianR.OFFICE_ADDRESS} ${guardianR.OFFICE_LANDMARK}`
            },
            "kyccomobj": {
                "kcc_status": "F",
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID)
            },
            "kyccompdtlrobj": {
                "kcd_addproff": Number(personalR.PERMANENT_ADDRESS_PROOF),
                "kcd_addidno": personalR.PERMANENT_ADDRESS_PROOF_NUMBER,
                "kcd_idproof": Number(personalR.ID_PROOF),
                "kcd_ididno": personalR.ID_PROOF_NUMBER,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID)
            },
            "kyccomgurobj": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : {
                "kcc_status": "F",
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID)
            },
            "kyccompdtlrgurobj": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : {
                "kcd_addproff": Number(guardianR.PERMANENT_ADDRESS_PROOF),
                "kcd_addidno": guardianR.PERMANENT_ADDRESS_PROOF_NUMBER,
                "kcd_idproof": Number(guardianR.ID_PROOF),
                "kcd_ididno": guardianR.ID_PROOF_NUMBER,
                "bankcode": 1,
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID)
            },
            ...await getCurrent(basicR, serviceR, depositR),

            ...await getJoin(basicR, serviceR, depositR),

            "acmst_obj": {
                // "interestrate": 5,

                //actype 

                //spacial catagory
                //minimum blance catagory

                //statement y/n
                //passbook y/n

                //nominee details

                //checkbook y/n
                "checkbookfacility": serviceR.CHEQUE_BOOK ? "Y" : "N",
                "schemecode": Number(depositR.SCHEME_CODE),

                "acctitle": `${personalR.LAST_NAME} ${personalR.FIRST_NAME} ${personalR.MIDDLE_NAME}`,

                "jointacc": "N",

                "constitution": Number(personalR.CONSTITUTION),

                "operinstructions": Number(depositR.ACCOUNT_OPERATION),

                "paymentinstructions": Number(depositR.PAYMENT_INSTRUCTION),

                "entrystatus": "F",
                "smssubscrbd": serviceR.SMS_ALERT ? "Y" : "N",
                "entryuser": await getUserNameByID(basicR.MAKER_USER_ID),
                "verifiedby": await getUserNameByID(basicR.CHACKER_USER_ID),
                "authuser": await getUserNameByID(basicR.VERIFIER_USER_ID),

                // "changeno": 1,

                "bankcode": 1,

                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),

                "acctobeopn_atbrncd": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),

                "accopendt": '15-10-2025 00:00:00', // generateNewDate(),

                "opnormdf": "A"
            },
            "accdtl_obj": {
                "schemecode": Number(depositR.SCHEME_CODE),

                // "serialno": 1,
                "changeno": 1,
                "bankcode": 1,

                "checkbookfacility": serviceR.CHEQUE_BOOK ? "Y" : "N",

                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "acctobeopn_atbrncd": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(basicR.CREATED_BRANCH_ID)
            },
            "docdtl_obj": {
                "schemecode": Number(depositR.SCHEME_CODE),

                "docid": 1,

                "changeno": 1,

                "bankcode": 1,

                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "acctobeopn_atbrncd": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "accopened_atbrn": await getBranchFromCBS(basicR.CREATED_BRANCH_ID)
            },
            "acnomobj": {
                "and_nominame": nomineeR.NOMINEE_NAME,
                "and_nominaddrs": nomineeR.NOMINEE_ADDRESS,
                "and_relation": Relation(nomineeR.RELATION),
                // "and_minority": "Y",
                "and_dtofbirth": convertDate(nomineeR.DOB),
                "brncode": await getBranchFromCBS(basicR.CREATED_BRANCH_ID),
                "and_caretaker": `${nomineeR.APONITED_NAME}  ${nomineeR.APONITED_ADDRESS}`
            },
            "m_kcd_iddocimage": await getDocument('Applicant ID Proof', documentR),
            "m_kcd_adddocimage": await getDocument('Applicant Address Proof', documentR),
            "m_kcd_photo": await getDocument('Applicant Photo', documentR),
            "m_kcd_sign": await getDocument('Signature', documentR),

            "m_kcd_photo_gur": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : await getDocument('Applicant Photo', guardianDocumentR),
            "m_kcd_iddocimage_gur": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : await getDocument('Applicant ID Proof', guardianDocumentR),
            "m_kcd_adddocimage_gur": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : await getDocument('Applicant Address Proof', guardianDocumentR),
            "m_kcd_sign_gur": !personalR.IS_MINOR || guardianR["APPLICANTS_DATA"].IS_OLD_CUSTOMER == true ? null : await getDocument('Signature', guardianDocumentR)
        }

        let posturl = `${config[mode].api.host}:${config[mode].api.port}${config[mode].api.routes[3].url}`

        let bearerKey = await getJWTToken();

        if (basicR.IS_OLD_CUSTOMER_1) {
            account_opening_data.custobj.customerid = basicR.CUSTOMER_ID_1;
        }
        if (personalR.AADHAAR_NUMBER) {
            account_opening_data.custobj.custuin = personalR.AADHAAR_NUMBER;
        }
        if (account_opening_data.custobj_join != null || account_opening_data.custobj_const != null) {
            account_opening_data.acmst_obj.jointacc = 'Y'
        }

        let configuration = {
            headers: { "Authorization": `Bearer ${bearerKey}`, "userName": 'cpc', "bankName": "Ajara", "branchName": "Uttur", "callerSystem": "FCO" }
        }
        if (config[mode].api.isproxy) {
            configuration.proxy = proxy;
        }

        let accountCreatedData = await axios.post(posturl, account_opening_data, configuration)

        //  "Customer Code": "1002022302, Guardian Id-1002022301",


        let basicInsertQ = `update basic_details set ACCOUNT_NUMBER =  "${accountCreatedData.data['Account number']}",CUSTOMER_ID_1 = "${accountCreatedData.data['Customer Code']}" where ID = ${applicant_id}`;

        if (personalR.IS_MINOR && depositR.ACCOUNT_TYPE == 'A') {
            const customer_ids = accountCreatedData.data['Customer Code'].split(",");
            const primary_applicant = customer_ids[0];
            const guardian_applicant = customer_ids[1].split("-")[1];
            const APPLICANT_DATA = basicR['APPLICANT_DATA'];

            APPLICANT_DATA[1].CUSTOMER_ID = guardian_applicant;

            basicInsertQ = `update basic_details set ACCOUNT_NUMBER =  "${accountCreatedData.data['Account number']}",CUSTOMER_ID_1 = "${primary_applicant}", APPLICANT_DATA = "${APPLICANT_DATA}" where ID = ${applicant_id}`
        }

        if (account_opening_data.custobj_join != null) {
            const customer_ids = accountCreatedData.data['Customer Code'].split(",");
            const primary_applicant = customer_ids[0];
            const other_ids = customer_ids[1].split("-")[1].split(',');
            const APPLICANT_DATA = basicR['APPLICANT_DATA'];

            for (let i = 0; i < APPLICANT_DATA.length; i++) {
                APPLICANT_DATA[i].CUSTOMER_ID = other_ids[i];
            }

            basicInsertQ = `update basic_details set ACCOUNT_NUMBER =  "${accountCreatedData.data['Account number']}",CUSTOMER_ID_1 = "${primary_applicant}", APPLICANT_DATA = "${APPLICANT_DATA}" where ID = ${applicant_id}`
        }

        if (account_opening_data.custobj_const != null) {
            const customer_ids = accountCreatedData.data['Customer Code'].split(",");
            const primary_applicant = customer_ids[0];
            const other_ids = customer_ids[1].split("-")[1].split(',');
            const APPLICANT_DATA = basicR['APPLICANT_DATA'];

            for (let i = 0; i < APPLICANT_DATA.length; i++) {
                APPLICANT_DATA[i].CUSTOMER_ID = other_ids[i];
            }

            basicInsertQ = `update basic_details set ACCOUNT_NUMBER =  "${accountCreatedData.data['Account number']}",CUSTOMER_ID_1 = "${primary_applicant}", APPLICANT_DATA = "${APPLICANT_DATA}" where ID = ${applicant_id}`
        }

        let basicInsertR = await db.executeQuery(basicInsertQ, '');
        console.log("Query : ", basicInsertQ, "result ", basicInsertR);
        console.log("created", accountCreatedData.data);

        res.send({
            "code": 200,
            "data": account_opening_data,
            "success_data": accountCreatedData.data
        })

        // res.send({
        //     data: account_opening_data
        // })
    } catch (error) {
        console.log(error)
        res.send({
            "code": 400,
            "message": "Failed",
            "error": error
        })
    }

}

async function getJoin(basic_details, serviceDetails, depositeDetails) {
    const query = `
    SELECT 
    per.*, fin.*
FROM
    applicants_personal_details per
        LEFT OUTER JOIN
    financial_information fin ON fin.APPLICANT_NO = per.APPLICANT_NO
        AND fin.APPLICANT_ID = per.APPLICANT_ID 
        where per.APPLICANT_NO != 1 and per.APPLICANT_ID = ${basic_details.ID}
    `;

    // APPLICANTS_DATA

    const customers = await db.executeQuery(query);

    if (basic_details.IS_MINOR == 1 || depositeDetails.ACCOUNT_TYPE != 'A') {
        console.log("inside conditions", basic_details, depositeDetails);
        return {
            "custobj_join": null,
            "custadd_join_P_obj": null,
            "custadd_join_C_obj": null,
            "kyc1_join_input": null,
            "kyc2_join_input": null
        }
    }

    for (let i = 0; i < customers.length; i++) {
        customers[i]["APPLICANTS_DATA"] = basic_details['APPLICANTS_DATA'].find((val) => val.APPLICANT_NO == customers[i]["APPLICANT_NO"]);
    }

    console.log(customers);

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
            "introbranch": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "typeofcustomer": 1,
            "annualincome": customer.INCOME.toString(),
            "smssubscription": serviceDetails.SMS_ALERT ? "Y" : "N",
            "middlename": customer.MIDDLE_NAME,
            "firstname": customer.FIRST_NAME,
            "lastname": customer.LAST_NAME,
            "createdfor": "A",
            "minor": customer.IS_MINOR ? "Y" : "N",
            "birthdate": convertDate(customer.DATE_OF_BIRTH),
            "gender": customer.GENDER,
            "occupationid": Number(customer.PROFESSION),
            "title": customer['APPLICANTS_DATA'].CUSTOMER_TYPE,
            "idtproofid": Number(customer.ID_PROOF),
            "idtproofidno": customer.ID_PROOF_NUMBER,
            "proofdetailsid": Number(customer.PERMANENT_ADDRESS_PROOF),
            "addproofidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "riskcat": Number(customer.RISK_CATEGORY),
            "panno": customer.PAN_NO, //"GTFDT8976M",
            "fatherspouse": customer.FATHER_OR_SPOUSE,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(basic_details.VERIFIER_USER_ID),

            "religion": Number(customer.RELIGION),
            "caste": Number(customer.CASTE),

            "fatherlnm": customer.F_OR_H_LAST_NAME,
            "fatherfnm": customer.F_OR_H_FIRST_NAME,
            "fathermnm": customer.F_OR_H_MIDDLE_NAME,

            "motherlname": customer.MOTHERS_LAST_NAME,
            "motherfname": customer.MOTHERS_NAME,
            "mothermname": customer.MOTHERS_MIDDLE_NAME,

            "mothertitle": customer.MOTHER_TITLE,
            "issuiddocplace": basic_details.DOCUMENTS_ISSUE_PLACE,
            "iddocissuauth": basic_details.DOCUMENTS_AUTHORITY,
            "maritalstatus": customer.MARITAL_STATUS, //married = 'M', single = 'U',Divorced:'D'
            "caste_code": Number(customer.CASTE),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const p_add = {
            "addresstype": "P",
            "emailid": customer.EMAIL_ID,
            "countryid": 1, //constant
            "stateid": await getStateCode(customer.PERMANENT_STATE),
            "districtid": await getDistCode(customer.PERMANENT_DISTRICT),
            "talukaid": await getTalukaCode(customer.PERMANENT_TALUKA),
            "cityid": await getCityCode(customer.PERMANENT_CITY),
            "areaid": await getAreaCode(customer.PERMANENT_AREA),
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.PERMANENT_PINCODE,
            "regionid": 1,
            // "sequenceno": 1,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.PERMANENT_ADDRESS} ${customer.PERMANENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const c_add = {
            "addresstype": "C",
            "countryid": 1,
            "stateid": await getStateCode(customer.CURRENT_STATE),
            "districtid": await getDistCode(customer.CURRENT_DISTRICT),
            "talukaid": await getTalukaCode(customer.CURRENT_TALUKA),
            "cityid": await getCityCode(customer.CURRENT_CITY),
            "areaid": await getAreaCode(customer.CURRENT_AREA),
            "regionid": 1,
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.CURRENT_PINCODE,
            // "sequenceno": 1,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "entryuser": await getUserNameByID(basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.CURRENT_ADDRESS} ${customer.CURRENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_1 = {
            "kcc_status": "F",
            "entryuser": await getUserNameByID(basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(basic_details.CHACKER_USER_ID),
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_2 = {
            "kcd_addproff": Number(customer.PERMANENT_ADDRESS_PROOF),
            "kcd_addidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "kcd_idproof": Number(customer.ID_PROOF),
            "kcd_ididno": customer.ID_PROOF_NUMBER,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        obj['custobj_join'].push(cust);
        obj['custadd_join_P_obj'].push(p_add);
        obj['custadd_join_C_obj'].push(c_add);
        obj['kyc1_join_input'].push(kyc_1);
        obj['kyc2_join_input'].push(kyc_2);
    }

    console.log("obj : ", obj);
    for (let o in obj) {
        if (obj[o].length == 0) {
            obj[o] = null;
        }
    }

    return obj;
}

async function getCurrent(basic_details, serviceDetails, depositeDetails) {
    const query = `
    SELECT 
    per.*, fin.*
FROM
    applicants_personal_details per
        LEFT OUTER JOIN
    financial_information fin ON fin.APPLICANT_NO = per.APPLICANT_NO
        AND fin.APPLICANT_ID = per.APPLICANT_ID 
        where per.APPLICANT_NO != 1 and per.APPLICANT_ID = ${basic_details.ID}
    `;

    // APPLICANTS_DATA

    const customers = await db.executeQuery(query);

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
        customers[i]["APPLICANTS_DATA"] = basic_details['APPLICANTS_DATA'].find((val) => val.APPLICANT_NO == customers[i]["APPLICANT_NO"]);
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
            "introbranch": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "typeofcustomer": 1,
            "annualincome": customer.INCOME.toString(),
            "smssubscription": serviceDetails.SMS_ALERT ? "Y" : "N",
            "middlename": customer.MIDDLE_NAME,
            "firstname": customer.FIRST_NAME,
            "lastname": customer.LAST_NAME,
            "createdfor": "A",
            "minor": customer.IS_MINOR ? "Y" : "N",
            "birthdate": convertDate(customer.DATE_OF_BIRTH),
            "gender": customer.GENDER,
            "occupationid": Number(customer.PROFESSION),
            "title": customers['APPLICANTS_DATA'].CUSTOMER_TYPE,
            "idtproofid": Number(customer.ID_PROOF),
            "idtproofidno": customer.ID_PROOF_NUMBER,
            "proofdetailsid": Number(customer.PERMANENT_ADDRESS_PROOF),
            "addproofidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "riskcat": Number(customer.RISK_CATEGORY),
            "panno": customer.PAN_NO, //"GTFDT8976M",
            "fatherspouse": customer.FATHER_OR_SPOUSE,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(basic_details.VERIFIER_USER_ID),

            "religion": Number(customer.RELIGION),
            "caste": Number(customer.CASTE),

            "fatherlnm": customer.F_OR_H_LAST_NAME,
            "fatherfnm": customer.F_OR_H_FIRST_NAME,
            "fathermnm": customer.F_OR_H_MIDDLE_NAME,

            "motherlname": customer.MOTHERS_LAST_NAME,
            "motherfname": customer.MOTHERS_NAME,
            "mothermname": customer.MOTHERS_MIDDLE_NAME,

            "mothertitle": customer.MOTHER_TITLE,
            "issuiddocplace": basic_details.DOCUMENTS_ISSUE_PLACE,
            "iddocissuauth": basic_details.DOCUMENTS_AUTHORITY,
            "maritalstatus": customer.MARITAL_STATUS, //married = 'M', single = 'U',Divorced:'D'
            "caste_code": Number(customer.CASTE),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const p_add = {
            "addresstype": "P",
            "emailid": customer.EMAIL_ID,
            "countryid": 1, //constant
            "stateid": await getStateCode(customer.PERMANENT_STATE),
            "districtid": await getDistCode(customer.PERMANENT_DISTRICT),
            "talukaid": await getTalukaCode(customer.PERMANENT_TALUKA),
            "cityid": await getCityCode(customer.PERMANENT_CITY),
            "areaid": await getAreaCode(customer.PERMANENT_AREA),
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.PERMANENT_PINCODE,
            "regionid": 1,
            // "sequenceno": 1,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "entrystatus": "F",
            "entryuser": await getUserNameByID(basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.PERMANENT_ADDRESS} ${customer.PERMANENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const c_add = {
            "addresstype": "C",
            "countryid": 1,
            "stateid": await getStateCode(customer.CURRENT_STATE),
            "districtid": await getDistCode(customer.CURRENT_DISTRICT),
            "talukaid": await getTalukaCode(customer.CURRENT_TALUKA),
            "cityid": await getCityCode(customer.CURRENT_CITY),
            "areaid": await getAreaCode(customer.CURRENT_AREA),
            "regionid": 1,
            "mobile": customer.MOBILE_NUMBER,
            "pincode": customer.CURRENT_PINCODE,
            // "sequenceno": 1,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "entryuser": await getUserNameByID(basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(basic_details.CHACKER_USER_ID),
            "authuser": await getUserNameByID(basic_details.VERIFIER_USER_ID),
            "addressline1": `${customer.CURRENT_ADDRESS} ${customer.CURRENT_LANDMARK}`,
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_1 = {
            "kcc_status": "F",
            "entryuser": await getUserNameByID(basic_details.MAKER_USER_ID),
            "verifiedby": await getUserNameByID(basic_details.CHACKER_USER_ID),
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
            "jhsr": (customer.APPLICANT_NO - 1)
        }

        const kyc_2 = {
            "kcd_addproff": Number(customer.PERMANENT_ADDRESS_PROOF),
            "kcd_addidno": customer.PERMANENT_ADDRESS_PROOF_NUMBER,
            "kcd_idproof": Number(customer.ID_PROOF),
            "kcd_ididno": customer.ID_PROOF_NUMBER,
            "bankcode": 1,
            "brncode": await getBranchFromCBS(basic_details.CREATED_BRANCH_ID),
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

async function getStateCode(id) {
    try {
        if (!connection) {
            connect()
        }


        let stateQ = `select STATEID from state_master where ID=${id}`;

        let [stateR, stateF] = await connection.execute(stateQ, '');

        console.log("stateR", stateR);

        if (stateR.length > 0) {
            return stateR[0].STATEID ? Number(stateR[0].STATEID) : 1;
        } else {
            return 1;
        }
    } catch (error) {
        console.log(error);
        return 1;

    }
}

async function getDistCode(id) {
    try {
        if (!connection) {
            connect()
        }

        let distQ = `select DISTRICTID from district_master where ID=${id}`;

        let [distR, distF] = await connection.execute(distQ, '');

        console.log("distR", distR);

        if (distR.length > 0) {
            return distR[0].DISTRICTID ? Number(distR[0].DISTRICTID) : 1;
        } else {
            return 1;
        }
    } catch (error) {
        return 1;
    }
}

async function getTalukaCode(id) {
    try {
        if (!connection) {
            connect()
        }

        let talukaQ = `select TALUKAID from taluka_master where ID=${id}`;

        let [talukaR, talukaF] = await connection.execute(talukaQ, '');

        console.log("talukaR", talukaR);

        if (talukaR.length > 0) {
            return talukaR[0].TALUKAID ? Number(talukaR[0].TALUKAID) : 1;
        } else {
            return 1;
        }
    } catch (error) {
        return 1;
    }
}

async function getCityCode(id) {
    try {
        if (!connection) {
            connect()
        }

        let cityQ = `select CITYID from city_master where ID=${id}`;

        let [cityR, cityF] = await connection.execute(cityQ, '');

        console.log("cityR", cityR);

        if (cityR.length > 0) {
            return cityR[0].CITYID ? Number(cityR[0].CITYID) : 1;
        } else {
            return 1;
        }
    } catch (error) {
        return 1;
    }
}

async function getAreaCode(id) {
    try {
        if (!connection) {
            connect()
        }

        let areaQ = `select AREAID from address_master where ID=${id}`;

        let [areaR, areaF] = await connection.execute(areaQ, '');

        console.log("areaR", areaR);

        if (areaR.length > 0) {
            return areaR[0].AREAID ? Number(areaR[0].AREAID) : 1;
        } else {
            return 1;
        }
    } catch (error) {
        return 1;
    }
}

async function getBranchFromCBS(branchID) {
    let branchQ = `select BRANCH_CODE from branch_master where ID  = ${branchID}`;

    let [branchR, branchF] = await db.executeQuery(branchQ, '');

    console.log("branchR", branchR);

    if (branchR) {
        return branchR.BRANCH_CODE ? Number(branchR.BRANCH_CODE) : 1;
    } else {
        return 1;
    }

}

async function getUserNameByID(id) {
    let getUserQ = `select CBS_USER_NAME from user_master where ID = ${id}`;

    let [userR, userF] = await db.executeQuery(getUserQ, '');

    console.log("userR", userR);

    if (userR) {
        return userR.CBS_USER_NAME ? userR.CBS_USER_NAME : '-';
    } else {
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

        let bearerKey = await getJWTToken();

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