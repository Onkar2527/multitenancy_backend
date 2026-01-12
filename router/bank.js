const express = require('express');
const router = express.Router();
const bankService = require('../services/bank');

router
  .post('/get', bankService.getBankDetails)
  .post('/update', bankService.updateBankDetails);

module.exports = router;
