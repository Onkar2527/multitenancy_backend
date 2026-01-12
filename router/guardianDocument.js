const express = require('express');
const router = express.Router();
const asyncHandler = require('../utilities/asyncHandler');
const guardianDocumentService = require('../services/guardianDocument');

router 
    .post('/getguardians', asyncHandler(guardianDocumentService.getAllguardians))
    .post('/create', asyncHandler(guardianDocumentService.create))
    .post('/upload', asyncHandler(guardianDocumentService.uploadDocument))
    .post('/update', asyncHandler(guardianDocumentService.update))
    




module.exports = router
