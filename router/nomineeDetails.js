const express = require('express');
const router = express.Router();


router
    .post('/get', require('../services/nomineeDetails').get)
    .post('/create', require('../services/nomineeDetails').create)
    .post('/update', require('../services/nomineeDetails').update )

module.exports = router;