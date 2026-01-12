const express = require('express');
const router = express.Router();
const asyncHandler = require('../utilities/asyncHandler');
const applicantDocumentService = require('../services/applicantDocument');

router 
    .post('/getAllApplicants', asyncHandler(applicantDocumentService.getAllApplicants))
    .post('/create', asyncHandler(applicantDocumentService.create))
    .post('/upload', asyncHandler(applicantDocumentService.uploadDocument))
    .post('/update', asyncHandler(applicantDocumentService.update))
    




module.exports = router
