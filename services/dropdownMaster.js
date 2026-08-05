const { validationResult } = require('express-validator');
const { masterPool } = require('../utilities/dbConfig');

const dropdownMaster = 'dropdown_master';
const dropdownField = 'dropdown_field_master';

/**
 * Checks if the table name refers to a shared/master table in fco_super_admin.
 * Returns an object with the pool to use and the query/params to execute.
 */
const getTableQueryContext = (tableName, req) => {
    const isMasterTable = ['bank_master', 'branch_master', 'user_master'].includes(tableName);
    const bankId = req.user?.BANK_ID;

    if (isMasterTable) {
        let sql = `SELECT * FROM ??`;
        let params = [tableName];

        if (bankId) {
            if (tableName === 'bank_master') {
                sql += ` WHERE ID = ?`;
                params.push(bankId);
            } else {
                sql += ` WHERE BANK_ID = ?`;
                params.push(bankId);
            }
        }

        return {
            pool: masterPool,
            sql,
            params
        };
    }

    // Default: use tenant database (req.db) and no filtering
    return {
        pool: req.db,
        sql: `SELECT * FROM ??`,
        params: [tableName]
    };
};

const seedDefaultDropdownsIfEmpty = async (db) => {
    try {
        const [[{ cnt }]] = await db.promise().query(`SELECT COUNT(*) as cnt FROM ${dropdownMaster}`);
        if (cnt > 0) return; // Already has dropdowns

        console.log("🌱 Seeding default dropdown masters dynamically to tenant DB...");
        const defaultTables = [
            { name: 'Bank Master', table: 'bank_master', isMaster: true },
            { name: 'Branch Master', table: 'branch_master', isMaster: true },
            { name: 'User Master', table: 'user_master', isMaster: true },
            { name: 'Role Master', table: 'role_master', isMaster: true }
        ];

        for (const item of defaultTables) {
            const [existing] = await db.promise().query(`SELECT * FROM ${dropdownMaster} WHERE TABLE_NAME = ?`, [item.table]);
            if (existing.length === 0) {
                // Insert dropdown configuration
                await db.promise().query(`INSERT INTO ${dropdownMaster} SET ?`, {
                    NAME: item.name,
                    TABLE_NAME: item.table
                });

                // Dynamically fetch schema using DESCRIBE query on the correct database context
                const pool = item.isMaster ? masterPool : db;
                const [describeResult] = await pool.promise().query(`DESCRIBE ??`, [item.table]);

                const tableSchema = describeResult.map((row) => ({
                    FIELD_NAME: row.Field,
                    FIELD_TYPE: row.Type,
                    TABLE_NAME: item.table
                }));

                // Seed dynamic field schemas into dropdown_field_master
                for (const scheme of tableSchema) {
                    await db.promise().query(`INSERT INTO ${dropdownField} SET ?`, scheme);
                }
            }
        }
        console.log("🌱 Default dropdown dynamic seeding complete.");
    } catch (error) {
        console.error("❌ ERROR SEEDING DEFAULT DROPDOWNS:", error);
    }
};

const reqDataDropdown = (req) => {
    return {
        NAME: req.body.NAME,
        TABLE_NAME: req.body.TABLE_NAME,
    };
};

const reqGetDataDropdown = (req) => {
    return {
        pageSize: req.body.pageSize,
        pageIndex: req.body.pageIndex,
        search: req.body.search,
        keyword: req.body.keyword
    };
};

const reqDataFields = (req) => {
    return {
        TABLE_NAME: req.body.TABLE_NAME,
        FIELD_NAME: req.body.FIELD_NAME,
        FIELD_TYPE: req.body.FIELD_TYPE
    };
};

const reqDataValues = (req) => {
    return {
        TABLE_NAME: req.body.TABLE_NAME,
        DATA: req.body.DATA
    };
};

// -------------------------------
// GET DROPDOWN MASTER
exports.get = async (req, res) => {
    try {
        await seedDefaultDropdownsIfEmpty(req.db);
        const filter = reqGetDataDropdown(req);
        let sql = `SELECT * FROM ${dropdownMaster} WHERE 1`;
        let countSql = `SELECT COUNT(*) as cnt FROM ${dropdownMaster} WHERE 1`;
        const params = [];
        const countParams = [];

        if (filter.search && filter.keyword) {
            sql += ` AND NAME LIKE ?`;
            countSql += ` AND NAME LIKE ?`;
            params.push(`%${filter.keyword}%`);
            countParams.push(`%${filter.keyword}%`);
        }

        if (filter.pageIndex && filter.pageSize && !filter.search) {
            const start = (filter.pageIndex - 1) * filter.pageSize;
            sql += ` LIMIT ?, ?`;
            params.push(start, Number(filter.pageSize));
        }

        const [[countResult], [results]] = await Promise.all([
            req.db.promise().query(countSql, countParams),
            req.db.promise().query(sql, params)
        ]);

        const totalCount = countResult[0]?.cnt || 0;

        if (results.length === 0) {
            return res.send({
                code: 200,
                message: "success",
                total_count: totalCount,
                data: [],
            });
        }

        const fetchPromises = results.map(async (result) => {
            const [fieldResult] = await req.db.promise().query(`SELECT * FROM ${dropdownField} WHERE TABLE_NAME = ?`, [result.TABLE_NAME]);
            result.FIELDS = fieldResult;

            // Query either master or tenant DB depending on table name
            const context = getTableQueryContext(result.TABLE_NAME, req);
            const [valueResult] = await context.pool.promise().query(context.sql, context.params);
            result.DROPDOWN_DATA = valueResult;

            return result;
        });

        const tableData = await Promise.all(fetchPromises);

        return res.send({
            code: 200,
            message: "success",
            total_count: totalCount,
            data: tableData,
        });

    } catch (error) {
        console.error('❌ DROPDOWN GET ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to get dropdown information.",
        });
    }
};

// -------------------------------
// CREATE DROPDOWN MASTER
exports.create = async (req, res) => {
    try {
        const data = reqDataDropdown(req);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).send({
                code: 422,
                message: errors.errors,
            });
        }

        // Execute stored procedure to create table
        await req.db.promise().query(`CALL create_dropdown_table(?)`, [data.TABLE_NAME]);

        // Proceed to sync schema
        await executeIfTableExist(data, req, res);

    } catch (error) {
        console.error('❌ DROPDOWN CREATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "An error occurred while processing the request.",
        });
    }
};

// -------------------------------
// UPDATE DROPDOWN MASTER
exports.update = async (req, res) => {
    try {
        const { ID, NAME } = req.body;
        const errors = validationResult(req);

        if (!ID) {
            return res.status(400).send({
                code: 400,
                message: 'ID is required'
            });
        }

        if (!errors.isEmpty()) {
            return res.status(422).send({
                code: 422,
                message: errors.errors
            });
        }

        await req.db.promise().query(`UPDATE ${dropdownMaster} SET NAME = ? WHERE ID = ?`, [NAME, ID]);

        return res.send({
            code: 200,
            message: "Dropdown master information updated successfully...",
        });

    } catch (error) {
        console.error('❌ DROPDOWN UPDATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to update dropdown master information."
        });
    }
};

// -------------------------------
// DELETE DROPDOWN MASTER
exports.delete = async (req, res) => {
    try {
        const { ID, TABLE_NAME } = req.body;

        if (!ID || !TABLE_NAME) {
            return res.status(400).send({
                code: 400,
                message: 'ID and TABLE_NAME are required'
            });
        }

        await req.db.promise().query(`DELETE FROM ${dropdownField} WHERE TABLE_NAME = ?`, [TABLE_NAME]);
        await req.db.promise().query(`DELETE FROM ${dropdownMaster} WHERE ID = ?`, [ID]);

        // Optionally drop the dynamic table? Original code didn't drop it.

        return res.send({
            code: 200,
            message: "success",
        });

    } catch (error) {
        console.error('❌ DROPDOWN DELETE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to delete dropdown.",
        });
    }
};

// -------------------------------
// GET FIELDS
exports.getFields = async (req, res) => {
    try {
        const { TABLE_NAME } = req.body;

        if (!TABLE_NAME) {
            return res.status(400).send({
                code: 400,
                message: 'TABLE_NAME is required'
            });
        }

        const [rows] = await req.db.promise().query(`SELECT * FROM ${dropdownField} WHERE TABLE_NAME = ?`, [TABLE_NAME]);

        return res.send({
            code: 200,
            message: "success",
            data: rows,
        });

    } catch (error) {
        console.error('❌ GET FIELDS ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to get dropdown field information.",
        });
    }
};

// -------------------------------
// CREATE FIELD
exports.createFields = async (req, res) => {
    try {
        const data = reqDataFields(req);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).send({
                code: 422,
                message: errors.errors
            });
        }

        // ALTER TABLE with backticked identifiers
        await req.db.promise().query(`ALTER TABLE ?? ADD ?? ${data.FIELD_TYPE}`, [data.TABLE_NAME, data.FIELD_NAME]);

        const messages = {
            success: "Dropdown field master information saved successfully...",
            error: "Failed to save dropdown field master information..."
        };

        await executeCreateQuery(data, dropdownField, messages, req, res);

    } catch (error) {
        console.error('❌ CREATE FIELD ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to create dropdown field.",
        });
    }
};

// -------------------------------
// UPDATE FIELD
exports.updateFields = async (req, res) => {
    try {
        const { ID } = req.body;
        const data = reqDataFields(req);
        const errors = validationResult(req);

        if (!ID) {
            return res.status(400).send({
                code: 400,
                message: 'ID is required'
            });
        }

        if (!errors.isEmpty()) {
            return res.status(422).send({
                code: 422,
                message: errors.errors
            });
        }

        const [oldRows] = await req.db.promise().query(`SELECT FIELD_NAME FROM ${dropdownField} WHERE ID = ?`, [ID]);

        if (oldRows.length > 0) {
            const old_field = oldRows[0].FIELD_NAME;

            // CHANGE COLUMN requires backticking
            await req.db.promise().query(`ALTER TABLE ?? CHANGE COLUMN ?? ?? ${data.FIELD_TYPE}`, [data.TABLE_NAME, old_field, data.FIELD_NAME]);

            await req.db.promise().query(`UPDATE ${dropdownField} SET ? WHERE ID = ?`, [data, ID]);

            return res.send({
                code: 200,
                message: "Dropdown field information updated successfully...",
            });
        } else {
            return res.status(404).send({
                code: 404,
                message: "Field not found"
            });
        }

    } catch (error) {
        console.error('❌ UPDATE FIELD ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to update dropdown value information."
        });
    }
};

// -------------------------------
// DELETE FIELD
exports.deleteFields = async (req, res) => {
    try {
        const { ID, TABLE_NAME, FIELD_NAME } = req.body;

        if (!ID || !TABLE_NAME || !FIELD_NAME) {
            return res.status(400).send({
                code: 400,
                message: 'ID, TABLE_NAME, and FIELD_NAME are required'
            });
        }

        await req.db.promise().query(`DELETE FROM ${dropdownField} WHERE ID = ?`, [ID]);
        await req.db.promise().query(`ALTER TABLE ?? DROP COLUMN ??`, [TABLE_NAME, FIELD_NAME]);

        return res.send({
            code: 200,
            message: "success",
        });

    } catch (error) {
        console.error('❌ DELETE FIELD ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to delete dropdown values information.",
        });
    }
};

// -------------------------------
// GET VALUES
exports.getValues = async (req, res) => {
    try {
        const { TABLE_NAME } = req.body;

        if (!TABLE_NAME) {
            return res.status(400).send({
                code: 400,
                message: 'TABLE_NAME is required'
            });
        }

        const context = getTableQueryContext(TABLE_NAME, req);
        const [rows] = await context.pool.promise().query(context.sql, context.params);

        return res.send({
            code: 200,
            message: "success",
            data: rows,
        });

    } catch (error) {
        console.error('❌ GET VALUES ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to get dropdown values information.",
        });
    }
};

// -------------------------------
// CREATE VALUE
exports.createValues = async (req, res) => {
    try {
        const { TABLE_NAME, DATA } = req.body;
        const errors = validationResult(req);

        if (!TABLE_NAME || !DATA) {
            return res.status(400).send({
                code: 400,
                message: 'TABLE_NAME and DATA are required'
            });
        }

        if (!errors.isEmpty()) {
            return res.status(422).send({
                code: 422,
                message: errors.errors
            });
        }

        const messages = {
            success: "Dropdown value information saved successfully...",
            error: "Failed to save dropdown value information..."
        };

        await executeCreateQuery(DATA, TABLE_NAME, messages, req, res);

    } catch (error) {
        console.error('❌ CREATE VALUE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to save dropdown value."
        });
    }
};

// -------------------------------
// UPDATE VALUE
exports.updateValues = async (req, res) => {
    try {
        const { TABLE_NAME, DATA } = req.body;
        const ID = DATA?.ID;

        if (!TABLE_NAME || !ID) {
            return res.status(400).send({
                code: 400,
                message: 'TABLE_NAME and DATA.ID are required'
            });
        }

        const isMasterTable = ['bank_master', 'branch_master', 'user_master'].includes(TABLE_NAME);
        const pool = isMasterTable ? masterPool : req.db;

        await pool.promise().query(`UPDATE ?? SET ? WHERE ID = ?`, [TABLE_NAME, DATA, ID]);

        return res.send({
            code: 200,
            message: "Dropdown value information updated successfully...",
        });

    } catch (error) {
        console.error('❌ UPDATE VALUE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to update dropdown value information."
        });
    }
};

// -------------------------------
// DELETE VALUE
exports.deleteValues = async (req, res) => {
    try {
        const { TABLE_NAME, DATA } = req.body;
        const ID = DATA?.ID;

        if (!TABLE_NAME || !ID) {
            return res.status(400).send({
                code: 400,
                message: 'TABLE_NAME and DATA.ID are required'
            });
        }

        const isMasterTable = ['bank_master', 'branch_master', 'user_master'].includes(TABLE_NAME);
        const pool = isMasterTable ? masterPool : req.db;

        await pool.promise().query(`DELETE FROM ?? WHERE ID = ?`, [TABLE_NAME, ID]);

        return res.send({
            code: 200,
            message: "success",
        });

    } catch (error) {
        console.error('❌ DELETE VALUE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Failed to delete dropdown values information.",
        });
    }
};

// -------------------------------
// HELPER: executeCreateQuery
async function executeCreateQuery(data, table, messages, req, res) {
    try {
        const isMasterTable = ['bank_master', 'branch_master', 'user_master'].includes(table);
        const pool = isMasterTable ? masterPool : req.db;
        await pool.promise().query(`INSERT INTO ?? SET ?`, [table, data]);

        return res.send({
            code: 200,
            message: messages.success
        });
    } catch (error) {
        console.error('❌ HELPER CREATE ERROR:', error);
        return res.status(400).send({
            code: 400,
            message: messages.error
        });
    }
}

// -------------------------------
// HELPER: executeIfTableExist
async function executeIfTableExist(data, req, res) {
    try {
        const [result] = await req.db.promise().query(`DESCRIBE ??`, [data.TABLE_NAME]);

        const tableSchema = result.map((row) => ({
            FIELD_NAME: row.Field,
            FIELD_TYPE: row.Type,
            TABLE_NAME: data.TABLE_NAME
        }));

        await Promise.all(tableSchema.map(scheme =>
            req.db.promise().query(`INSERT INTO ${dropdownField} SET ?`, scheme)
        ));

        const messages = {
            success: "Dropdown master information saved successfully...",
            error: "Failed to save dropdown master information..."
        };

        await executeCreateQuery(data, dropdownMaster, messages, req, res);

    } catch (error) {
        console.error('❌ HELPER SCHEMA SYNC ERROR:', error);
        return res.status(400).send({
            code: 400,
            message: "Failed to sync dropdown table schema."
        });
    }
}
