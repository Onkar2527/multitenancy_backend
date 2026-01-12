// const nodemailer = require('nodemailer');

// const otpData = {}

// exports.sendMail = (req, res) => {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'aniruddha@kredpool.com',
//             pass: 'dvcgrhpcqnmcldok',
//         },
//     });

//     const mailOptions = {
//         from: 'aniruddha@kredpool.com',
//         to: req.body.EMAIL_ID,
//         subject: 'Hello, World!',
//         text: 'This is a test email sent using Gmail SMTP bhhag Bhosdike.',
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error('Error sending email:', error);
//             res.send({
//                 "code" : 400,
//                 "message" : "failed to send mail."
//             })
//         } else {
//             console.log('Email sent:', info.response);
//             res.send({
//                 "code": 200,
//                 "message" : "email sent successfully"
//             })
//         }
//     });
// }


// exports.verifyOtp =(req, res) =>{
//     let otp = req.body.OTP ;

// }


















///// chat gpt


const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
// Create a transporter object using your email service provider
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'aniruddha@kredpool.com',
        pass: 'dvcgrhpcqnmcldok'
    }
});
// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// Store OTP and timestamp in memory (you should use a database in production)
const otpData = {};
// Endpoint to send OTP through email and verify it
exports.sendMail = (req, res) => {
    // Generate OTP
    const otp = generateOTP();
    // Store OTP and timestamp
    const timestamp = Date.now();
    otpData[req.body.EMAIL] = { otp, timestamp };
    // Compose the email
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: req.body.EMAIL,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            res.status(500).send('Failed to send OTP via email.');
        } else {
            console.log('Email sent:', info.response);
            res.send({
                "code": 200,
                "message": "Email sent"
            });
        }
    });
};
// Endpoint to verify OTP
exports.verifyOtp = (req, res) => {
    console.log("otpData", otpData);
    const { EMAIL, OTP } = req.body;
    console.log("gullu", req.body);
    userEnteredOTP = OTP

    console.log("ueotp", userEnteredOTP);
    const storedOTPData = otpData[EMAIL];
    console.log("storedOTPData", storedOTPData);

    if (!storedOTPData) {
        res.status(400).send('OTP not found for this email.');
        return;
    }
    console.log("storedOTPData", storedOTPData.otp);


    if (userEnteredOTP == storedOTPData.otp) {
        res.send({
            "code": 200,
            "message": "OTP is valid. User is verified."
        });
        // console.log(res);
        // delete otpData[EMAIL]; // Remove the used OTP
    } else {

        res.send({
            "code": 400,
            "message": "OTP is either invalid or expired. Verification failed."
        })
    }
};
app.listen(process.env.EMAIL_PORT, () => {
    console.log(`Server is running on port ${process.env.EMAIL_PORT}`);
});
