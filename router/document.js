const express = require('express');
const router = express.Router()


router
    .post('/get',require('../services/document').get)
    .post('/create',require('../services/document').create)

module.exports = router;
