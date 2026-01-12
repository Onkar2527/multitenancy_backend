const express = require('express');
const router = express.Router()


router
    .post('/getAll',require('../services/remark').getAllRemark)
    .post('/create',require('../services/remark').createRemark)
    

module.exports = router;