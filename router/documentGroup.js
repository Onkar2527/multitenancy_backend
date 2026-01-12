const express = require('express');
const router = express.Router()


router
    .post('/get',require('../services/documentGroup').get)

module.exports = router;
