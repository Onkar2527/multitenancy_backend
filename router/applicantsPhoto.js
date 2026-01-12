const express = require('express');
const router = express();


router
    
    .post('/getAllApplicants',  require('../services/applicantsPhoto').getAllApplicants)
    .post('/upload' , require('../services/applicantsPhoto').upload)
    //.post('/retrive', require('../services/applicantsPhoto').retrieve)


module.exports = router