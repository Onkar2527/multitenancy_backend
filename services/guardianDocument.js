const db = require('../utilities/dbModule');
const fs = require('fs');
const path = require('path');

function reqData(req) {
    return {
        APPLICANT_ID: req.body.APPLICANT_ID,
        APPLICANT_NO: req.body.APPLICANT_NO,
        DOCUMENT_NAME: req.body.DOCUMENT_NAME,
        FILE_TYPE: req.body.FILE_TYPE,
        CHECKER_REMARK: req.body.CHECKER_REMARK,
        MAKER_REMARK: req.body.MAKER_REMARK,
        VERIFIER_REMARK: req.body.VERIFIER_REMARK,
        IS_APPROVED_CHECKER: req.body.IS_APPROVED_CHECKER ? 1 : 0,
        IS_APPROVED_VERIFIER: req.body.IS_APPROVED_VERIFIER ? 1 : 0,
        REFILL_COUNT: req.body.REFILL_COUNT
    };
}

exports.getAllguardians = async (req, res) => {
    const pool = req.db;
    try {
        const { APPLICANT_ID, APPLICANT_NO } = req.body;
        if (!APPLICANT_ID) {
            return res.status(400).send({ code: 400, message: "APPLICANT_ID is required" });
        }

        let query = `SELECT * FROM guardian_documents WHERE APPLICANT_ID = ?`;
        const params = [APPLICANT_ID];
        if (APPLICANT_NO) {
            query += ` AND APPLICANT_NO = ?`;
            params.push(APPLICANT_NO);
        }

        const [rows] = await pool.promise().query(query, params);

        const resultsArray = await Promise.all(rows.map(async (doc) => {
            if (doc.FILE_LINK) {
                const normalizedPath = doc.FILE_LINK.replace(/\\/g, '/');
                const absolutePath = path.resolve(__dirname, '..', normalizedPath);
                if (fs.existsSync(absolutePath)) {
                    try {
                        doc.IMAGE_DATA = await fs.promises.readFile(absolutePath, { encoding: "utf-8" });
                    } catch (e) {
                        doc.IMAGE_DATA = "";
                    }
                }
            }
            return doc;
        }));

        res.send({ code: 200, data: resultsArray });
    } catch (error) {
        console.error("GET GUARDIAN DOCS ERROR:", error);
        res.status(400).send({ code: 400, message: "Failed to get guardian documents" });
    }
};

exports.create = async (req, res) => {
    const pool = req.db;
    try {
        const data = reqData(req);
        await pool.promise().query(`INSERT INTO guardian_documents SET ?`, [data]);
        res.send({ code: 200, message: "Document details saved successfully" });
    } catch (error) {
        console.error("CREATE GUARDIAN DOC ERROR:", error);
        res.status(400).send({ code: 400, message: "Failed to save document details" });
    }
};

exports.update = async (req, res) => {
    const pool = req.db;
    try {
        const { ID } = req.body;
        if (!ID) {
            return res.status(400).send({ code: 400, message: "ID is required" });
        }
        const data = reqData(req);
        await pool.promise().query(`UPDATE guardian_documents SET ? WHERE ID = ?`, [data, ID]);
        res.send({ code: 200, message: "Guardian information updated successfully" });
    } catch (error) {
        console.error("UPDATE GUARDIAN DOC ERROR:", error);
        res.status(400).send({ code: 400, message: "Failed to update guardian document" });
    }
};

exports.uploadDocument = async (req, res) => {
    const pool = req.db;
    try {
        const { ID, IMAGE_DATA, APPLICANT_ID, APPLICANT_NO, DOCUMENT_NAME, FILE_TYPE, MAKER_REMARK } = req.body;

        const [docs] = await pool.promise().query(`SELECT * FROM guardian_documents WHERE ID = ?`, [ID]);
        if (docs.length === 0) {
            return res.status(404).send({ code: 404, message: "Document not found" });
        }

        let filePath = docs[0].FILE_LINK;
        if (!filePath) {
            const uploadDir = './uploads/guardianDocuments/';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            filePath = path.join(uploadDir, `${genrateRandomKey(32)}.jpg`);
        }

        await fs.promises.writeFile(filePath, IMAGE_DATA, { flag: 'w' });

        const updateData = {
            APPLICANT_ID,
            APPLICANT_NO,
            DOCUMENT_NAME,
            FILE_TYPE,
            FILE_LINK: filePath,
            MAKER_REMARK
        };

        await pool.promise().query(`UPDATE guardian_documents SET ? WHERE ID = ?`, [updateData, ID]);
        res.send({ code: 200, message: "Document uploaded successfully" });
    } catch (error) {
        console.error("UPLOAD GUARDIAN DOC ERROR:", error);
        res.status(400).send({ code: 400, message: "Failed to upload document" });
    }
};

function genrateRandomKey(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
