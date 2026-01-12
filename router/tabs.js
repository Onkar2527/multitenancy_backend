const express = require('express');
const router = express.Router()


router
    .post('/getTabs',require('../services/tabs').getTabs)
    

module.exports = router;