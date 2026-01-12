const express = require('express');
const router = express.Router()

const emailService = require('../services/emailVerification')


router
    .post('/sendAndVerifyOtp', emailService.sendMail)
    .post('/verifyOtp', emailService.verifyOtp)


module.exports = router