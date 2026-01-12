const express = require('express');
const router = express.Router()


router
    .post('/getComponunts',require('../services/componunts').getComponunts)
    

module.exports = router;