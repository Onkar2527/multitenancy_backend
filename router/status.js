const express = require('express');
const router = express.Router();
const statusService =  require('../services/status')

router
    .post('/getList', statusService.getList)
    
    
module.exports = router