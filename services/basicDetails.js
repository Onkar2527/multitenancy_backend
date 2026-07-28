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
        PASSPORT_NO: applicant.PASSPORT_NO,
        PASSPORT: applicant.PASSPORT_NO,
        DATE_OF_BIRTH: applicant.DOB,
        GENDER: applicant.GENDER,
        MOBILE_NUMBER: applicant.MOBILE,

        F_OR_H_FIRST_NAME: applicant.F_OR_H_FIRST_NAME,
        F_OR_H_MIDDLE_NAME: applicant.F_OR_H_MIDDLE_NAME,
        F_OR_H_LAST_NAME: applicant.F_OR_H_LAST_NAME,
        MOTHERS_NAME: applicant.MOTHERS_NAME,
        MOTHERS_MIDDLE_NAME: applicant.MOTHERS_MIDDLE_NAME,
        MOTHERS_LAST_NAME: applicant.MOTHERS_LAST_NAME,
        RISK_CATEGORY: applicant.RISK_CATEGORY,
        RELIGION: applicant.RELIGION,
        CASTE: applicant.CASTE,
        MARITAL_STATUS: applicant.MARITAL_STATUS,
        FATHER_TITLE: applicant.FATHER_TITLE,
        MOTHER_TITLE: applicant.MOTHER_TITLE,
        CURRENT_ADDRESS: applicant.CURRENT_ADDRESS,
        CURRENT_PINCODE: applicant.CURRENT_PINCODE,
        PERMANENT_ADDRESS: applicant.PERMANENT_ADDRESS,
        PERMANENT_PINCODE: applicant.PERMANENT_PINCODE,
        CURRENT_CITY: applicant.CURRENT_CITY,
        CURRENT_TALUKA: applicant.CURRENT_TALUKA,
        CURRENT_DISTRICT: applicant.CURRENT_DISTRICT,
        CURRENT_STATE: applicant.CURRENT_STATE,
        PERMANENT_CITY: applicant.PERMANENT_CITY,
        PERMANENT_TALUKA: applicant.PERMANENT_TALUKA,
        PERMANENT_DISTRICT: applicant.PERMANENT_DISTRICT,
        PERMANENT_STATE: applicant.PERMANENT_STATE,
        WORK: applicant.WORK,
        PROFESSION: applicant.PROFESSION,
        FATHER_OR_SPOUSE: applicant.FATHER_OR_SPOUSE,

        ID_PROOF: applicant.ID_PROOF,
        ID_PROOF_NUMBER: applicant.ID_PROOF_NUMBER,
        PERMANENT_ADDRESS_PROOF: applicant.PERMANENT_ADDRESS_PROOF,
        PERMANENT_ADDRESS_PROOF_NUMBER: applicant.PERMANENT_ADDRESS_PROOF_NUMBER
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

        if (results.length > 0 && results[0].APPLICANT_DATA) {
            try {
                results[0].applicants = JSON.parse(results[0].APPLICANT_DATA);
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

        data.APPLICANT_DATA = JSON.stringify(applicants);
        data.MODIFIED_DATE = new Date();

        const user = req.user;
        if (!user) {
            return res.status(401).send({ code: 401, message: 'User context missing' });
        }

        data.MAKER_USER_ID = user.USER_ID;
        data.CREATED_BRANCH_ID = user.BRANCH_ID;
        data.TRACK_ID = data.TRACK_ID || 1; // Defensive default

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

            if (!applicant.IS_OLD_CUSTOMER) {
                await checkLocalDuplicates(connection, applicant, applicantNo, null);
                await validatePanVerification(connection, applicant, applicantNo);
            }

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

            if (applicant.ANNUAL_INCOME) {
                await connection.query(
                    `INSERT INTO financial_information (APPLICANT_ID, APPLICANT_NO, INCOME) VALUES (?, ?, ?)`,
                    [proposalId, applicantNo, applicant.ANNUAL_INCOME]
                );
            }

            if (applicant.CUSTOMER_ID) {
                await copyExistingDetails(connection, proposalId, applicantNo, applicant.CUSTOMER_ID, applicant.AADHAAR_NO, applicant.PAN_NUMBER);
            }
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
        return res.status(400).send({ code: 400, message: error.message || 'Failed to save basic details' });
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
            data.APPLICANT_DATA = JSON.stringify(applicants);
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

                if (!applicant.IS_OLD_CUSTOMER) {
                    await checkLocalDuplicates(connection, applicant, applicantNo, req.body.ID);
                    await validatePanVerification(connection, applicant, applicantNo);
                }

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

                if (applicant.ANNUAL_INCOME) {
                    const [existingFin] = await connection.query(
                        `SELECT ID FROM financial_information WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`,
                        [req.body.ID, applicantNo]
                    );
                    if (existingFin.length > 0) {
                        await connection.query(
                            `UPDATE financial_information SET INCOME = ? WHERE ID = ?`,
                            [applicant.ANNUAL_INCOME, existingFin[0].ID]
                        );
                    } else {
                        await connection.query(
                            `INSERT INTO financial_information (APPLICANT_ID, APPLICANT_NO, INCOME) VALUES (?, ?, ?)`,
                            [req.body.ID, applicantNo, applicant.ANNUAL_INCOME]
                        );
                    }
                }

                if (applicant.CUSTOMER_ID) {
                    await copyExistingDetails(connection, req.body.ID, applicantNo, applicant.CUSTOMER_ID, applicant.AADHAAR_NO, applicant.PAN_NUMBER);
                }
            }
        }

        await connection.commit();
        res.send({ code: 200, message: 'Basic details updated successfully' });
    } catch (error) {
        console.error('UPDATE ERROR:', error);
        if (connection) await connection.rollback();
        res.status(400).send({ code: 400, message: error.message || 'Failed to update personal information' });
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
            roleFilter = ` AND bd.MAKER_USER_ID = ? AND bd.CREATED_BRANCH_ID = ?`;
            filterValues.push(user.USER_ID, user.BRANCH_ID);
        } else if (user.ROLE_ID == 2) {
            roleFilter = ` AND bd.CHACKER_USER_ID = ? AND bd.CREATED_BRANCH_ID = ?`;
            filterValues.push(user.USER_ID, user.BRANCH_ID);
        } else if (user.ROLE_ID == 3) {
            roleFilter = ` AND (bd.VERIFIER_USER_ID = ? OR (ISNULL(bd.VERIFIER_USER_ID) AND bd.TRACK_ID = 3))`;
            filterValues.push(user.USER_ID);
        }

        let userFilterStr = '';
        if (filter.TRACK_ID) {
            userFilterStr += ` AND bd.TRACK_ID = ?`;
            filterValues.push(filter.TRACK_ID);
        }
        if (filter.START_DATE) {
            userFilterStr += ` AND CAST(bd.APPLICATION_DATE AS DATE) >= ?`;
            filterValues.push(filter.START_DATE);
        }
        if (filter.END_DATE) {
            userFilterStr += ` AND CAST(bd.APPLICATION_DATE AS DATE) <= ?`;
            filterValues.push(filter.END_DATE);
        }

        const countQuery = `SELECT COUNT(*) cnt FROM basic_details bd WHERE 1 ${roleFilter} ${userFilterStr}`;
        const [countResult] = await db.promise().query(countQuery, filterValues);

        let dataQuery = `SELECT bd.*, apd.MOBILE_NUMBER AS MOBILE_NO, apd.EMAIL_ID 
                         FROM basic_details bd 
                         LEFT JOIN applicants_personal_details apd ON bd.ID = apd.APPLICANT_ID AND apd.APPLICANT_NO = 1 
                         WHERE 1 ${roleFilter} ${userFilterStr} 
                         ORDER BY bd.?? ${sortValue === 'ASC' ? 'ASC' : 'DESC'}`;
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

async function checkLocalDuplicates(connection, applicant, applicantNo, currentApplicantId) {
    const checkFields = [
        { name: 'Driving License', col: 'DRIVING_LICENSE_NO', val: applicant.LICENSE_NO },
        { name: 'Voter ID', col: 'VOTER_ID', val: applicant.VOTER_ID },
        { name: 'Passport', col: 'PASSPORT_NO', val: applicant.PASSPORT_NO },
        { name: 'Passport', col: 'PASSPORT', val: applicant.PASSPORT_NO }
    ];

    for (const field of checkFields) {
        if (field.val && String(field.val).trim() !== '') {
            let query = `
                SELECT 
                    apd.APPLICANT_ID, 
                    apd.APPLICANT_NO, 
                    apd.FIRST_NAME, 
                    apd.MIDDLE_NAME, 
                    apd.LAST_NAME,
                    bd.CUSTOMER_ID_1,
                    bd.CUSTOMER_ID_2,
                    bd.CUSTOMER_ID_3,
                    bd.CUSTOMER_ID_4
                FROM applicants_personal_details apd
                LEFT JOIN basic_details bd ON apd.APPLICANT_ID = bd.ID
                WHERE REPLACE(apd.??, ' ', '') = ?`;
            let params = [field.col, String(field.val).replace(/\s+/g, '').trim()];
            if (currentApplicantId) {
                query += ` AND apd.APPLICANT_ID != ?`;
                params.push(currentApplicantId);
            }

            const [rows] = await connection.query(query, params);
            if (rows.length > 0) {
                const dupApplicant = rows[0];
                const fullName = [dupApplicant.FIRST_NAME, dupApplicant.MIDDLE_NAME, dupApplicant.LAST_NAME].filter(Boolean).join(' ');
                const customerIdKey = `CUSTOMER_ID_${dupApplicant.APPLICANT_NO}`;
                const customerId = dupApplicant[customerIdKey];
                const profileName = customerId ? `${fullName}(${customerId})` : fullName;

                throw new Error(`Applicant ${applicantNo} ${field.name} number '${field.val}' already exists in another customer profile of '${profileName}'!`);
            }
        }
    }
}

async function validatePanVerification(connection, applicant, applicantNo) {
    const pan = applicant.PAN_NUMBER;
    if (!pan || String(pan).trim() === '') {
        throw new Error(`Applicant ${applicantNo} PAN Number is mandatory.`);
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(String(pan).toUpperCase())) {
        throw new Error(`Applicant ${applicantNo} PAN number '${pan}' format is invalid (should be like ABCDE1234F).`);
    }

}

async function copyExistingDetails(connection, proposalId, applicantNo, customerId, aadhaar, pan) {
    try {
        if (!customerId) return;

        // Find the most recent proposal for this Customer ID in basic_details
        const [prevProposals] = await connection.query(
            `SELECT ID FROM basic_details 
             WHERE (CUSTOMER_ID_1 = ? OR CUSTOMER_ID_2 = ? OR CUSTOMER_ID_3 = ? OR CUSTOMER_ID_4 = ?) 
             AND ID != ? ORDER BY ID DESC LIMIT 1`,
            [customerId, customerId, customerId, customerId, proposalId]
        );

        if (prevProposals.length > 0) {
            const prevId = prevProposals[0].ID;
            
            // Find the applicant number in previous proposal by matching Aadhaar or PAN
            const [prevApps] = await connection.query(
                `SELECT APPLICANT_NO FROM applicants_personal_details 
                 WHERE APPLICANT_ID = ? AND (AADHAAR_NUMBER = ? OR PAN_NO = ?)`,
                [prevId, aadhaar, pan]
            );
            
            const prevNo = prevApps.length > 0 ? prevApps[0].APPLICANT_NO : 1;

            // 1. Copy Nominee Details
            const [prevNominees] = await connection.query(
                `SELECT * FROM nominee_details WHERE APPLICANT_ID = ?`,
                [prevId]
            );
            for (const nominee of prevNominees) {
                const { ID, APPLICANT_ID, ...nomineeData } = nominee;
                nomineeData.APPLICANT_ID = proposalId;

                // Check if nominee already exists for this proposal
                const [existingNom] = await connection.query(
                    `SELECT ID FROM nominee_details WHERE APPLICANT_ID = ? AND NOMINEE_NAME = ?`,
                    [proposalId, nomineeData.NOMINEE_NAME]
                );
                if (existingNom.length === 0) {
                    await connection.query(`INSERT INTO nominee_details SET ?`, nomineeData);
                }
            }

            // 2. Copy Deposit Details
            const [prevDeposits] = await connection.query(
                `SELECT * FROM term_deposite WHERE APPLICANT_ID = ?`,
                [prevId]
            );
            for (const deposit of prevDeposits) {
                const { ID, APPLICANT_ID, ...depositData } = deposit;
                depositData.APPLICANT_ID = proposalId;

                const [existingDep] = await connection.query(
                    `SELECT ID FROM term_deposite WHERE APPLICANT_ID = ?`,
                    [proposalId]
                );
                if (existingDep.length === 0) {
                    await connection.query(`INSERT INTO term_deposite SET ?`, depositData);
                }
            }

            // 2b. Copy Service/Facilities Details
            const [prevServices] = await connection.query(
                `SELECT * FROM facilities WHERE APPLICANT_ID = ?`,
                [prevId]
            );
            for (const service of prevServices) {
                const { ID, APPLICANT_ID, ...serviceData } = service;
                serviceData.APPLICANT_ID = proposalId;

                const [existingService] = await connection.query(
                    `SELECT ID FROM facilities WHERE APPLICANT_ID = ?`,
                    [proposalId]
                );
                if (existingService.length === 0) {
                    await connection.query(`INSERT INTO facilities SET ?`, serviceData);
                }
            }

            // 2c. Copy Property Details
            const [prevProperties] = await connection.query(
                `SELECT * FROM property_information WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`,
                [prevId, prevNo]
            );
            for (const prop of prevProperties) {
                const { ID, APPLICANT_ID, ...propData } = prop;
                propData.APPLICANT_ID = proposalId;
                propData.APPLICANT_NO = applicantNo;

                const [existingProp] = await connection.query(
                    `SELECT ID FROM property_information WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`,
                    [proposalId, applicantNo]
                );
                if (existingProp.length === 0) {
                    await connection.query(`INSERT INTO property_information SET ?`, propData);
                }
            }

            // 2d. Copy Financial Details
            const [prevFinancials] = await connection.query(
                `SELECT * FROM financial_information WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`,
                [prevId, prevNo]
            );
            for (const fin of prevFinancials) {
                const { ID, APPLICANT_ID, ...finData } = fin;
                finData.APPLICANT_ID = proposalId;
                finData.APPLICANT_NO = applicantNo;

                const [existingFin] = await connection.query(
                    `SELECT ID FROM financial_information WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`,
                    [proposalId, applicantNo]
                );
                if (existingFin.length === 0) {
                    await connection.query(`INSERT INTO financial_information SET ?`, finData);
                } else {
                    await connection.query(`UPDATE financial_information SET ? WHERE ID = ?`, [finData, existingFin[0].ID]);
                }
            }

            // 3. Copy Document Details (images/attachments)
            const [prevDocuments] = await connection.query(
                `SELECT * FROM applicant_documents WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`,
                [prevId, prevNo]
            );
            for (const doc of prevDocuments) {
                if (doc.DOCUMENT_FILE) {
                    await connection.query(
                        `UPDATE applicant_documents 
                         SET DOCUMENT_FILE = ?, DOCUMENT_NO = ?, FILE_TYPE = ?, FILE_SIZE = ?, IS_VERIFIED = 1 
                         WHERE APPLICANT_ID = ? AND APPLICANT_NO = ? AND DOCUMENT_NAME = ?`,
                        [doc.DOCUMENT_FILE, doc.DOCUMENT_NO, doc.FILE_TYPE, doc.FILE_SIZE, proposalId, applicantNo, doc.DOCUMENT_NAME]
                    );
                }
            }

            // Copy photo if exists
            const [prevPhotos] = await connection.query(
                `SELECT PHOTO FROM applicant_photos WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`,
                [prevId, prevNo]
            );
            if (prevPhotos.length > 0 && prevPhotos[0].PHOTO) {
                await connection.query(
                    `UPDATE applicant_photos SET PHOTO = ? 
                     WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`,
                    [prevPhotos[0].PHOTO, proposalId, applicantNo]
                );
            }
            console.log(`Successfully copied nominee, deposit, and documents from proposal ID ${prevId} (Applicant No ${prevNo}) to proposal ID ${proposalId} (Applicant No ${applicantNo})`);
        }
    } catch (err) {
        console.error("Error copying existing details:", err);
    }
}

exports.getPreviousDetails = async (req, res) => {
    try {
        const db = req.db;
        const { CUSTOMER_ID } = req.body;
        if (!CUSTOMER_ID) {
            return res.status(400).send({ code: 400, message: 'CUSTOMER_ID is required' });
        }

        // Find the most recent proposal for this Customer ID in basic_details
        const [prevProposals] = await db.promise().query(
            `SELECT ID FROM basic_details 
             WHERE (CUSTOMER_ID_1 = ? OR CUSTOMER_ID_2 = ? OR CUSTOMER_ID_3 = ? OR CUSTOMER_ID_4 = ?) 
             ORDER BY ID DESC LIMIT 1`,
            [CUSTOMER_ID, CUSTOMER_ID, CUSTOMER_ID, CUSTOMER_ID]
        );

        if (prevProposals.length > 0) {
            const prevId = prevProposals[0].ID;

            // 1. Fetch Nominee Details
            const [nominees] = await db.promise().query(
                `SELECT * FROM nominee_details WHERE APPLICANT_ID = ?`,
                [prevId]
            );

            // 2. Fetch Deposit Details
            const [deposits] = await db.promise().query(
                `SELECT * FROM term_deposite WHERE APPLICANT_ID = ?`,
                [prevId]
            );

            // 3. Fetch Service/Facilities Details
            const [services] = await db.promise().query(
                `SELECT * FROM facilities WHERE APPLICANT_ID = ?`,
                [prevId]
            );

            // 4. Fetch Property Details
            const [properties] = await db.promise().query(
                `SELECT * FROM property_information WHERE APPLICANT_ID = ?`,
                [prevId]
            );

            // 5. Fetch Financial Details
            const [financials] = await db.promise().query(
                `SELECT * FROM financial_information WHERE APPLICANT_ID = ?`,
                [prevId]
            );

            return res.send({
                code: 200,
                message: 'OK',
                data: {
                    nominees: nominees,
                    deposits: deposits,
                    services: services,
                    properties: properties,
                    financials: financials
                }
            });
        }

        return res.send({ code: 404, message: 'No previous details found' });
    } catch (error) {
        console.error('getPreviousDetails error:', error);
        res.status(500).send({ code: 500, message: 'Internal server error' });
    }
};

