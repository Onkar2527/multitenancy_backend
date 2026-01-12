const express = require('express');
const router = express.Router();


router
    .get('/get', require('../services/password_policy').get)
    .post('/save', require('../services/password_policy').save)


module.exports = router