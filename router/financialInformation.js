const express = require('express');
const router = express();


router
    .post('/get', require('../services/financialInformation').get)
    .post('/create', require('../services/financialInformation').create)
    .post('/update', require('../services/financialInformation').update )

module.exports = router;