const express = require('express');
const router = express.Router();
const dropdownMasterService = require('../services/dropdownMaster');


router
    .post('/get', dropdownMasterService.get)
    .post('/create', dropdownMasterService.create)
    .post('/update', dropdownMasterService.update)
    .post('/delete', dropdownMasterService.delete)

    .post('/getFields', dropdownMasterService.getFields)
    .post('/createFields', dropdownMasterService.createFields)
    .post('/updateFields', dropdownMasterService.updateFields)
    .post('/deleteFields', dropdownMasterService.deleteFields)

    .post('/getValues', dropdownMasterService.getValues)
    .post('/createValues', dropdownMasterService.createValues)
    .post('/updateValues', dropdownMasterService.updateValues)
    .post('/deleteValues', dropdownMasterService.deleteValues)

module.exports = router;
