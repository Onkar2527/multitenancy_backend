const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER || 'aniruddha@kredpool.com',
        pass: process.env.EMAIL_PASS || 'dvcgrhpcqnmcldok'
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP and timestamp in memory
// NOTE: For multi-instance production, move this to Redis or Database.
const otpData = {};

exports.sendMail = async (req, res) => {
    try {
        const { EMAIL } = req.body;
        if (!EMAIL) {
            return res.status(400).send({ code: 400, message: "Email is required" });
        }

        const otp = generateOTP();
        const timestamp = Date.now();
        otpData[EMAIL] = { otp, timestamp };

        const mailOptions = {
            from: process.env.EMAIL_USER || 'aniruddha@kredpool.com',
            to: EMAIL,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send({ code: 500, message: 'Failed to send OTP via email' });
            }
            res.send({
                code: 200,
                message: "Email sent successfully"
            });
        });
    } catch (error) {
        console.error("EMAIL SEND ERROR:", error);
        res.status(500).send({ code: 500, message: "Internal server error" });
    }
};

exports.verifyOtp = (req, res) => {
    try {
        const { EMAIL, OTP } = req.body;
        const storedOTPData = otpData[EMAIL];

        if (!storedOTPData) {
            return res.status(400).send({ code: 400, message: 'OTP not found or expired' });
        }

        // Check expiry (e.g., 5 minutes)
        const isExpired = (Date.now() - storedOTPData.timestamp) > 5 * 60 * 1000;
        if (isExpired) {
            delete otpData[EMAIL];
            return res.status(400).send({ code: 400, message: 'OTP has expired' });
        }

        if (OTP == storedOTPData.otp) {
            delete otpData[EMAIL]; // Standard behavior: delete after verification
            res.send({
                code: 200,
                message: "OTP is valid. Verification successful."
            });
        } else {
            res.status(400).send({
                code: 400,
                message: "Invalid OTP"
            });
        }
    } catch (error) {
        console.error("OTP VERIFY ERROR:", error);
        res.status(500).send({ code: 500, message: "Internal server error" });
    }
};
