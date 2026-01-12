const express = require('express');
const router = express();


router
    .post('/get', require('../services/termDeposit').get)
    .post('/create', require('../services/termDeposit').create)
    .post('/update', require('../services/termDeposit').update )

module.exports = router;