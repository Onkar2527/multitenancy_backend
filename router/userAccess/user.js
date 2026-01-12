const express = require('express');
const router = express.Router();


router
    .post('/login', require('../../services/userAccess/user').login)
    .post('/getUser', require('../../services/userAccess/user').getUser)
    .post('/getUserBranch', require('../../services/userAccess/user').getUserBranch)
    .post('/getUserRole', require('../../services/userAccess/user').getUserRole)
    .post('/resetPassword',require('../../services/userAccess/user').resetPassword)

module.exports = router