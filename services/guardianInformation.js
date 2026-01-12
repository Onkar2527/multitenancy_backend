const db = require('../utilities/dbModule');


function reqData(req) {

    let data = {
        APPLICANT_ID: req.body.APPLICANT_ID,
        APPLICANT_NO: req.body.APPLICANT_NO,
          FIRST_NAME: req.body.FIRST_NAME,
        MIDDLE_NAME: req.body.MIDDLE_NAME,
        LAST_NAME: req.body.LAST_NAME,
        F_OR_H_FIRST_NAME: req.body.F_OR_H_FIRST_NAME,
        F_OR_H_MIDDLE_NAME: req.body.F_OR_H_MIDDLE_NAME,
        F_OR_H_LAST_NAME: req.body.F_OR_H_LAST_NAME,
        CURRENT_ADDRESS: req.body.CURRENT_ADDRESS,
        CURRENT_CITY: req.body.CURRENT_CITY,
        CURRENT_TALUKA: req.body.CURRENT_TALUKA,
        CURRENT_DISTRICT: req.body.CURRENT_DISTRICT,
        CURRENT_LANDMARK: req.body.CURRENT_LANDMARK,
        CURRENT_STATE: req.body.CURRENT_STATE,
        CURRENT_PINCODE: req.body.CURRENT_PINCODE,
        PERMANENT_ADDRESS: req.body.PERMANENT_ADDRESS,
        PERMANENT_CITY: req.body.PERMANENT_CITY,
        PERMANENT_TALUKA: req.body.PERMANENT_TALUKA,
        PERMANENT_DISTRICT: req.body.PERMANENT_DISTRICT,
        PERMANENT_LANDMARK: req.body.PERMANENT_LANDMARK,
        PERMANENT_STATE: req.body.PERMANENT_STATE,
        PERMANENT_PINCODE: req.body.PERMANENT_PINCODE,
        HOUSE_PHONE: req.body.HOUSE_PHONE,
        OFFICE_PHONE: req.body.OFFICE_PHONE,
        EMAIL_ID: string = req.body.EMAIL_ID,
        MOBILE_NUMBER: req.body.MOBILE_NUMBER,
        WORK: req.body.WORK,
        ESTABLISHMENT: req.body.ESTABLISHMENT,
        RELIGION: req.body.RELIGION,
        CASTE: req.body.CASTE,
        MARITAL_STATUS: req.body.MARITAL_STATUS,
        FAMILY_COUNT: req.body.FAMILY_COUNT,
        EDUCATION: req.body.EDUCATION,
        IS_INSURED: req.body.IS_INSURED ? 1 : 0,
        INSURANCE_YEAR: req.body.INSURANCE_COMPANY,
        POLICY_TYPE: req.body.POLICY_TYPE,
        INSURANCE_COMPANY: req.body.INSURANCE_COMPANY,
        AADHAAR_NUMBER: req.body.AADHAAR_NUMBER,
        BLOOD_TYPE: req.body.BLOOD_TYPE,
        BLOOD_TYPE_SIGN: req.body.BLOOD_TYPE_SIGN,
        EMPLOYMENT_DETAIL: req.body.EMPLOYMENT_DETAIL,
        EMPLOYMENT_DESIGNATION: req.body.EMPLOYMENT_DESIGNATION,
        SELF_EMPLOYMENT_DETAIL: req.body.SELF_EMPLOYMENT_DETAIL,
        BUSINESS_DETAIL: req.body.BUSINESS_DETAIL,
        PROPRIETOR_DETAILS: req.body.PROPRIETOR_DETAILS,
        MOTHERS_NAME: req.body.MOTHERS_NAME,
        PAN_NO: req.body.PAN_NO,

        NATIONALITY: req.body.NATIONALITY,
        DATE_OF_BIRTH: req.body.DATE_OF_BIRTH,
        GENDER: req.body.GENDER,
        IS_CURRENT_ADDRESS_ON_OVD: req.body.IS_CURRENT_ADDRESS_ON_OVD,
        ADDRESS_DOCUMENT: req.body.ADDRESS_DOCUMENT,
        ADDRESS_DOCUMENT_NUMBER: req.body.ADDRESS_DOCUMENT_NUMBER,
        IS_DOB_MISMATCH: req.body.IS_DOB_MISMATCH ? '1' : '0',
        IS_VERNACULAR: req.body.IS_VERNACULAR,

        MOTHERS_LAST_NAME: req.body.MOTHERS_LAST_NAME,
        MOTHERS_MIDDLE_NAME: req.body.MOTHERS_MIDDLE_NAME,
        MOBILE_NUMBER_2: req.body.MOBILE_NUMBER_2,
        OTHER_CASTE: req.body.OTHER_CASTE,
        OTHER_RELIGION: req.body.OTHER_RELIGION,
        IS_EMAIL_VERIFIED: req.body.IS_EMAIL_VERIFIED,

        IS_CURRENT_ADDRESS_ON_OVD: req.body.IS_CURRENT_ADDRESS_ON_OVD,
        ADDRESS_DOCUMENT: req.body.ADDRESS_DOCUMENT,
        ADDRESS_DOCUMENT_NUMBER: req.body.ADDRESS_DOCUMENT_NUMBER,
        IS_DOB_MISMATCH: req.body.IS_DOB_MISMATCH,
        IS_VERNACULAR: req.body.IS_VERNACULAR,

        RISK_CATEGORY: req.body.RISK_CATEGORY,
        IS_MINOR: req.body.IS_MINOR,
        GUARDIAN_NAME: req.body.GUARDIAN_NAME,
        GUARDIAN_PAN: req.body.GUARDIAN_PAN,
        GUARDIAN_RELATION: req.body.GUARDIAN_RELATION,
        GUARDIAN_OTHER_DOCUMENT: req.body.GUARDIAN_OTHER_DOCUMENT,
        GUARDIAN_OTHER_DOCUMENT_NUMBER: req.body.GUARDIAN_OTHER_DOCUMENT_NUMBER,
        MINOR_DATE_OF_BIRTH_PROOF: req.body.MINOR_DATE_OF_BIRTH_PROOF,


        PROFESSION: req.body.PROFESSION,
        NATURE_OF_SERVICE: req.body.NATURE_OF_SERVICE,
        SELF_EMPLOYED: req.body.SELF_EMPLOYED,
        NATURE_OF_BUSINESS: req.body.NATURE_OF_BUSINESS,
        SOURCE_OF_FUNDS: req.body.SOURCE_OF_FUNDS,

        PERMANENT_ADDRESS_PROOF: req.body.PERMANENT_ADDRESS_PROOF,
        CURRUNT_ADDRESS_PROOF: req.body.CURRUNT_ADDRESS_PROOF,

        CONSTITUTION: req.body.CONSTITUTION,
        ID_PROOF: req.body.ID_PROOF,
        ID_PROOF_NUMBER: req.body.ID_PROOF_NUMBER,
        CURRENT_ADDRESS_PROOF_NUMBER: req.body.CURRENT_ADDRESS_PROOF_NUMBER,
        PERMANENT_ADDRESS_PROOF_NUMBER: req.body.PERMANENT_ADDRESS_PROOF_NUMBER,
        CURRENT_AREA: req.body.CURRENT_AREA,
        PERMANENT_AREA: req.body.PERMANENT_AREA,
        FATHER_OR_SPOUSE: req.body.FATHER_OR_SPOUSE,
        MOTHER_TITLE: req.body.MOTHER_TITLE,
        FATHER_TITLE: req.body.FATHER_TITLE
        
        
    }

    return data;
}

exports.get = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const q = `select * from guardian_information where APPLICANT_ID = ?` + (req.body.APPLICANT_NO ? ' AND APPLICANT_NO = ?' : '');
    const params = [req.body.APPLICANT_ID];
    if (req.body.APPLICANT_NO) {
        params.push(req.body.APPLICANT_NO);
    }

    try {
        const results = await db.executeQueryData(q, params, supportKey);
        res.send({
            "code": 200,
            "message": "OK",
            "data": results
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to get guardian information"
        });
    }
};

exports.create = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const data = reqData(req);
    const q = `insert into guardian_information set ?`;

    try {
        await db.executeQueryData(q, data, supportKey);
        res.send({
            "code": 200,
            "message": "Guardian information saved successfully"
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to save guardian information"
        });
    }
};

exports.update = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    const data = reqData(req);
    let setData = '';
    let recData = [];

    Object.keys(data).forEach(key => {
        setData += `${key} = ? ,`;
        recData.push(data[key]);
    });

    setData = setData.slice(0, -1);

    const q = `update guardian_information set ${setData} where ID = ?`;
    recData.push(req.body.ID);

    try {
        await db.executeQueryData(q, recData, supportKey);
        res.send({
            "code": 200,
            "message": "Guardian information updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to update guardian information"
        });
    }
};
