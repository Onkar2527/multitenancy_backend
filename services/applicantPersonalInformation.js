const db = require('../utilities/dbModule');

// -------------------------------
// Request body mapper
function reqData(req) {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
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
        EMAIL_ID: req.body.EMAIL_ID,
        MOBILE_NUMBER: req.body.MOBILE_NUMBER,
        MOBILE_NUMBER_2: req.body.MOBILE_NUMBER_2,
        WORK: req.body.WORK,
        ESTABLISHMENT: req.body.ESTABLISHMENT,
        RELIGION: req.body.RELIGION,
        CASTE: req.body.CASTE,
        OTHER_CASTE: req.body.OTHER_CASTE,
        OTHER_RELIGION: req.body.OTHER_RELIGION,
        OTHER_WORK: req.body.OTHER_WORK,
        OTHER_ESTABLISHMENT: req.body.OTHER_ESTABLISHMENT,
        OTHER_EMPLOYMENT_DETAIL: req.body.OTHER_EMPLOYMENT_DETAIL,
        OTHER_PROPRIETOR_DETAILS: req.body.OTHER_PROPRIETOR_DETAILS,
        OTHER_BUSINESS_DETAIL: req.body.OTHER_BUSINESS_DETAIL,
        MARITAL_STATUS: req.body.MARITAL_STATUS,
        FAMILY_COUNT: req.body.FAMILY_COUNT,
        EDUCATION: req.body.EDUCATION,
        IS_INSURED: req.body.IS_INSURED ? 1 : 0,
        INSURANCE_YEAR: req.body.INSURANCE_YEAR,
        POLICY_TYPE: req.body.POLICY_TYPE,
        INSURANCE_COMPANY: req.body.INSURANCE_COMPANY,
        AADHAAR_NUMBER: req.body.AADHAAR_NUMBER,
        PAN_NO: req.body.PAN_NO,
        NATIONALITY: req.body.NATIONALITY,
        DATE_OF_BIRTH: req.body.DATE_OF_BIRTH,
        GENDER: req.body.GENDER,
        IS_CURRENT_ADDRESS_ON_OVD: req.body.IS_CURRENT_ADDRESS_ON_OVD,
        ADDRESS_DOCUMENT: req.body.ADDRESS_DOCUMENT,
        ADDRESS_DOCUMENT_NUMBER: req.body.ADDRESS_DOCUMENT_NUMBER,
        IS_DOB_MISMATCH: req.body.IS_DOB_MISMATCH ? 1 : 0,
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
        FATHER_TITLE: req.body.FATHER_TITLE,
        OFFICE_ADDRESS: req.body.OFFICE_ADDRESS,
        OFFICE_CITY: req.body.OFFICE_CITY,
        OFFICE_TALUKA: req.body.OFFICE_TALUKA,
        OFFICE_DISTRICT: req.body.OFFICE_DISTRICT,
        OFFICE_LANDMARK: req.body.OFFICE_LANDMARK,
        OFFICE_STATE: req.body.OFFICE_STATE,
        OFFICE_PINCODE: req.body.OFFICE_PINCODE,
        OFFICE_AREA: req.body.OFFICE_AREA,
        MOTHERS_LAST_NAME: req.body.MOTHERS_LAST_NAME,
        MOTHERS_MIDDLE_NAME: req.body.MOTHERS_MIDDLE_NAME,
        MOTHERS_NAME: req.body.MOTHERS_NAME
    };
}

// -------------------------------
// GET applicant personal details
exports.get = async(req, res) => {
    try {
        const pool = req.db;
        const { APPLICANT_ID, APPLICANT_NO } = req.body;

        if (!APPLICANT_ID) {
            return res.status(400).send({ code: 400, message: 'APPLICANT_ID is required' });
        }

        let sql = `SELECT * FROM applicants_personal_details WHERE APPLICANT_ID = ?`;
        const params = [APPLICANT_ID];

        if (APPLICANT_NO) {
            sql += ` AND APPLICANT_NO = ?`;
            params.push(APPLICANT_NO);
        }

        const [rows] = await pool.promise().query(sql, params);
        res.send({ code: 200, message: 'OK', data: rows });
    } catch (error) {
        console.error('APPLICANT PERSONAL GET ERROR:', error);
        res.status(400).send({ code: 400, message: 'Failed to get personal information' });
    }
};

// -------------------------------
// CREATE applicant personal details
exports.create = async(req, res) => {
    const pool = req.db;
    try {
        const data = reqData(req);
        if (!data.APPLICANT_ID) {
            return res.status(400).send({ code: 400, message: 'APPLICANT_ID is required' });
        }
        await pool.promise().query(`INSERT INTO applicants_personal_details SET ?`, [data]);
        res.send({ code: 200, message: 'Application personal information saved successfully' });
    } catch (error) {
        console.error('APPLICANT PERSONAL CREATE ERROR:', error);
        res.status(400).send({ code: 400, message: 'Failed to save personal information' });
    }
};

// -------------------------------
// UPDATE applicant personal details
exports.update = async(req, res) => {
    const pool = req.db;
    try {
        const data = reqData(req);
        const { ID } = req.body;
        if (!ID) {
            return res.status(400).send({ code: 400, message: 'ID is required' });
        }
        await pool.promise().query(`UPDATE applicants_personal_details SET ? WHERE ID = ?`, [data, ID]);
        res.send({ code: 200, message: 'Information updated successfully' });
    } catch (error) {
        console.error('APPLICANT PERSONAL UPDATE ERROR:', error);
        res.status(400).send({ code: 400, message: 'Failed to update personal information' });
    }
};