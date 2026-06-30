const db = require('../../utilities/dbModule');
const jwt = require('jsonwebtoken');

var userMaster = 'user_master';
var viewUserMaster = 'view_' + userMaster




exports.login = async (req, res) => {
    try {
        const { USER_NAME: username, PASSWORD: password } = req.body;

        if (!username || !password) {
            return res.status(400).send({
                code: 400,
                message: "Username or password parameter missing"
            });
        }

        const users = await db.executeMasterQuery(
            `SELECT u.*, b.BRANCH_NAME 
             FROM user_master u 
             LEFT JOIN branch_master b ON u.BRANCH_ID = b.ID 
             WHERE BINARY u.USER_NAME = ? AND BINARY u.PASSWORD = ? AND u.IS_ACTIVE = 1`,
            [username, password]
        );

        if (users.length !== 1) {
            return res.status(404).send({
                code: 404,
                message: "Username OR Password does not exist"
            });
        }

        const user = users[0];
        const current_dt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await db.executeMasterQuery(
            `UPDATE user_master SET LAST_LOGIN_TIME = ? WHERE ID = ?`,
            [current_dt, user.ID]
        );

        // ... (password policy logic omitted for brevity, but stays same) ...
        // Note: I will only replace the parts I need to change or keep the context.
        // Actually I should be careful not to delete the policy logic.

        // I will use multi_replace for better precision if needed, but I'll try to include the relevant part here.

        // Wait, I better use multi_replace to avoid mess.

        // Fetch Password Policy per BANK_ID
        const policies = await db.executeMasterQuery(
            `SELECT * FROM password_policy WHERE IS_ACTIVE = 1 AND BANK_ID = ? ORDER BY UPDATE_DATE DESC LIMIT 1`,
            [user.BANK_ID]
        );

        if (policies.length > 0) {
            const policy = policies[0];
            let forcePasswordReset = false;
            let resetMessage = "";

            // 1. Check if PASSWORD_RESET_DATE is missing
            if (!user.PASSWORD_RESET_DATE) {
                forcePasswordReset = true;
                resetMessage = "Please reset your password to something secure.";
            } else {
                // 2. Check Password Expiry
                const diff = await db.executeMasterQuery(
                    `SELECT TIMESTAMPDIFF(DAY, ?, ?) AS DAYS`,
                    [user.PASSWORD_RESET_DATE, current_dt]
                );
                const daysSinceReset = (diff && diff.length > 0) ? (diff[0].DAYS || 0) : 0;

                if (daysSinceReset >= policy.FR_PASSWORD_RESET) {
                    forcePasswordReset = true;
                    resetMessage = "Your password has expired. Please reset it.";
                } else {
                    // 3. Check Complexity Pattern
                    const patternStr =
                        `^(?=(.*[A-Z]){${policy.FR_CAPITAL_LETTERS},})` +
                        `(?=(.*[a-z]){${policy.FR_SMALL_LETTERS},})` +
                        `(?=(.*\\d){${policy.FR_NUMBERS},})` +
                        `(?=(.*[\\W_]){${policy.FR_SYMBOLS},}).{${policy.PASSWORD_LENGTH},}$`;

                    const regex = new RegExp(patternStr);
                    if (!regex.test(password)) {
                        forcePasswordReset = true;
                        resetMessage = "Password policy has been updated. Please reset your password.";
                    }
                }
            }

            if (forcePasswordReset) {
                return res.send({
                    code: 200,
                    forcePasswordReset: true,
                    message: resetMessage,
                    data: {
                        ID: user.ID,
                        BANK_ID: user.BANK_ID,
                        ROLE_ID: user.ROLE_ID,
                        USER_NAME: user.USER_NAME
                    }
                });
            }
        }

        // Standard Success Response
        const tokenPayload = {
            USER_ID: user.ID,
            USER_NAME: user.USER_NAME,
            BANK_ID: user.BANK_ID,
            ROLE_ID: user.ROLE_ID,
            BRANCH_ID: user.BRANCH_ID,
            BRANCH_NAME: user.BRANCH_NAME
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8H' }
        );

        return res.send({
            code: 200,
            token,
            data: {
                ID: user.ID,
                BANK_ID: user.BANK_ID,
                ROLE_ID: user.ROLE_ID,
                BRANCH_ID: user.BRANCH_ID,
                BRANCH_NAME: user.BRANCH_NAME,
                NAME: user.NAME,
                USER_NAME: user.USER_NAME,
                LAST_LOGIN_TIME: current_dt
            }
        });

    } catch (error) {
        console.error('LOGIN ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal server error"
        });
    }
};



exports.getUser = async (req, res) => {
    try {
        const { BRANCH_ID, ROLE_ID, ID: USER_ID } = req.body;
        const BANK_ID = req.user?.BANK_ID;

        let query = `SELECT * FROM user_master WHERE 1`;
        const params = [];

        if (BRANCH_ID) {
            query += ` AND BRANCH_ID = ?`;
            params.push(BRANCH_ID);
        }
        if (ROLE_ID) {
            query += ` AND ROLE_ID = ?`;
            params.push(ROLE_ID);
        }
        if (USER_ID) {
            query += ` AND ID = ?`;
            params.push(USER_ID);
        }
        if (BANK_ID) {
            query += ` AND BANK_ID = ?`;
            params.push(BANK_ID);
        }

        const result = await db.executeMasterQuery(query, params);

        return res.send({
            code: 200,
            message: "success",
            data: result
        });
    } catch (error) {
        console.error('❌ getUser error:', error);
        return res.status(400).send({
            code: 400,
            message: "Failed to get user details"
        });
    }
};





exports.getUserBranch = async (req, res) => {
    try {
        const BRANCH_ID = req.user.BRANCH_ID; // 🔐 JWT मधून
        const query = `SELECT * FROM branch_master WHERE ID = ?`;

        const [result] = await db.executeMasterQuery(query, [BRANCH_ID]);

        return res.send({
            code: 200,
            message: "success",
            data: result ? [result] : []
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            code: 400,
            message: "Failed to get user's branch"
        });
    }
};


exports.getUserRole = async (req, res) => {
    try {
        const ROLE_ID = req.user.ROLE_ID; // 🔐 JWT मधून
        const query = `SELECT * FROM role_master WHERE ID = ?`;

        const [result] = await db.executeMasterQuery(query, [ROLE_ID]);

        return res.send({
            code: 200,
            message: "success",
            data: result ? [result] : []
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            code: 400,
            message: "Failed to get user's role"
        });
    }
};




exports.resetPassword = async (req, res) => {
    try {
        const { username, oldpass, newpass } = req.body;

        if (!username || !oldpass || !newpass) {
            return res.status(400).send({
                code: 400,
                message: "Missing parameters"
            });
        }

        const current_dt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const selectQ = `SELECT ID FROM user_master WHERE BINARY USER_NAME = ? AND BINARY PASSWORD = ?`;
        const result = await db.executeMasterQuery(selectQ, [username, oldpass]);

        if (result.length > 0) {
            const user_id = result[0].ID;
            const updatePassQ = `UPDATE user_master SET PASSWORD = ?, PASSWORD_RESET_DATE = ? WHERE ID = ?`;
            await db.executeMasterQuery(updatePassQ, [newpass, current_dt, user_id]);

            return res.send({
                code: 200,
                message: "success"
            });
        } else {
            return res.status(404).send({
                code: 404,
                message: "Invalid username or password"
            });
        }
    } catch (error) {
        console.error('❌ resetPassword error:', error);
        return res.status(500).send({
            code: 500,
            message: "Internal server error"
        });
    }
};