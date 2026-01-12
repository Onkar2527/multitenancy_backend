const express = require('express');
const router = express.Router();
const voterIdVerificationService = require('../services/VoterIdVerification')

router 
    .post('/get', voterIdVerificationService.get)
    .post('/create', voterIdVerificationService.create)
    .post('/update', voterIdVerificationService.update )
    



module.exports = router