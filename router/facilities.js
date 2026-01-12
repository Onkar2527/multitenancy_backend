const express = require('express');
const router = express.Router();


router
    .post('/get', require('../services/facilities').get)
    .post('/create', require('../services/facilities').create)
    .post('/update', require('../services/facilities').update )

module.exports = router;