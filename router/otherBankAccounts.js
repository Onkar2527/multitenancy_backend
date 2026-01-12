const express = require('express');
const router = express.Router();


router
    .post('/get', require('../services/otherBankAccounts').get)
    .post('/create', require('../services/otherBankAccounts').create)
    .post('/update', require('../services/otherBankAccounts').update )

module.exports = router;