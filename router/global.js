// const express = require('express');
// const router = express.Router()
// const globalService = require('../services/global')

// router
// //.all('*', globalService.requireAuthentication)
// // .use('/api', globalService.checkToken)
//     .use('/api/basicDetails', require('./basicDetails'))
//     .use('/api/applicantPersonalInformation', require('./applicantPersonalInformation'))
//     .use('/api/termDeposite', require('./termDepsit'))
//     .use('/api/nomineeDetails', require('./nomineeDetails'))
//     .use('/api/facilities', require('./facilities'))
//     .use('/api/financialInformation', require('./financialInformation'))
//     .use('/api/personalInformation', require('./applicantPersonalInformation'))
//     .use('/api/loanInformation', require('./loanInformation'))
//     .use('/api/otherBankAccounts', require('./otherBankAccounts'))
//     .use('/api/propertyInformation', require('./propertyInformation'))
//     .use('/api/documentGroup', require('./documentGroup'))
//     .use('/api/document', require('./document'))
//     .use('/api/user', require('./userAccess/user'))
//     .use('/api/emailVerification', require('./emailVerification'))
//     .use('/api/aadhaar', require('./aadhaar'))


// //.use('/api/accountHistory', require('./accountHistory'))
// .use('/api/componunts', require('./componunt'))
//     .use('/api/tabs', require('./tabs'))
//     .use('/api/extraInformation', require('./extraInformation'))
//     .use('/api/applicantDocuments', require('./applicantDocument'))

// .use('/api/applicantsPhoto', require('./applicantsPhoto'))
//     .use('/api/addressInformation', require('./addressInformation'))
//     .use('/api/pan', require('./panVerifiendList'))
//     .use('/api/voterId', require('./voterIdVerification'))
//     .use('/api/license', require('./license'))


// .use('/api/pincode', require('./pincode'))

// .post('/api/user', require('./userAccess/user'))

// .use('/api/status', require('./status'))

// .use('/api/remark', require('./remark'))

// .use('/api/dropdownMaster', require('./dropdownMaster'))
//     .use('/api/dropdownMaster', require('./dropdownMaster'))

// .use('/api/branch', require('./branch'))

// .use('/api/list_api', require('./list_api/api'))

// .use('/api/doc_verify', require('./doc_verify_api/doc_verify_api'))

// .use('/api/passwordPolicy', require('./password_policy'))

// //guardian

// .use('/api/guardianInfo', require('./guardianInformation'))

// .use('/api/guardianDocument', require('./guardianDocument'))
// module.exports = router




const express = require('express');
const router = express.Router();

// 🔐 JWT Middleware
const authMiddleware = require('../middleware/auth.middleware');

// 👉 FIRST: middleware attach (VERY IMPORTANT)
router.use('/api', authMiddleware);

// 👉 THEN all API routes
router
    .use('/api/basicDetails', require('./basicDetails'))
    .use('/api/applicantPersonalInformation', require('./applicantPersonalInformation'))
    .use('/api/termDeposite', require('./termDepsit'))
    .use('/api/nomineeDetails', require('./nomineeDetails'))
    .use('/api/facilities', require('./facilities'))
    .use('/api/financialInformation', require('./financialInformation'))
    .use('/api/personalInformation', require('./applicantPersonalInformation'))
    .use('/api/loanInformation', require('./loanInformation'))
    .use('/api/otherBankAccounts', require('./otherBankAccounts'))
    .use('/api/propertyInformation', require('./propertyInformation'))
    .use('/api/documentGroup', require('./documentGroup'))
    .use('/api/document', require('./document'))
    .use('/api/user', require('./userAccess/user'))
    .use('/api/emailVerification', require('./emailVerification'))
    .use('/api/aadhaar', require('./aadhaar'))

    // components
    .use('/api/componunts', require('./componunt'))

    .use('/api/tabs', require('./tabs'))
    .use('/api/extraInformation', require('./extraInformation'))
    .use('/api/applicantDocuments', require('./applicantDocument'))

    .use('/api/applicantsPhoto', require('./applicantsPhoto'))
    .use('/api/addressInformation', require('./addressInformation'))
    .use('/api/pan', require('./panVerifiendList'))
    .use('/api/voterId', require('./voterIdVerification'))
    .use('/api/license', require('./license'))

    .use('/api/pincode', require('./pincode'))

    .use('/api/status', require('./status'))
    .use('/api/remark', require('./remark'))

    .use('/api/dropdownMaster', require('./dropdownMaster'))
    .use('/api/branch', require('./branch'))

    .use('/api/list_api', require('./list_api/api'))
    .use('/api/doc_verify', require('./doc_verify_api/doc_verify_api'))

    .use('/api/passwordPolicy', require('./password_policy'))

    // guardian
    .use('/api/guardianInfo', require('./guardianInformation'))
    .use('/api/guardianDocument', require('./guardianDocument'))
    .use('/api/bank', require('./bank'));

module.exports = router;





// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth.middleware');

// // 🔓 LOGIN & PUBLIC ROUTES (NO JWT)
// router
//     .use('/api/user', require('./userAccess/user'))
//     .use('/api/emailVerification', require('./emailVerification'));

// // 🔐 JWT PROTECTION STARTS HERE
// router.use('/api', auth);

// // 🔐 ALL BELOW ROUTES REQUIRE TOKEN
// router
//     .use('/api/basicDetails', require('./basicDetails'))
//     .use('/api/applicantPersonalInformation', require('./applicantPersonalInformation'))
//     .use('/api/termDeposite', require('./termDepsit'))
//     .use('/api/nomineeDetails', require('./nomineeDetails'))
//     .use('/api/facilities', require('./facilities'))
//     .use('/api/financialInformation', require('./financialInformation'))
//     .use('/api/loanInformation', require('./loanInformation'))
//     .use('/api/otherBankAccounts', require('./otherBankAccounts'))
//     .use('/api/propertyInformation', require('./propertyInformation'))
//     .use('/api/documentGroup', require('./documentGroup'))
//     .use('/api/document', require('./document'))
//     .use('/api/aadhaar', require('./aadhaar'))
//     .use('/api/componunts', require('./componunt'))
//     .use('/api/tabs', require('./tabs'))
//     .use('/api/extraInformation', require('./extraInformation'))
//     .use('/api/applicantDocuments', require('./applicantDocument'))
//     .use('/api/applicantsPhoto', require('./applicantsPhoto'))
//     .use('/api/addressInformation', require('./addressInformation'))
//     .use('/api/pan', require('./panVerifiendList'))
//     .use('/api/voterId', require('./voterIdVerification'))
//     .use('/api/license', require('./license'))
//     .use('/api/pincode', require('./pincode'))
//     .use('/api/status', require('./status'))
//     .use('/api/remark', require('./remark'))
//     .use('/api/dropdownMaster', require('./dropdownMaster'))
//     .use('/api/branch', require('./branch'))
//     .use('/api/list_api', require('./list_api/api'))
//     .use('/api/doc_verify', require('./doc_verify_api/doc_verify_api'))
//     .use('/api/passwordPolicy', require('./password_policy'))
//     .use('/api/guardianInfo', require('./guardianInformation'))
//     .use('/api/guardianDocument', require('./guardianDocument'));

// module.exports = router;