const express = require('express');
const router = express();


router
    .post('/get', require('../services/aadhaar').get)
    .post('/create', require('../services/aadhaar').create)
    .post('/update', require('../services/aadhaar').update)
  

module.exports = router;