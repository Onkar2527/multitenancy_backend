const express = require('express');
const router = express.Router();


router 
    .post('/get', require('../services/branch').get)
   

module.exports = router