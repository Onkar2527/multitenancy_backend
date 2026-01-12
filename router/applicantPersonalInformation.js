const express = require('express');
const router = express();


router
    .post('/get', require('../services/applicantPersonalInformation').get)
    .post('/create', require('../services/applicantPersonalInformation').create)
    .post('/update', require('../services/applicantPersonalInformation').update )

module.exports = router;