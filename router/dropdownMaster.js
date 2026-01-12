const express = require('express');
const router = express.Router();
const dropdownMasterService = require('../services/dropdownMaster');


router
    .post('/get', dropdownMasterService.get)
    .post('/create', dropdownMasterService.validate(), dropdownMasterService.create)
    .post('/update', dropdownMasterService.validate(), dropdownMasterService.update)
    .post('/delete', dropdownMasterService.validate(), dropdownMasterService.delete)

    .post('/getFields', dropdownMasterService.getFields)
    .post('/createFields', dropdownMasterService.validate(), dropdownMasterService.createFields)
    .post('/updateFields', dropdownMasterService.validate(), dropdownMasterService.updateFields)
    .post('/deleteFields', dropdownMasterService.validate(), dropdownMasterService.deleteFields)

    .post('/getValues', dropdownMasterService.getValues)
    .post('/createValues', dropdownMasterService.validate(), dropdownMasterService.createValues)
    .post('/updateValues', dropdownMasterService.validate(), dropdownMasterService.updateValues)
    .post('/deleteValues', dropdownMasterService.validate(), dropdownMasterService.deleteValues)

module.exports = router;
