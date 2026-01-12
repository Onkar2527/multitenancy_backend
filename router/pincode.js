const express = require('express');
const router = express.Router();
const pincodeServices =  require('../services/pincode')

router 
   // .post('/getCountry', pincodeServices.get)
    .post('/getState', pincodeServices.getState)
    .post('/getDistrict', pincodeServices.getDistrict)
    .post('/getTaluka', pincodeServices.getTaluka)
    .post('/getVillage', pincodeServices.getVillage)
    




module.exports = router