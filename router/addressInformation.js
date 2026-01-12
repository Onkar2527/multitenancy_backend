const express = require('express');
const router = express.Router();


router 
    .post('/address', require('../services/addressInformation').getAddress)
   

module.exports = router