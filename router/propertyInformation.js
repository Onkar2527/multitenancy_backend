const express = require('express');
const router = express();


router
    .post('/get', require('../services/properInformation').get)
    .post('/create', require('../services/properInformation').create)
    .post('/update', require('../services/properInformation').update )

module.exports = router;