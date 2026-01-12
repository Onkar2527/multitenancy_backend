const db = require('../utilities/dbModule');
const fs = require('fs');
const path = require('path');

// -------------------------------
// GET BANK DETAILS (from Master DB)
exports.getBankDetails = async (req, res) => {
  try {
    const BANK_ID = req.user.BANK_ID;
    if (!BANK_ID) {
      return res.status(401).send({ code: 401, message: "Unauthorized: BANK_ID not found" });
    }

    const query = `SELECT ID, BANK_NAME, BANK_LOGO FROM bank_master WHERE ID = ?`;
    const result = await db.executeMasterQuery(query, [BANK_ID]);

    if (result.length > 0) {
      const bankData = result[0];

      // Construct Absolute URL for Logo if relative path exists
      if (bankData.BANK_LOGO) {
        const protocol = req.protocol;
        const host = req.get('host');
        // The server now serves 'uploads/bank_logos' at '/bank_logos'
        const fileName = path.basename(bankData.BANK_LOGO);
        bankData.BANK_LOGO_URL = `${protocol}://${host}/bank_logos/${fileName}`;
      }

      return res.send({
        code: 200,
        message: "OK",
        data: bankData
      });
    } else {
      return res.status(404).send({
        code: 404,
        message: "Bank details not found"
      });
    }
  } catch (error) {
    console.error("❌ GET BANK DETAILS ERROR:", error);
    return res.status(500).send({
      code: 500,
      message: "Internal Server Error"
    });
  }
};

// -------------------------------
// UPDATE BANK DETAILS (Master DB)
exports.updateBankDetails = async (req, res) => {
  try {
    const BANK_ID = req.user.BANK_ID;
    const { BANK_NAME, BANK_LOGO_BASE64 } = req.body;

    if (!BANK_ID) {
      return res.status(401).send({ code: 401, message: "Unauthorized" });
    }

    let logoPath = null;

    // Handle Logo Upload if provided
    if (BANK_LOGO_BASE64) {
      const folderPath = path.join(__dirname, '..', 'uploads', 'bank_logos');
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const fileName = `bank_${BANK_ID}_logo.jpg`;
      const filePath = path.join(folderPath, fileName);

      // Convert base64 to buffer
      const buffer = Buffer.from(BANK_LOGO_BASE64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      await fs.promises.writeFile(filePath, buffer);

      // Save relative path in DB
      logoPath = `uploads/bank_logos/${fileName}`;
    }

    let updateQuery = `UPDATE bank_master SET BANK_NAME = ? `;
    const params = [BANK_NAME];

    if (logoPath) {
      updateQuery += `, BANK_LOGO = ? `;
      params.push(logoPath);
    }

    updateQuery += ` WHERE ID = ?`;
    params.push(BANK_ID);

    await db.executeMasterQuery(updateQuery, params);

    const protocol = req.protocol;
    const host = req.get('host');
    const fileName = logoPath ? path.basename(logoPath) : null;
    const logoUrl = logoPath ? `${protocol}://${host}/bank_logos/${fileName}` : null;

    return res.send({
      code: 200,
      message: "Bank details updated successfully",
      data: {
        BANK_NAME,
        BANK_LOGO: logoPath,
        BANK_LOGO_URL: logoUrl
      }
    });

  } catch (error) {
    console.error("❌ UPDATE BANK DETAILS ERROR:", error);
    return res.status(500).send({
      code: 500,
      message: "Internal Server Error"
    });
  }
};
