const db = require('../utilities/dbModule')
const fs = require('fs');
const path = require('path');
const async = require('async');

//const IncomingForm = require('formidable').IncomingForm;




exports.get = async (req, res) => {
    console.log("reqbody", req.body);
    const supportKey = req.headers['supportkey'];
    const q = `select * from applicant_photos where APPLICANT_ID = ? ` + (req.body.APPLICANT_NO ? 'AND APPLICANT_NO = ?' : '');
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
        console.log("Error", error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to get applicant photos information"
        });
    }
};

exports.getAllApplicants = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    
    try {
        const applicantsPhotoResult = await db.executeQuery(`select * from applicant_photos where APPLICANT_ID = ${req.body.APPLICANT_ID}`, supportKey);

        if (applicantsPhotoResult.length > 0) {
            const resultsArray = await Promise.all(applicantsPhotoResult.map(async (applicant) => {
                if (applicant.IMAGE_LINK) {
                    try {
                        applicant.IMAGE_DATA = await fs.promises.readFile(applicant.IMAGE_LINK, { encoding: "utf-8" });
                    } catch (error) {
                        console.log(error);
                        applicant.IMAGE_DATA = "";
                    }
                }
                return applicant;
            }));
            res.send({ "code": 200, "data": resultsArray });
        } else {
            console.log("applicant doesn't exist");
            res.send({ "code": 200, "data": [] });
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            "code": 400,
            "message": "failed to get applicant photos information"
        });
    }
};



exports.upload = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    let connection;

    try {
        const { APPLICANT_ID, APPLICANT_NO, IMAGE_DATA } = req.body;

        const applicantPhotoRes = await db.executeQueryData(`select * from applicant_photos where APPLICANT_ID = ? AND APPLICANT_NO = ?`, [APPLICANT_ID, APPLICANT_NO], supportKey);

        if (applicantPhotoRes.length === 0) {
            return res.status(400).send({
                "code": 400,
                "message": "Applicant does not exist"
            });
        }

        const folderName = `APPLICANT_ID-${APPLICANT_ID}`;
        const fileName = `APPLICANT_NO-${APPLICANT_NO}.jpg`;
        const folderPath = `./uploads/applicantsPhotos/${folderName}`;
        const filePath = `${folderPath}/${fileName}`;

        await fs.promises.mkdir(folderPath, { recursive: true });
        await fs.promises.writeFile(filePath, IMAGE_DATA);

        connection = await db.openConnection();
        await db.executeQueryData(`update applicant_photos set IMAGE_LINK = ? where APPLICANT_ID = ? AND APPLICANT_NO = ?`, [filePath, APPLICANT_ID, APPLICANT_NO], supportKey);
        await db.commitConnection(connection);

        res.send({
            "code": 200,
            "message": "Photo upload successful."
        });

    } catch (error) {
        console.log("Error in upload:", error);
        if (connection) {
            await db.rollbackConnection(connection);
        }
        res.status(400).send({
            "code": 400,
            "message": "Failed to upload applicant photo"
        });
    }
};

exports.retrieve = async (req, res) => {
    const supportKey = req.headers['supportkey'];

    try {
        const applicantPhotoResult = await db.executeQuery(`select * from applicant_photos where APPLICANT_ID = ${req.body.APPLICANT_ID} AND APPLICANT_NO = ${req.body.APPLICANT_NO}`, supportKey);

        if (applicantPhotoResult.length > 0 && applicantPhotoResult[0].IMAGE_LINK) {
            const IMAGE_DATA = await fs.promises.readFile(applicantPhotoResult[0].IMAGE_LINK, { encoding: "base64" });
            res.send({
                "code": 200,
                "message": "ok",
                "data": IMAGE_DATA
            });
        } else {
            res.status(404).send({
                "code": 404,
                "message": "Image not found"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({
            "code": 400,
            "message": "Failed to retrieve image"
        });
    }
};
