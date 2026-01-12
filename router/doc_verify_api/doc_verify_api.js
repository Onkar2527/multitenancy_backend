const express = require('express');
const router = express();


router
    .post('/checkSufBal', require('../../services/doc_verify_api/balance').checkSufficientBalance)
    .post('/setBalance', require('../../services/doc_verify_api/balance').updateBalanceE)
    .post('/getBalance', require('../../services/doc_verify_api/balance').getBalanceE)

    .post('/hit', require('../../services/doc_verify_api/doc_verify_info').hit)
    .post('/getHits', require('../../services/doc_verify_api/doc_verify_info').getHits)

    .post('/getRates', require('../../services/doc_verify_api/doc_verify_rates').getRates)
    .post('/setRate', require('../../services/doc_verify_api/doc_verify_rates').setRate)


module.exports = router;