const db = require('../utilities/dbModule');

const applicant_table = 'applicants_personal_details';

function reqData(req) {
    return {
        NO_OF_APPLICANT: req.body.NO_OF_APPLICANT,
        ACCOUNT_TYPE: req.body.ACCOUNT_TYPE,
        ACCOUNT_OPERATION: req.body.ACCOUNT_OPERATION,
        AADHAAR_NUMBER: req.body.AADHAAR_NUMBER,
        PAN_NUMBER: req.body.PAN_NUMBER,
        AADHAAR_NUMBER2: req.body.AADHAAR_NUMBER2,
        PAN_NUMBER2: req.body.PAN_NUMBER2,
        AADHAAR_NUMBER3: req.body.AADHAAR_NUMBER3,
        PAN_NUMBER3: req.body.PAN_NUMBER3,
        AADHAAR_NUMBER4: req.body.AADHAAR_NUMBER4,
        PAN_NUMBER4: req.body.PAN_NUMBER4,
        PRIMARY_APPLICANT_FIRST_NAME: req.body.PRIMARY_APPLICANT_FIRST_NAME,
        PRIMARY_APPLICANT_MIDDLE_NAME: req.body.PRIMARY_APPLICANT_MIDDLE_NAME,
        PRIMARY_APPLICANT_LAST_NAME: req.body.PRIMARY_APPLICANT_LAST_NAME,
        APPLICANT2_FIRST_NAME: req.body.APPLICANT2_FIRST_NAME,
        APPLICANT2_MIDDLE_NAME: req.body.APPLICANT2_MIDDLE_NAME,
        APPLICANT2_LAST_NAME: req.body.APPLICANT2_LAST_NAME,
        APPLICANT3_FIRST_NAME: req.body.APPLICANT3_FIRST_NAME,
        APPLICANT3_MIDDLE_NAME: req.body.APPLICANT3_MIDDLE_NAME,
        APPLICANT3_LAST_NAME: req.body.APPLICANT3_LAST_NAME,
        APPLICANT4_FIRST_NAME: req.body.APPLICANT4_FIRST_NAME,
        APPLICANT4_MIDDLE_NAME: req.body.APPLICANT4_MIDDLE_NAME,
        APPLICANT4_LAST_NAME: req.body.APPLICANT4_LAST_NAME,
        IS_MINOR: req.body.IS_MINOR ? '1' : '0',
        MINOR_DOB: req.body.MINOR_DOB,
        GUARDIAN_NAME: req.body.GUARDIAN_NAME,
        RELATION_WITH_MINOR: req.body.RELATION_WITH_MINOR,
        GUARDIAN_DOB: req.body.GUARDIAN_DOB,
        IS_INTRODUCED: req.body.IS_INTRODUCED ? '1' : 0,
        E_CUSTOMER_NAME: req.body.E_CUSTOMER_NAME,
        E_CUSTOMER_ID: req.body.E_CUSTOMER_ID,
        E_ACCOUNT_NUMBER: req.body.E_ACCOUNT_NUMBER,
        E_YEARS: req.body.E_YEARS,
        STATUS: req.body.STATUS,
        IS_OLD_CUSTOMER: req.body.IS_OLD_CUSTOMER ? '1' : '0',
        CUSTOMER_TYPE_1: req.body.CUSTOMER_TYPE_1,
        CUSTOMER_TYPE_2: req.body.CUSTOMER_TYPE_2,
        AADHAAR_NO_1: req.body.AADHAAR_NO_1,
        AADHAAR_NO_2: req.body.AADHAAR_NO_2,
        IS_OLD_CUSTOMER_1: req.body.IS_OLD_CUSTOMER_1,
        IS_OLD_CUSTOMER_2: req.body.IS_OLD_CUSTOMER_2,
        CUSTOMER_ID_2: req.body.CUSTOMER_ID_2,
        CKYC_NUMBER_2: req.body.CKYC_NUMBER_2,
        CUSTOMER_ID_1: req.body.CUSTOMER_ID_1,
        CKYC_NUMBER_1: req.body.CKYC_NUMBER_1,
        CREATED_BRANCH_ID: req.body.CREATED_BRANCH_ID,
        MAKER_USER_ID: req.body.MAKER_USER_ID,
        CHACKER_USER_ID: req.body.CHACKER_USER_ID,
        VERIFIER_USER_ID: req.body.VERIFIER_USER_ID,
        TRACK_ID: req.body.TRACK_ID,
        IS_OLD_CUSTOMER_3: req.body.IS_OLD_CUSTOMER_3,
        CUSTOMER_ID_3: req.body.CUSTOMER_ID_3,
        CKYC_NUMBER_3: req.body.CKYC_NUMBER_3,
        VOTER_ID_3: req.body.VOTER_ID_3,
        LICENSE_NO_3: req.body.LICENSE_NO_3,
        CUSTOMER_TYPE_3: req.body.CUSTOMER_TYPE_3,
        IS_OLD_CUSTOMER_4: req.body.IS_OLD_CUSTOMER_4,
        CUSTOMER_ID_4: req.body.CUSTOMER_ID_4,
        CKYC_NUMBER_4: req.body.CKYC_NUMBER_4,
        VOTER_ID_4: req.body.VOTER_ID_4,
        LICENSE_NO_4: req.body.LICENSE_NO_4,
        CUSTOMER_TYPE_4: req.body.CUSTOMER_TYPE_4,
        FILLED_DATE_TIME: req.body.FILLED_DATE_TIME,
        VERIFIED_DATE_TIME: req.body.VERIFIED_DATE_TIME,
        DOB_1: req.body.DOB_1,
        GENDER_1: req.body.GENDER_1,
        MOBILE_1: req.body.MOBILE_1,
        AGE_1: req.body.AGE_1,
        DOB_2: req.body.DOB_2,
        GENDER_2: req.body.GENDER_2,
        MOBILE_2: req.body.MOBILE_2,
        AGE_2: req.body.AGE_2,
        DOB_3: req.body.DOB_3,
        GENDER_3: req.body.GENDER_3,
        MOBILE_3: req.body.MOBILE_3,
        AGE_3: req.body.AGE_3,
        DOB_4: req.body.DOB_4,
        GENDER_4: req.body.GENDER_4,
        MOBILE_4: req.body.MOBILE_4,
        AGE_4: req.body.AGE_4,
        OTP_AUTH_1: req.body.OTP_AUTH_1,
        OTP_AUTH_2: req.body.OTP_AUTH_2,
        VOTER_ID_2: req.body.VOTER_ID_2,
        VOTER_ID_1: req.body.VOTER_ID_1,
        LICENSE_NO_1: req.body.LICENSE_NO_1,
        LICENSE_NO_2: req.body.LICENSE_NO_2,
        DOCUMENTS_AUTHORITY: req.body.DOCUMENTS_AUTHORITY,
        DOCUMENTS_ISSUE_PLACE: req.body.DOCUMENTS_ISSUE_PLACE,
        IS_AADHAAR_DBT: req.body.IS_AADHAAR_DBT,
    };
}

function cpcAccess(req) {
    return {
        VERIFIER_USER_ID: req.body.VERIFIER_USER_ID,
        TRACK_ID: req.body.TRACK_ID,
    };
}

function checkerAccess(req) {
    return {
        TRACK_ID: req.body.TRACK_ID,
        VERIFIED_DATE_TIME: req.body.VERIFIED_DATE_TIME
    };
}

function getAllApplicantsInfo(applicant, i) {
    return {
        FIRST_NAME: applicant.FIRST_NAME,
        APPLICANT_NO: i,
        MIDDLE_NAME: applicant.MIDDLE_NAME,
        LAST_NAME: applicant.LAST_NAME,
        AADHAAR_NUMBER: applicant.AADHAAR_NO,
        PAN_NO: applicant.PAN_NUMBER,
        DRIVING_LICENSE_NO: applicant.LICENSE_NO,
        VOTER_ID: applicant.VOTER_ID,
        DATE_OF_BIRTH: applicant.DOB,
        GENDER: applicant.GENDER,
        MOBILE_NUMBER: applicant.MOBILE
    };
}

function getCommonApplicantInfo() {
    return {
        RISK_CATEGORY: 'A',
        RELIGION: 'A',
        CASTE: 'A',
        MARITAL_STATUS: 'M',
        EDUCATION: 'S',
        BLOOD_TYPE: 'A',
        GENDER: "M",
        GUARDIAN_RELATION: 'A',
        PROFESSION: ' ',
        NATURE_OF_SERVICE: ' ',
        SELF_EMPLOYED: ' ',
        NATURE_OF_BUSINESS: ' ',
        SOURCE_OF_FUNDS: ' ',
        NATIONALITY: 'A',
        FATHER_OR_SPOUSE: 'F'
    };
}

exports.get = async (req, res) => {
    try {
        const user = req.user;
        const dbPool = req.db;

        if (!user) {
            return res.status(401).send({ code: 401, message: 'User context missing' });
        }

        const { ID } = req.body;
        if (!ID) {
            return res.status(400).send({ code: 400, message: 'ID is required' });
        }

        const q = `SELECT * FROM basic_details WHERE ID = ?`;
        const [results] = await dbPool.promise().query(q, [ID]);

        if (results.length > 0 && results[0].APPLICANTS_DATA) {
            try {
                results[0].applicants = JSON.parse(results[0].APPLICANTS_DATA);
            } catch (e) {
                results[0].applicants = [];
            }
        }

        res.send({ code: 200, message: 'OK', data: results });
    } catch (error) {
        console.error('GET BASIC DETAILS ERROR:', error);
        res.status(400).send({ code: 400, message: 'Failed to get personal details' });
    }
};

exports.create = async (req, res) => {
    const pool = req.db;
    let connection;
    try {
        const data = reqData(req);
        const applicants = req.body.applicants || [];

        data.APPLICANTS_DATA = JSON.stringify(applicants);
        data.MODIFIED_DATE = new Date();

        const user = req.user;
        if (!user) {
            return res.status(401).send({ code: 401, message: 'User context missing' });
        }

        data.MAKER_USER_ID = user.USER_ID;
        data.CREATED_BRANCH_ID = user.BRANCH_ID;

        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        // 1️⃣ Insert basic_details
        const [basicInsert] = await connection.query(`INSERT INTO basic_details SET ?`, data);
        const proposalId = basicInsert.insertId;

        // 2️⃣ Insert extra_information
        await connection.query(
            `INSERT INTO extra_information (APPLICANT_ID, TAB_ID)
             SELECT ?, ID FROM tab_master`, [proposalId]
        );

        // 3️⃣ Applicants loop
        for (let i = 0; i < applicants.length; i++) {
            const applicant = applicants[i];
            const applicantNo = i + 1;

            const applicantPersonalData = {
                ...getCommonApplicantInfo(),
                ...getAllApplicantsInfo(applicant, applicantNo),
                APPLICANT_ID: proposalId
            };

            const applicantPhotoData = {
                FIRST_NAME: applicant.FIRST_NAME,
                MIDDLE_NAME: applicant.MIDDLE_NAME,
                LAST_NAME: applicant.LAST_NAME,
                APPLICANT_ID: proposalId,
                APPLICANT_NO: applicantNo
            };

            await connection.query(`INSERT INTO applicants_personal_details SET ?`, applicantPersonalData);
            await connection.query(`INSERT INTO applicant_photos SET ?`, applicantPhotoData);
            await connection.query(
                `INSERT INTO applicant_documents (DOCUMENT_NAME, APPLICANT_ID, APPLICANT_NO)
                 SELECT DOCUMENT_NAME, ?, ? FROM document_master ORDER BY SEQ_NO`, [proposalId, applicantNo]
            );
        }

        await connection.commit();
        return res.send({
            code: 200,
            message: 'Basic details saved successfully',
            APPLICANT_ID: proposalId
        });

    } catch (error) {
        console.error('CREATE ERROR:', error);
        if (connection) await connection.rollback();
        return res.status(400).send({ code: 400, message: 'Failed to save basic details' });
    } finally {
        if (connection) connection.release();
    }
};

exports.update = async (req, res) => {
    const pool = req.db;
    let connection;
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({ code: 401, message: 'User context missing' });
        }

        const ROLE_ID = user.ROLE_ID;
        const applicants = req.body.applicants || [];
        let data = {};

        if (ROLE_ID == 1) { // MAKER
            data = reqData(req);
            data.APPLICANTS_DATA = JSON.stringify(applicants);
            if (data.TRACK_ID == 2) {
                data.MODIFIED_DATE = new Date();
            }
        } else if (ROLE_ID == 2) { // CHECKER
            data = checkerAccess(req);
            data.MODIFIED_DATE = new Date();
        } else if (ROLE_ID == 3) { // VERIFIER
            data = cpcAccess(req);
            data.MODIFIED_DATE = new Date();
        } else {
            data = reqData(req);
        }

        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        let setData = '';
        let values = [];
        Object.keys(data).forEach(key => {
            setData += `${key} = ?,`;
            values.push(data[key]);
        });
        setData = setData.slice(0, -1);
        values.push(req.body.ID);

        const q = `UPDATE basic_details SET ${setData} WHERE ID = ?`;
        await connection.query(q, values);

        if (ROLE_ID == 1) {
            for (let i = 0; i < applicants.length; i++) {
                const applicant = applicants[i];
                const applicantNo = i + 1;

                const [existing] = await connection.query(
                    `SELECT ID FROM applicants_personal_details 
                     WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`, [req.body.ID, applicantNo]
                );

                if (existing.length > 0) {
                    const applicantPersonalData = getAllApplicantsInfo(applicant, applicantNo);
                    await connection.query(
                        `UPDATE applicants_personal_details SET ? WHERE ID = ?`, [applicantPersonalData, existing[0].ID]
                    );
                } else {
                    const applicantPersonalData = {
                        ...getCommonApplicantInfo(),
                        ...getAllApplicantsInfo(applicant, applicantNo),
                        APPLICANT_ID: req.body.ID
                    };

                    const applicantPhotoData = {
                        FIRST_NAME: applicant.FIRST_NAME,
                        MIDDLE_NAME: applicant.MIDDLE_NAME,
                        LAST_NAME: applicant.LAST_NAME,
                        APPLICANT_ID: req.body.ID,
                        APPLICANT_NO: applicantNo
                    };

                    await connection.query(`INSERT INTO applicants_personal_details SET ?`, [applicantPersonalData]);
                    await connection.query(`INSERT INTO applicant_photos SET ?`, [applicantPhotoData]);
                    await connection.query(
                        `INSERT INTO applicant_documents (DOCUMENT_NAME, APPLICANT_ID, APPLICANT_NO)
                         SELECT DOCUMENT_NAME, ?, ? FROM document_master ORDER BY SEQ_NO`, [req.body.ID, applicantNo]
                    );
                }
            }
        }

        await connection.commit();
        res.send({ code: 200, message: 'Basic details updated successfully' });
    } catch (error) {
        console.error('UPDATE ERROR:', error);
        if (connection) await connection.rollback();
        res.status(400).send({ code: 400, message: 'Failed to update personal information' });
    } finally {
        if (connection) connection.release();
    }
};

exports.getAll = async (req, res) => {
    try {
        const user = req.user;
        const db = req.db;

        if (!user) {
            return res.status(401).send({ code: 401, message: 'User context missing' });
        }

        const {
            filter = {},
            pageIndex = '',
            pageSize = '',
            sortKey = 'MODIFIED_DATE',
            sortValue = 'DESC'
        } = req.body;

        let roleFilter = '';
        let filterValues = [];

        if (user.ROLE_ID == 1) {
            roleFilter = ` AND MAKER_USER_ID = ? AND CREATED_BRANCH_ID = ?`;
            filterValues.push(user.USER_ID, user.BRANCH_ID);
        } else if (user.ROLE_ID == 2) {
            roleFilter = ` AND CHACKER_USER_ID = ? AND CREATED_BRANCH_ID = ?`;
            filterValues.push(user.USER_ID, user.BRANCH_ID);
        } else if (user.ROLE_ID == 3) {
            roleFilter = ` AND (VERIFIER_USER_ID = ? OR (ISNULL(VERIFIER_USER_ID) AND TRACK_ID = 3))`;
            filterValues.push(user.USER_ID);
        }

        let userFilterStr = '';
        if (filter.TRACK_ID) {
            userFilterStr += ` AND TRACK_ID = ?`;
            filterValues.push(filter.TRACK_ID);
        }
        if (filter.START_DATE) {
            userFilterStr += ` AND CAST(APPLICATION_DATE AS DATE) >= ?`;
            filterValues.push(filter.START_DATE);
        }
        if (filter.END_DATE) {
            userFilterStr += ` AND CAST(APPLICATION_DATE AS DATE) <= ?`;
            filterValues.push(filter.END_DATE);
        }

        const countQuery = `SELECT COUNT(*) cnt FROM basic_details WHERE 1 ${roleFilter} ${userFilterStr}`;
        const [countResult] = await db.promise().query(countQuery, filterValues);

        let dataQuery = `SELECT * FROM basic_details WHERE 1 ${roleFilter} ${userFilterStr} ORDER BY ?? ${sortValue === 'ASC' ? 'ASC' : 'DESC'}`;
        let dataValues = [...filterValues, sortKey];

        if (pageIndex && pageSize) {
            const start = (Number(pageIndex) - 1) * Number(pageSize);
            dataQuery += ` LIMIT ?, ?`;
            dataValues.push(start, Number(pageSize));
        }

        const [dataResult] = await db.promise().query(dataQuery, dataValues);

        res.send({
            code: 200,
            message: 'ok',
            count: countResult[0]?.cnt || 0,
            data: dataResult
        });
    } catch (error) {
        console.error('getAll error:', error);
        res.status(500).send({ code: 500, message: 'Failed to get drafts' });
    }
};
