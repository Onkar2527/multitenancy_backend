const db = require('../utilities/dbModule');

const applicant_table = 'applicants_personal_details';

function reqData(req) {

    var data = {

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
    }

    return data;

}

function cpcAccess(req) {
    let data = {
        VERIFIER_USER_ID: req.body.VERIFIER_USER_ID,
        TRACK_ID: req.body.TRACK_ID,
    }
    return data;
}

function checkerAccess(req) {
    let data = {
        // VERIFIER_USER_ID: req.body.VERIFIER_USER_ID,
        TRACK_ID: req.body.TRACK_ID,
        VERIFIED_DATE_TIME: req.body.VERIFIED_DATE_TIME
    }

    return data;
}

function getAllApplicantsInfo(applicant, i) {

    const data = {
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
    }

    return data
}

function getCommonApplicantInfo() {
    let data = {
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
    }

    return data;
}

function getAllApplicantDoc(req) {
    var data = [
        { FIRST_NAME: req.body.PRIMARY_APPLICANT_FIRST_NAME, APPLICANT_NO: 1, MIDDLE_NAME: req.body.PRIMARY_APPLICANT_MIDDLE_NAME, LAST_NAME: req.body.PRIMARY_APPLICANT_LAST_NAME, APPLICANT_ID: req.body.ID },
        { FIRST_NAME: req.body.APPLICANT2_FIRST_NAME, APPLICANT_NO: 2, MIDDLE_NAME: req.body.APPLICANT2_MIDDLE_NAME, LAST_NAME: req.body.APPLICANT2_LAST_NAME, APPLICANT_ID: req.body.ID },
        { FIRST_NAME: req.body.APPLICANT3_FIRST_NAME, APPLICANT_NO: 3, MIDDLE_NAME: req.body.APPLICANT3_MIDDLE_NAME, LAST_NAME: req.body.APPLICANT3_LAST_NAME, APPLICANT_ID: req.body.ID },
        { FIRST_NAME: req.body.APPLICANT4_FIRST_NAME, APPLICANT_NO: 4, MIDDLE_NAME: req.body.APPLICANT4_MIDDLE_NAME, LAST_NAME: req.body.APPLICANT4_LAST_NAME, APPLICANT_ID: req.body.ID }
    ]

    return data
}

// exports.get = async(req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const q = `select * from basic_details where ID = ?`;
//     try {
//         const results = await db.executeQueryData(q, [req.body.ID], supportKey);
//         if (results.length > 0 && results[0].APPLICANTS_DATA) {
//             console.log(results[0].APPLICANTS_DATA);
//             results[0].applicants = results[0].APPLICANTS_DATA;
//         }
//         res.send({
//             "code": 200,
//             "message": "OK",
//             "data": results
//         });
//     } catch (error) {
//         console.log("Error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to get personal details"
//         });
//     }
// };

// exports.create = async(req, res) => {
//     let data = reqData(req);
//     const applicants = req.body.applicants;
//     data.APPLICANTS_DATA = JSON.stringify(applicants);
//     let supportKey = req.headers['supportkey'];
//     let connection;

//     try {
//         connection = await db.openConnection();
//         data.MODIFIED_DATE = new Date();
//         const q = `insert into basic_details set ?`;
//         let basicInsert = await db.executeQueryData(q, data, supportKey);
//         const proposalId = basicInsert.insertId;

//         const q_tab = `insert into extra_information (APPLICANT_ID, TAB_ID) select ${proposalId}, ID from tab_master`;
//         await db.executeQuery(q_tab, supportKey);

//         for (let i = 0; i < applicants.length; i++) {
//             const applicant = applicants[i];
//             const applicantNo = i + 1;
//             let applicantPersonalData = {...getCommonApplicantInfo(), ...getAllApplicantsInfo(applicant, i + 1), APPLICANT_ID: proposalId };
//             let applicantPhotoData = { FIRST_NAME: applicant.FIRST_NAME, MIDDLE_NAME: applicant.MIDDLE_NAME, LAST_NAME: applicant.LAST_NAME, APPLICANT_ID: proposalId, APPLICANT_NO: applicantNo };

//             let applicantQuery = `insert into applicants_personal_details set ? `;
//             let applicantPhotosQuery = `insert into applicant_photos set ? `;
//             let applicantDocumentsQuery = `insert into applicant_documents (DOCUMENT_NAME,APPLICANT_ID,APPLICANT_NO) select DOCUMENT_NAME, ${proposalId}, ${applicantNo}  from document_master ORDER BY SEQ_NO`;

//             await db.executeQueryData(applicantQuery, applicantPersonalData, supportKey);
//             await db.executeQueryData(applicantPhotosQuery, applicantPhotoData, supportKey);
//             await db.executeQuery(applicantDocumentsQuery, supportKey);
//         }

//         await db.commitConnection(connection);
//         res.send({
//             "code": 200,
//             "message": "Basic details saved successfully",
//             "APPLICANT_ID": proposalId
//         });

//     } catch (error) {
//         console.log("error", error);
//         if (connection) {
//             await db.rollbackConnection(connection);
//         }
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to save basic details"
//         });
//     }
// }


exports.get = async(req, res) => {
    try {
        // 🔐 JWT context
        const user = req.user; // USER_ID, ROLE_ID, BANK_ID
        const db = req.db; // Bank DB pool

        if (!user) {
            return res.status(401).send({
                code: 401,
                message: 'User context missing'
            });
        }

        const { ID } = req.body;

        if (!ID) {
            return res.status(400).send({
                code: 400,
                message: 'ID is required'
            });
        }

        const q = `SELECT * FROM basic_details WHERE ID = ?`;

        const [results] = await db.promise().query(q, [ID]);

        if (results.length > 0 && results[0].APPLICANTS_DATA) {
            try {
                results[0].applicants = JSON.parse(results[0].APPLICANTS_DATA);
            } catch (e) {
                results[0].applicants = [];
            }
        }

        res.send({
            code: 200,
            message: 'OK',
            data: results
        });

    } catch (error) {
        console.log('GET BASIC DETAILS ERROR:', error);
        res.status(400).send({
            code: 400,
            message: 'Failed to get personal details'
        });
    }
};


exports.create = async(req, res) => {
    try {
        const data = reqData(req);
        const applicants = req.body.applicants || [];

        data.APPLICANTS_DATA = JSON.stringify(applicants);
        data.MODIFIED_DATE = new Date();

        // 🔐 JWT context
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                code: 401,
                message: 'User context missing'
            });
        }

        // ✅ AUTO FILL FROM JWT
        data.MAKER_USER_ID = user.USER_ID;
        data.CREATED_BRANCH_ID = user.BRANCH_ID;
        // data.BANK_ID = user.BANK_ID;


        // 🏦 BANK DB
        const pool = req.db;

        // 1️⃣ Insert basic_details
        const [basicInsert] = await pool
            .promise()
            .query(`INSERT INTO basic_details SET ?`, data);

        const proposalId = basicInsert.insertId;

        // 2️⃣ Insert extra_information
        await pool
            .promise()
            .query(
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

            await pool
                .promise()
                .query(`INSERT INTO applicants_personal_details SET ?`, applicantPersonalData);

            await pool
                .promise()
                .query(`INSERT INTO applicant_photos SET ?`, applicantPhotoData);

            await pool
                .promise()
                .query(
                    `INSERT INTO applicant_documents (DOCUMENT_NAME, APPLICANT_ID, APPLICANT_NO)
           SELECT DOCUMENT_NAME, ?, ? FROM document_master ORDER BY SEQ_NO`, [proposalId, applicantNo]
                );
        }

        // ✅ SUCCESS
        return res.send({
            code: 200,
            message: 'Basic details saved successfully',
            APPLICANT_ID: proposalId
        });

    } catch (error) {
        console.error('CREATE ERROR:', error);
        return res.status(400).send({
            code: 400,
            message: 'Failed to save basic details'
        });
    }
};


// exports.update1 = async(req, res) => {
//     const supportKey = req.headers['supportkey'];
//     let connection;
//     let ROLE_ID = req.body.ROLE_ID;
//     let data = ``;
//     const applicants = req.body.applicants;

//     if (ROLE_ID == 1) {
//         data = reqData(req);
//         data.APPLICANTS_DATA = JSON.stringify(applicants);
//         if (data.TRACK_ID == 2) data.MODIFIED_DATE = new Date();
//     } else if (ROLE_ID == 2) {
//         data = checkerAccess(req);
//         data.MODIFIED_DATE = new Date();
//     } else if (ROLE_ID == 3) {
//         data = cpcAccess(req);
//         data.MODIFIED_DATE = new Date();
//     } else {
//         data = reqData(req);
//     }

//     let setData = '';
//     let recData = [];
//     Object.keys(data).forEach(key => {
//         setData += `${key} = ? ,`;
//         recData.push(data[key]);
//     });
//     setData = setData.slice(0, -1);

//     const q = `update basic_details set ${setData} where ID = ${req.body.ID}`;

//     try {
//         connection = await db.openConnection();
//         await db.executeQueryData(q, recData, supportKey);

//         if (ROLE_ID == 1) {
//             for (let i = 0; i < applicants.length; i++) {
//                 const applicant = applicants[i];
//                 const applicantNo = i + 1;
//                 const existingApplicant = await db.executeQuery(`select * from applicants_personal_details where APPLICANT_ID = ${req.body.ID} AND APPLICANT_NO = ${applicantNo}`);

//                 if (existingApplicant.length > 0) {
//                     // Update existing applicant
//                     let applicantPersonalData = {...getAllApplicantsInfo(applicant, i + 1) };
//                     let updateQuery = `update applicants_personal_details set ? where ID = ?`;
//                     await db.executeQueryData(updateQuery, [applicantPersonalData, existingApplicant[0].ID], supportKey);
//                 } else {
//                     // Insert new applicant
//                     let applicantPersonalData = {...getCommonApplicantInfo(), ...getAllApplicantsInfo(applicant, i + 1), APPLICANT_ID: req.body.ID };
//                     let applicantPhotoData = { FIRST_NAME: applicant.FIRST_NAME, MIDDLE_NAME: applicant.MIDDLE_NAME, LAST_NAME: applicant.LAST_NAME, APPLICANT_ID: req.body.ID, APPLICANT_NO: applicantNo };

//                     let applicantQuery = `insert into applicants_personal_details set ? `;
//                     let applicantPhotosQuery = `insert into applicant_photos set ? `;
//                     let applicantDocumentsQuery = `insert into applicant_documents (DOCUMENT_NAME,APPLICANT_ID,APPLICANT_NO) select DOCUMENT_NAME, ${req.body.ID}, ${applicantNo}  from document_master ORDER BY SEQ_NO`;

//                     await db.executeQueryData(applicantQuery, applicantPersonalData, supportKey);
//                     await db.executeQueryData(applicantPhotosQuery, applicantPhotoData, supportKey);
//                     await db.executeQuery(applicantDocumentsQuery, supportKey);
//                 }
//             }
//         }

//         await db.commitConnection(connection);
//         res.send({
//             "code": 200,
//             "message": "Basic details updated successfully"
//         });

//     } catch (error) {
//         console.log(error);
//         if (connection) {
//             await db.rollbackConnection(connection);
//         }
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to update personal information."
//         });
//     }
// }

// exports.update = async(req, res) => {
//     const supportKey = req.headers['supportkey'];
//     const data = reqData(req);
//     let setData = '';
//     let recData = [];

//     Object.keys(data).forEach(key => {
//         setData += `${key} = ?,`;
//         recData.push(data[key]);
//     });

//     setData = setData.slice(0, -1);

//     const q = `update basic_details set ${setData} where ID = ?`;
//     recData.push(req.body.ID);

//     try {
//         await db.executeQueryData(q, recData, supportKey);
//         res.send({
//             "code": 200,
//             "message": "Basic details updated successfully"
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to update basic form details"
//         });
//     }
// };





exports.update1 = async(req, res) => {
    try {
        // 🔐 JWT context
        const user = req.user; // USER_ID, ROLE_ID, BANK_ID
        const db = req.db; // Bank DB pool

        if (!user) {
            return res.status(401).send({
                code: 401,
                message: 'User context missing'
            });
        }

        const ROLE_ID = user.ROLE_ID;
        const applicants = req.body.applicants || [];

        let data = {};

        // 🔁 ROLE WISE ACCESS
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

        // 🔧 BUILD UPDATE QUERY
        let setData = '';
        let values = [];

        Object.keys(data).forEach(key => {
            setData += `${key} = ?,`;
            values.push(data[key]);
        });

        setData = setData.slice(0, -1);
        values.push(req.body.ID);

        const q = `UPDATE basic_details SET ${setData} WHERE ID = ?`;

        await db.promise().query(q, values);

        // 👥 APPLICANTS HANDLING (ONLY FOR MAKER)
        if (ROLE_ID == 1) {
            for (let i = 0; i < applicants.length; i++) {
                const applicant = applicants[i];
                const applicantNo = i + 1;

                const [existing] = await db.promise().query(
                    `SELECT ID FROM applicants_personal_details 
                     WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`, [req.body.ID, applicantNo]
                );

                if (existing.length > 0) {
                    // UPDATE
                    const applicantPersonalData = {
                        ...getAllApplicantsInfo(applicant, applicantNo)
                    };

                    await db.promise().query(
                        `UPDATE applicants_personal_details SET ? WHERE ID = ?`, [applicantPersonalData, existing[0].ID]
                    );

                } else {
                    // INSERT
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

                    await db.promise().query(
                        `INSERT INTO applicants_personal_details SET ?`, [applicantPersonalData]
                    );

                    await db.promise().query(
                        `INSERT INTO applicant_photos SET ?`, [applicantPhotoData]
                    );

                    await db.promise().query(
                        `INSERT INTO applicant_documents (DOCUMENT_NAME, APPLICANT_ID, APPLICANT_NO)
                         SELECT DOCUMENT_NAME, ?, ? FROM document_master ORDER BY SEQ_NO`, [req.body.ID, applicantNo]
                    );
                }
            }
        }

        res.send({
            code: 200,
            message: 'Basic details updated successfully'
        });

    } catch (error) {
        console.log('UPDATE ERROR:', error);
        res.status(400).send({
            code: 400,
            message: 'Failed to update personal information'
        });
    }
};


exports.update = async(req, res) => {
    try {
        const db = req.db;

        const data = reqData(req);
        let setData = '';
        let values = [];

        Object.keys(data).forEach(key => {
            setData += `${key} = ?,`;
            values.push(data[key]);
        });

        setData = setData.slice(0, -1);
        values.push(req.body.ID);

        const q = `UPDATE basic_details SET ${setData} WHERE ID = ?`;

        await db.promise().query(q, values);

        res.send({
            code: 200,
            message: 'Basic details updated successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(400).send({
            code: 400,
            message: 'Failed to update basic form details'
        });
    }
};



function convertDate(date = null) {
    if (date)
        return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    else
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// exports.getAll = async (req, res) => {
//     const { user_details, filter: userFilter, pageIndex = '', pageSize = '', sortKey = 'MODIFIED_DATE', sortValue = 'DESC' } = req.body;
//     const supportKey = req.header ? req.header['supportkey'] : '';

//     const userFilterStr = `
//         ${userFilter.BRANCH_ID ? ` AND CREATED_BRANCH_ID = ${userFilter.BRANCH_ID}` : ''}
//         ${userFilter.TRACK_ID ? ` AND TRACK_ID = ${userFilter.TRACK_ID}` : ''}
//         ${userFilter.IS_AADHAAR_DBT === 'Y' ? ` AND IS_AADHAAR_DBT` : ''}
//         ${userFilter.IS_AADHAAR_DBT === 'N' ? ` AND NOT IS_AADHAAR_DBT OR ISNULL(IS_AADHAAR_DBT)` : ''}
//         ${userFilter.START_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) >= CAST('${convertDate(userFilter.START_DATE)}' AS DATE)` : ''}
//         ${userFilter.END_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) <= CAST('${convertDate(userFilter.END_DATE)}' AS DATE)` : ''}
//     `;

//     let filter = '';
//     const branchFilter = ` AND CREATED_BRANCH_ID = ${user_details.BRANCH_ID}`;
//     const chakerFilter = ` AND MAKER_USER_ID = ${user_details.USER_ID} ${branchFilter}`;
//     const makerFilter = ` AND CHACKER_USER_ID = ${user_details.USER_ID} ${branchFilter}`;
//     const verifierFilter = ` ${userFilterStr} AND (VERIFIER_USER_ID = ${user_details.USER_ID}  OR (ISNULL(VERIFIER_USER_ID) AND TRACK_ID = 3))`;

//     if (user_details.ROLE_ID == 1) filter = chakerFilter;
//     else if (user_details.ROLE_ID == 2) filter = makerFilter;
//     else if (user_details.ROLE_ID == 3) filter = verifierFilter;

//     let criteria = `${filter} order by ${sortKey} ${sortValue}`;
//     if (pageIndex && pageSize) {
//         const start = (pageIndex - 1) * pageSize;
//         criteria += ` LIMIT ${start},${pageSize}`;
//     }

//     const countCriteria = filter;

//     try {
//         const [resultCount, results] = await Promise.all([
//             db.executeQuery(`select count(*) as cnt from basic_details where 1 ${countCriteria}`, supportKey),
//             db.executeQuery(`select * from basic_details where 1 ${criteria}`, supportKey)
//         ]);

//         res.send({
//             "code": 200,
//             "message": "ok",
//             "count": resultCount[0] ? resultCount[0].cnt : 0,
//             "data": results
//         });
//     } catch (error) {
//         console.log("error", error);
//         res.status(400).send({
//             "code": 400,
//             "message": "Failed to get drafts"
//         });
//     }
// };




// exports.getAll = async (req, res) => {
//     try {
//         // 🔐 JWT मधून user context
//         const { USER_ID, ROLE_ID, BRANCH_ID } = req.user;

//         const {
//             filter = {},
//             pageIndex = '',
//             pageSize = '',
//             sortKey = 'MODIFIED_DATE',
//             sortValue = 'DESC'
//         } = req.body;

//         // 🔍 User applied filters
//         const userFilterStr = `
//             ${filter.TRACK_ID ? ` AND TRACK_ID = ${filter.TRACK_ID}` : ''}
//             ${filter.IS_AADHAAR_DBT === 'Y' ? ` AND IS_AADHAAR_DBT = 'Y'` : ''}
//             ${filter.IS_AADHAAR_DBT === 'N' ? ` AND (IS_AADHAAR_DBT = 'N' OR ISNULL(IS_AADHAAR_DBT))` : ''}
//             ${filter.START_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) >= '${filter.START_DATE}'` : ''}
//             ${filter.END_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) <= '${filter.END_DATE}'` : ''}
//         `;

//         // 🧠 Role based visibility
//         let roleFilter = '';

//         if (ROLE_ID === 1) {
//             // Checker
//             roleFilter = ` AND MAKER_USER_ID = ${USER_ID} AND CREATED_BRANCH_ID = ${BRANCH_ID}`;
//         } else if (ROLE_ID === 2) {
//             // Maker
//             roleFilter = ` AND CHACKER_USER_ID = ${USER_ID} AND CREATED_BRANCH_ID = ${BRANCH_ID}`;
//         } else if (ROLE_ID === 3) {
//             // Verifier
//             roleFilter = `
//                 AND (
//                     VERIFIER_USER_ID = ${USER_ID}
//                     OR (ISNULL(VERIFIER_USER_ID) AND TRACK_ID = 3)
//                 )
//             `;
//         }

//         let criteria = `
//             ${roleFilter}
//             ${userFilterStr}
//             ORDER BY ${sortKey} ${sortValue}
//         `;

//         if (pageIndex && pageSize) {
//             const start = (pageIndex - 1) * pageSize;
//             criteria += ` LIMIT ${start}, ${pageSize}`;
//         }

//         // 🏦 Bank DB (req.db already selected by middleware)
//         const [countResult, data] = await Promise.all([
//             req.db.promise().query(
//                 `SELECT COUNT(*) cnt FROM basic_details WHERE 1 ${roleFilter} ${userFilterStr}`
//             ),
//             req.db.promise().query(
//                 `SELECT * FROM basic_details WHERE 1 ${criteria}`
//             )
//         ]);

//         return res.send({
//             code: 200,
//             message: 'ok',
//             count: countResult[0][0]?.cnt || 0,
//             data: data[0]
//         });

//     } catch (error) {
//         console.log('error', error);
//         return res.status(400).send({
//             code: 400,
//             message: 'Failed to get drafts'
//         });
//     }
// };



// exports.getAll = async(req, res) => {
//         try {
//             // 🔐 USER DETAILS FROM JWT
//             const user_details = req.user;
//             // { USER_ID, ROLE_ID, BRANCH_ID, BANK_ID }

//             if (!user_details || !user_details.BRANCH_ID) {
//                 return res.status(401).send({
//                     code: 401,
//                     message: 'User context missing'
//                 });
//             }

//             const {
//                 filter = {},
//                     pageIndex = '',
//                     pageSize = '',
//                     sortKey = 'MODIFIED_DATE',
//                     sortValue = 'DESC'
//             } = req.body;

//             // 🔎 FILTER CONDITIONS
//             const userFilterStr = `
//       ${filter.BRANCH_ID ? ` AND CREATED_BRANCH_ID = ${filter.BRANCH_ID}` : ''}
//       ${filter.TRACK_ID ? ` AND TRACK_ID = ${filter.TRACK_ID}` : ''}
//       ${filter.START_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) >= CAST('${convertDate(filter.START_DATE)}' AS DATE)` : ''}
//       ${filter.END_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) <= CAST('${convertDate(filter.END_DATE)}' AS DATE)` : ''}
//     `;

//     let roleFilter = '';
//     const branchFilter = ` AND CREATED_BRANCH_ID = ${user_details.BRANCH_ID}`;

//     // 🧑‍💼 ROLE BASED LOGIC
//     if (user_details.ROLE_ID == 1) {
//       // Checker
//       roleFilter = ` AND MAKER_USER_ID = ${user_details.USER_ID} ${branchFilter}`;
//     } else if (user_details.ROLE_ID == 2) {
//       // Maker
//       roleFilter = ` AND CHACKER_USER_ID = ${user_details.USER_ID} ${branchFilter}`;
//     } else if (user_details.ROLE_ID == 3) {
//       // Verifier
//       roleFilter = `
//         ${userFilterStr}
//         AND (
//           VERIFIER_USER_ID = ${user_details.USER_ID}
//           OR (ISNULL(VERIFIER_USER_ID) AND TRACK_ID = 3)
//         )
//       `;
//     }

//     let criteria = `${roleFilter} ORDER BY ${sortKey} ${sortValue}`;

//     if (pageIndex && pageSize) {
//       const start = (pageIndex - 1) * pageSize;
//       criteria += ` LIMIT ${start}, ${pageSize}`;
//     }

//     // 🏦 BANK DB QUERY (req.db)
//     const [countResult, dataResult] = await Promise.all([
//       req.db.promise().query(
//         `SELECT COUNT(*) AS cnt FROM basic_details WHERE 1 ${roleFilter}`
//       ),
//       req.db.promise().query(
//         `SELECT * FROM basic_details WHERE 1 ${criteria}`
//       )
//     ]);

//     res.send({
//       code: 200,
//       message: 'ok',
//       count: countResult[0][0]?.cnt || 0,
//       data: dataResult[0]
//     });

//   } catch (error) {
//     console.log('getAll error:', error);
//     res.status(400).send({
//       code: 400,
//       message: 'Failed to get drafts'
//     });
//   }
// };


exports.getAll = async(req, res) => {
        try {
            // 🔐 JWT middleware मधून येतं
            const user = req.user;

            if (!user) {
                return res.status(401).send({
                    code: 401,
                    message: 'User context missing'
                });
            }

            const {
                filter = {},
                    pageIndex = '',
                    pageSize = '',
                    sortKey = 'MODIFIED_DATE',
                    sortValue = 'DESC'
            } = req.body;

            //     const userFilterStr = `
            //     ${filter.BRANCH_ID ? ` AND CREATED_BRANCH_ID = ${filter.BRANCH_ID}` : ''}
            //     ${filter.TRACK_ID ? ` AND TRACK_ID = ${filter.TRACK_ID}` : ''}
            //     ${filter.START_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) >= CAST('${filter.START_DATE}' AS DATE)` : ''}
            //     ${filter.END_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) <= CAST('${filter.END_DATE}' AS DATE)` : ''}
            // `;

            const userFilterStr = `
    ${filter.TRACK_ID ? ` AND TRACK_ID = ${filter.TRACK_ID}` : ''}
    ${filter.START_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) >= CAST('${filter.START_DATE}' AS DATE)` : ''}
    ${filter.END_DATE ? ` AND CAST(APPLICATION_DATE AS DATE) <= CAST('${filter.END_DATE}' AS DATE)` : ''}
`;


        let roleFilter = '';

        if (user.ROLE_ID == 1) {
            roleFilter = ` AND MAKER_USER_ID = ${user.USER_ID} AND CREATED_BRANCH_ID = ${user.BRANCH_ID}`;
        } else if (user.ROLE_ID == 2) {
            roleFilter = ` AND CHACKER_USER_ID = ${user.USER_ID} AND CREATED_BRANCH_ID = ${user.BRANCH_ID}`;
        } else if (user.ROLE_ID == 3) {
            roleFilter = ` AND (VERIFIER_USER_ID = ${user.USER_ID} OR (ISNULL(VERIFIER_USER_ID) AND TRACK_ID = 3))`;
        }

        let criteria = `${roleFilter} ${userFilterStr} ORDER BY ${sortKey} ${sortValue}`;

        if (pageIndex && pageSize) {
            const start = (pageIndex - 1) * pageSize;
            criteria += ` LIMIT ${start}, ${pageSize}`;
        }

        const [countResult, dataResult] = await Promise.all([
            req.db.promise().query(`SELECT COUNT(*) cnt FROM basic_details WHERE 1 ${roleFilter}`),
            req.db.promise().query(`SELECT * FROM basic_details WHERE 1 ${criteria}`)
        ]);

        res.send({
            code: 200,
            message: 'ok',
            count: countResult[0][0].cnt,
            data: dataResult[0]
        });

    } catch (error) {
        console.log('getAll error:', error);
        res.status(500).send({
            code: 500,
            message: 'Failed to get drafts'
        });
    }
};