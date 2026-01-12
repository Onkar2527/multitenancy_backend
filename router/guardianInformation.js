const express = require('express');
const router = express();


router
    .post('/get', require('../services/guardianInformation').get)
    .post('/create', require('../services/guardianInformation').create)
    .post('/update', require('../services/guardianInformation').update )

module.exports = router;