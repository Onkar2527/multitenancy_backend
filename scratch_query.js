const fs = require('fs');
const path = require('path');

const signaturePath = 'uploads/applicantDocuments/yVkls7FoasdznEWiqIGSZ3VWSOEOKgyh.jpg';
const photoPath = 'uploads/applicantDocuments/zlYU9lLTTBPfpfUoBGkTBCD2xb9X7n87.jpg';

function checkFile(filePath) {
  console.log(`Checking file: ${filePath}`);
  const resolved = path.resolve(filePath);
  console.log(`Resolved path: ${resolved}`);
  if (fs.existsSync(filePath)) {
    console.log('Exists: YES');
    const content = fs.readFileSync(filePath, { encoding: 'utf8' });
    console.log('Content preview (first 100 chars):');
    console.log(content.substring(0, 100));
  } else {
    console.log('Exists: NO');
  }
}

checkFile(signaturePath);
console.log('-------------------');
checkFile(photoPath);
