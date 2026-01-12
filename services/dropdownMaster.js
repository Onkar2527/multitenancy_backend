const mm = require('../utilities/dbModule');
const { validationResult, body } = require('express-validator');
// const logger = require("../utilities/logger");

// const applicationkey = process.env.APPLICATION_KEY;

const dropdownMaster = 'dropdown_master';
const dropdownField = 'dropdown_field_master';

function reqDataDropdown(req) {
    let data = {
        NAME: req.body.NAME,
        TABLE_NAME: req.body.TABLE_NAME,

        // get parameters

    }

    return data;
}

function reqGetDataDropdown(req) {
    let data = {
        pageSize: req.body.pageSize,
        pageIndex: req.body.pageIndex,
        search: req.body.search,
        keyword: req.body.keyword
    }

    return data;
}


function reqDataFields(req) {
    let data = {
        TABLE_NAME: req.body.TABLE_NAME,
        FIELD_NAME: req.body.FIELD_NAME,
        FIELD_TYPE: req.body.FIELD_TYPE
    }

    return data;
}

function reqDataValues(req) {
    let data = {
        TABLE_NAME: req.body.TABLE_NAME,
        DATA: req.body.DATA //DATA will contain an object which will come from frontend.
    }

    return data;
}

exports.validate = function () {
    return [];
}


exports.get = async (req, res) => {
    let filter = reqGetDataDropdown(req);

    let criteria = '';

    let start = 0
    let end = 0

    let supportKey = req.headers['supportkey'];

    if (filter.search) {
        criteria = ` AND NAME LIKE '%${filter.keyword}%'`;
    }
    else {
        if (filter.pageIndex && filter.pageSize) {
            start = (filter.pageIndex - 1) * filter.pageSize;
            end = filter.pageSize;
            criteria = ` LIMIT ${start} , ${end}`
        }
    }


    try {
        // Execute the count query and the main query concurrently
        const [countResult, results] = await Promise.all([
            mm.executeQuery(`select count(*) as cnt from ${dropdownMaster}`, supportKey),
            mm.executeQuery(`select * from ${dropdownMaster} where 1 ${criteria}`, supportKey),
        ]);

        const totalCount = countResult[0].cnt;

        if (results.length === 0) {
            res.send({
                code: 200,
                message: "success",
                total_count: totalCount,
                data: [],
            });
            return;
        }

        // Create an array of promises for fetching field and dropdown data
        const fetchPromises = results.map(async (result) => {
            const fieldResult = await mm.executeQuery(`select * from ${dropdownField} where TABLE_NAME = '${result.TABLE_NAME}'`, supportKey);
            result.FIELDS = fieldResult;

            const valueResult = await mm.executeQuery(`select * from ${result.TABLE_NAME}`, supportKey);
            result.DROPDOWN_DATA = valueResult;

            return result;
        });

        // Wait for all promises to resolve
        const tableData = await Promise.all(fetchPromises);

        res.send({
            code: 200,
            message: "success",
            total_count: totalCount,
            data: tableData,
        });
    } catch (error) {
        console.error(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.send({
            code: 400,
            message: "Failed to get dropdown information.",
        });
    }

}

exports.create = async (req, res) => {
    const data = reqDataDropdown(req);
    const errors = validationResult(req);
    const supportKey = req.headers['supportkey'];

    const messages = {
        success: "Dropdown master information saved successfully...",
        error: "Failed to save dropdown master information...",
    };

    try {

        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(422).send({
                code: 422,
                message: errors.errors,
            });
        }

        let isTableCreated = null;

        // Execute the stored procedure to create the table
        const createTableResult = await mm.executeQueryData(`CALL create_dropdown_table(?)`, [data.TABLE_NAME], supportKey);

        // Retrieve the output parameter value
      
        await executeIfTableExist(data, supportKey, messages, req, res);

    } catch (error) {
        console.error(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.status(400).send({
            code: 400,
            message: "An error occurred while processing the request.",
        });
    }
};

exports.update = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    try {
        const ID = req.body.ID;
        const data = { NAME: req.body.NAME };
        const errors = validationResult(req);

        let setData = "";
        let recordData = [];
        Object.keys(data).forEach(key => {
            if (data[key]) {
                setData += `${key}= ? , `;
                recordData.push(data[key]);
            }
        });

        if (setData.endsWith(', ')) {
            setData = setData.slice(0, -2); // Removes the last two characters
        }

        if (!errors.isEmpty()) {
            console.log(errors);
            res.send({
                "code": 422,
                "message": errors.errors
            });
        } else {
            const results = await mm.executeQueryData(`UPDATE ` + dropdownMaster + ` SET ${setData}  where ID = ${ID} `, recordData, supportKey);
            console.log(results);
            res.send({
                "code": 200,
                "message": "Dropdown master information updated successfully...",
            });
        }
    } catch (error) {
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
        res.send({
            "code": 400,
            "message": "Failed to update dropdown master information."
        });
    }
};

exports.delete = async (req, res) => {
    let ID = req.body.ID;
    let table = req.body.TABLE_NAME;
    let supportKey = req.headers['supportkey'];

    try {
        await mm.executeQuery(`DELETE FROM ${dropdownField} WHERE TABLE_NAME = '${table}';`);

        await mm.executeQuery(`DELETE FROM ${dropdownMaster} WHERE ID = ${ID};`);

        res.send({
            code: 200,
            message: "success",
        });
    }
    catch (error) {
        console.error(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.send({
            code: 400,
            message: "Failed to delete dropdown.",
        });
    }
}


exports.getFields = async (req, res) => {
    let table = req.body.TABLE_NAME;

    let supportKey = req.headers['supportkey'];

    try {
        let result = await mm.executeQuery(`select * from ${dropdownField} where TABLE_NAME = '${table}'`, supportKey);

        res.send({
            code: 200,
            message: "success",
            data: result,
        });
    }
    catch (error) {
        console.error(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.send({
            code: 400,
            message: "Failed to get dropdown field information.",
        });
    }
}

exports.createFields = async (req, res) => {
    let data = reqDataFields(req);

    const errors = validationResult(req);

    let supportKey = req.headers['supportkey'];

    let messages = {
        success: "Dropdown field master information saved successfully...",
        error: "Failed to save dropdown field master information..."
    }

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            await mm.executeQuery(`ALTER TABLE ${data.TABLE_NAME} ADD ${data.FIELD_NAME} ${data.FIELD_TYPE}`, supportKey);
            await executeCreateQuery(data, dropdownField, supportKey, messages, req, res);
        }
        catch (error) {
            console.error(error);
            // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            res.send({
                code: 400,
                message: "Failed to get dropdown information.",
            });
        }
    }
}

exports.updateFields = async (req, res) => {

    let ID = req.body.ID;
    const supportKey = req.headers['supportkey'];
    const data = reqDataFields(req);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {

        try {
            const old_column_name = await mm.executeQuery(`SELECT FIELD_NAME FROM ${dropdownField} WHERE ID = ${ID}`, supportKey);

            console.log("old column name", old_column_name);

            if (old_column_name.length > 0) {
                let query = `ALTER TABLE ${data.TABLE_NAME}
                CHANGE COLUMN ${old_column_name[0].FIELD_NAME} ${data.FIELD_NAME} ${data.FIELD_TYPE};`

                await mm.executeQuery(query, supportKey);

                let setData = "";
                let recordData = [];
                Object.keys(data).forEach(key => {
                    if (data[key]) {
                        setData += `${key}= ? , `;
                        recordData.push(data[key]);
                    }
                });

                if (setData.endsWith(', ')) {
                    setData = setData.slice(0, -2); // Removes the last two characters
                }

                const results = await mm.executeQueryData(`UPDATE ` + dropdownField + ` SET ${setData}  where ID = ${ID} `, recordData, supportKey);
                console.log(results);
                res.send({
                    "code": 200,
                    "message": "Dropdown field information updated successfully...",
                });

            }
        }
        catch (error) {
            // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
            res.send({
                "code": 400,
                "message": "Failed to update dropdown value information."
            });
        }

    }



}

exports.deleteFields = async (req, res) => {
    let ID = req.body.ID;
    let table = req.body.TABLE_NAME;
    let column = req.body.FIELD_NAME;
    let supportKey = req.headers['supportkey'];

    try {
        await mm.executeQuery(`DELETE FROM ${dropdownField} WHERE ID = ${ID};`);

        await mm.executeQuery(`ALTER TABLE ${table} DROP COLUMN ${column};`);

        res.send({
            code: 200,
            message: "success",
        });
    }
    catch (error) {
        console.error(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.send({
            code: 400,
            message: "Failed to delete dropdown values information.",
        });
    }

}

exports.getValues = async (req, res) => {
    let table = req.body.TABLE_NAME;

    let supportKey = req.headers['supportkey'];

    try {
        let result = await mm.executeQuery(`select * from ${table};`, supportKey);

        res.send({
            code: 200,
            message: "success",
            data: result,
        });
    }
    catch (error) {
        console.error(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.send({
            code: 400,
            message: "Failed to get dropdown values information.",
        });
    }
}

exports.createValues = async (req, res) => {
    let data = reqDataValues(req);

    const errors = validationResult(req);

    let supportKey = req.headers['supportkey'];

    let messages = {
        success: "Dropdown value information saved successfully...",
        error: "Failed to save dropdown value information..."
    }

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        await executeCreateQuery(data.DATA, data.TABLE_NAME, supportKey, messages, req, res);
    }
}

exports.updateValues = async (req, res) => {
    const supportKey = req.headers['supportkey'];
    try {
        const ID = req.body.DATA.ID;
        const data = reqDataValues(req);
        const errors = validationResult(req);

        let setData = "";
        let recordData = [];
        Object.keys(data.DATA).forEach(key => {
            if (data.DATA[key]) {
                setData += `${key}= ? , `;
                recordData.push(data.DATA[key]);
            }
        });

        if (setData.endsWith(', ')) {
            setData = setData.slice(0, -2); // Removes the last two characters
        }

        if (!errors.isEmpty()) {
            console.log(errors);
            res.send({
                "code": 422,
                "message": errors.errors
            });
        } else {
            const results = await mm.executeQueryData(`UPDATE ` + data.TABLE_NAME + ` SET ${setData}  where ID = ${ID} `, recordData, supportKey);
            console.log(results);
            res.send({
                "code": 200,
                "message": "Dropdown value information updated successfully...",
            });
        }
    } catch (error) {
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
        res.send({
            "code": 400,
            "message": "Failed to update dropdown value information."
        });
    }
}

exports.deleteValues = async (req, res) => {
    let ID = req.body.DATA.ID;
    let table = req.body.TABLE_NAME;
    let supportKey = req.headers['supportkey'];

    try {
        await mm.executeQuery(`DELETE FROM ${table} WHERE ID = ${ID};`);

        res.send({
            code: 200,
            message: "success",
        });
    }
    catch (error) {
        console.error(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.send({
            code: 400,
            message: "Failed to delete dropdown values information.",
        });
    }
}

async function executeCreateQuery(data, table, supportKey, messages, req, res) {
    try {
        const results = await mm.executeQueryData('INSERT INTO ' + table + ' SET ?', data, supportKey);
        console.log(results);
        res.send({
            "code": 200,
            "message": messages.success
        });
    } catch (error) {
        console.log(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.status(400).send({
            "code": 400,
            "message": messages.error
        });
    }
}

async function executeIfTableExist(data, supportKey, messages, req, res) {
    try {
        const result = await mm.executeQuery(`DESCRIBE  ${data.TABLE_NAME}`, supportKey);
        const tableSchema = result.map((row) => ({
            FIELD_NAME: row.Field,
            FIELD_TYPE: row.Type,
            TABLE_NAME: data.TABLE_NAME
        }));

        await Promise.all(tableSchema.map(scheme => 
            mm.executeQueryData(`INSERT INTO ${dropdownField} SET ?`, scheme, supportKey)
        ));

        await executeCreateQuery(data, dropdownMaster, supportKey, messages, req, res);

    } catch (error) {
        console.log(error);
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.status(400).send({
            "code": 400,
            "message": messages.error
        });
    }
}
