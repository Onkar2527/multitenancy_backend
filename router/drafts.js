const express = require('express');
const router = express.Router()


router
    .post('/get', require('../services/drafts').get)


module.exports = router;