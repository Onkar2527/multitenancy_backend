const forge = require('node-forge')

const private_key = process.env.PRIVATE_KEY;
const application_public_key = process.env.APPLICATION_PUBLIC_KEY

exports.ConverToUTF = (data)=>{
    let decripted = Buffer.from(data,'base64').toString('binary');
    return decripted;

}

exports.decriptData = (data)=>{
    let rawdata = this.ConverToUTF(data);

    const rsa = forge.pki.privateKeyFromPem(private_key);

    let stringifiedData = rsa.decrypt(rawdata);
    if(stringifiedData)
    {
        return JSON.parse(stringifiedData)
    }
    else{
        return {}
    }

    
}

exports.encriptData = (data) =>{
    let result ;
    if(data)
    {
        result = JSON.stringify(data);
        const rsa = forge.pki.publicKeyFromPem(application_public_key);
        let dt = rsa.encrypt(result.toString())
        let FinalData = Buffer.from(dt).toString('base64');
        // let FinalData = dt;
        return FinalData
    }
    else
    {
        return {}
    }
}