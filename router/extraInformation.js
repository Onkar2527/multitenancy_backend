const express = require('express');
const router = express.Router()


router
    .post('/update',require('../services/extraInformation').update)
    

module.exports = router;