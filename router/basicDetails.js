const express = require('express');
const router = express.Router();
const asyncHandler = require('../utilities/asyncHandler');
const basicDetailsService = require('../services/basicDetails');

router 
    .post('/get', asyncHandler(basicDetailsService.get))
    .post('/create', asyncHandler(basicDetailsService.create))
    .post('/update', asyncHandler(basicDetailsService.update1))
    .post('/getAll', asyncHandler(basicDetailsService.getAll))




module.exports = router
