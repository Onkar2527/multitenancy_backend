// -------------------------------
// UPDATE EXTRA INFORMATION (BANK DB)
exports.update = async (req, res) => {
    try {
        const { ID } = req.body;

        if (!ID) {
            return res.status(400).send({
                code: 400,
                message: 'ExtraInformation ID is required'
            });
        }

        const data = {
            IS_CHECKED: req.body.IS_CHECKED,
            IS_PROVIDED: req.body.IS_PROVIDED,
            IS_VERIFIED: req.body.IS_VERIFIED,
            SEND_TO_REFILL: req.body.SEND_TO_REFILL,
            SEND_TO_REFILL_COUNT: req.body.SEND_TO_REFILL_COUNT,
            CHECKER_REMARK: req.body.CHECKER_REMARK,
            MAKER_REMARK: req.body.MAKER_REMARK,
            VERIFIER_REMARK: req.body.VERIFIER_REMARK,
            REFILL_BY: req.body.REFILL_BY
        };

        let setData = '';
        const values = [];

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                setData += `${key} = ?, `;
                values.push(data[key]);
            }
        });

        if (values.length === 0) {
            return res.status(400).send({
                code: 400,
                message: 'No data provided to update'
            });
        }

        setData = setData.slice(0, -2);
        values.push(ID);

        const [result] = await req.db.promise().query(
            `UPDATE extra_information SET ${setData} WHERE ID = ?`,
            values
        );

        return res.send({
            code: 200,
            message: 'extraInformation updated successfully'
        });

    } catch (error) {
        console.error('❌ EXTRA INFORMATION UPDATE ERROR:', error);
        return res.status(500).send({
            code: 500,
            message: 'Failed to update extra information'
        });
    }
};
