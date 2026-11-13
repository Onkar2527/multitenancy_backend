const express = require('express');
const router = express.Router();
const listApi = require('../../services/list_api/api');

router
    .post('/onBoardCustomer', listApi.onBoardCustomer)
    .post('/getOnboardPayload', listApi.getOnboardPayload)
    .post('/downloadOnboardJson', listApi.downloadOnboardJson)
    .get('/downloadOnboardJson', listApi.downloadOnboardJson)
    .post('/getMasters', listApi.getMasters)
    .post('/getCustomer', listApi.getCustomer)
    .post('/checkLocalDuplicate', listApi.checkLocalDuplicate);

module.exports = router;