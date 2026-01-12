const db = require('../utilities/dbModule');
const fs = require('fs');
const path = require('path');

exports.get = async (req, res) => {
    const pool = req.db;
    try {
        const { APPLICANT_ID, APPLICANT_NO } = req.body;
        if (!APPLICANT_ID) {
            return res.status(400).send({ code: 400, message: "APPLICANT_ID is required" });
        }

        let q = `SELECT * FROM applicant_photos WHERE APPLICANT_ID = ?`;
        const params = [APPLICANT_ID];
        if (APPLICANT_NO) {
            q += ' AND APPLICANT_NO = ?';
            params.push(APPLICANT_NO);
        }

        const [rows] = await pool.promise().query(q, params);
        res.send({ code: 200, message: "OK", data: rows });
    } catch (error) {
        console.error("GET PHOTO ERROR:", error);
        res.status(400).send({ code: 400, message: "Failed to get photo information" });
    }
};

exports.getAllApplicants = async (req, res) => {
    const pool = req.db;
    try {
        const { APPLICANT_ID } = req.body;
        const [rows] = await pool.promise().query(`SELECT * FROM applicant_photos WHERE APPLICANT_ID = ?`, [APPLICANT_ID]);

        const resultsArray = await Promise.all(rows.map(async (photo) => {
            if (photo.IMAGE_LINK && fs.existsSync(photo.IMAGE_LINK)) {
                try {
                    photo.IMAGE_DATA = await fs.promises.readFile(photo.IMAGE_LINK, { encoding: "utf-8" });
                } catch (e) {
                    photo.IMAGE_DATA = "";
                }
            }
            return photo;
        }));

        res.send({ code: 200, data: resultsArray });
    } catch (error) {
        console.error("GET ALL PHOTOS ERROR:", error);
        res.status(400).send({ code: 400, message: "Failed to get photos" });
    }
};

exports.upload = async (req, res) => {
    const pool = req.db;
    try {
        const { APPLICANT_ID, APPLICANT_NO, IMAGE_DATA } = req.body;

        const [existing] = await pool.promise().query(`SELECT * FROM applicant_photos WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`, [APPLICANT_ID, APPLICANT_NO]);
        if (existing.length === 0) {
            return res.status(400).send({ code: 400, message: "Applicant photo record not found" });
        }

        const folderPath = `./uploads/applicantsPhotos/APPLICANT_ID-${APPLICANT_ID}`;
        const filePath = path.join(folderPath, `APPLICANT_NO-${APPLICANT_NO}.jpg`);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        await fs.promises.writeFile(filePath, IMAGE_DATA);

        await pool.promise().query(`UPDATE applicant_photos SET IMAGE_LINK = ? WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`, [filePath, APPLICANT_ID, APPLICANT_NO]);

        res.send({ code: 200, message: "Photo uploaded successfully" });
    } catch (error) {
        console.error("UPLOAD PHOTO ERROR:", error);
        res.status(400).send({ code: 400, message: "Failed to upload photo" });
    }
};

exports.retrieve = async (req, res) => {
    const pool = req.db;
    try {
        const { APPLICANT_ID, APPLICANT_NO } = req.body;
        const [rows] = await pool.promise().query(`SELECT * FROM applicant_photos WHERE APPLICANT_ID = ? AND APPLICANT_NO = ?`, [APPLICANT_ID, APPLICANT_NO]);

        if (rows.length > 0 && rows[0].IMAGE_LINK && fs.existsSync(rows[0].IMAGE_LINK)) {
            const data = await fs.promises.readFile(rows[0].IMAGE_LINK, { encoding: "base64" });
            res.send({ code: 200, message: "ok", data });
        } else {
            res.status(404).send({ code: 404, message: "Image not found" });
        }
    } catch (error) {
        console.error("RETRIEVE PHOTO ERROR:", error);
        res.status(400).send({ code: 400, message: "Failed to retrieve image" });
    }
};
