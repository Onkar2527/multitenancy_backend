const express = require('express');
const router = express.Router();


router 
    .post('/get', require('../services/panVerifiedList').get)
    .post('/create', require('../services/panVerifiedList').create)
    .post('/update', require('../services/panVerifiedList').update )
    



module.exports = router