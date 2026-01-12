const router = require('express').Router();
const licenseServices = require('../services/license')

router
    .post('/get', licenseServices.get)
    .post('/create', licenseServices.create)
    .post('/update', licenseServices.update)


module.exports = router