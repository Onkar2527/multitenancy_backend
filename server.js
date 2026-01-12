const express = require('express');
const app = express();
const http = require('http');
exports.dotenv = require('dotenv').config();
// require('dotenv').config();

const cors = require('cors');
const helmet = require('helmet');
const globalRoutes = require('./router/global')
const bodyParser = require('body-parser')

const port = process.env.PORT;
const hostname = process.env.HOST_NAME
const path = require('path')
const https = require('https')
const fs = require('fs')
const httpServer = http.createServer(app)
const { initBankPools } = require('./utilities/dbConfig');




// const tokentest = require('./services/list_api/api').getJWTToken

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));



app.use('/static', express.static(path.join(__dirname, 'uploads')));

app.use('/', (req, res, next) => {
    let supportKey = req.headers['supportkey'];
    console.log("Requested Method : -", req.method, req.url, "public Ip :", req.connection.remoteAddress, "supportkey : ", supportKey);
    next();
})


app.use(cors({
    origin: "*"
}));
app.use(helmet());
app.disable('x-powered-by');


app.use('/', globalRoutes)

// require("./services/list_api/api").syncMasters()

if (process.env.IS_HTTPS == 1) {

    const options = {
        key: fs.readFileSync('/var/www/html/ssl/203-192-206-209_no_passphrase.key'),
        cert: fs.readFileSync('/var/www/html/ssl/203_192_206_209_bundle.crt')
    };
    const httpsServer = https.createServer(options, app)

    httpsServer.listen(port, hostname, async() => {
        console.log(`Server listening on (https) https://${hostname}:${port}`);
        // let token = await tokentest();
        // console.log("token", token);
    })

} else {
    httpServer.listen(port, hostname, async() => {
        console.log(`Server listening on (http) http://${hostname}:${port}`);
        // let token = await tokentest();
        // console.log("token", token);
    })
}

// (async() => {
//     try {
//         await initBankPools();
//         console.log('✅ All Bank DB pools initialized');
//     } catch (err) {
//         console.error('❌ Failed to init bank pools', err);
//         process.exit(1);
//     }
// })();

(async() => {
    try {
        await initBankPools();
        console.log('🚀 All Bank DBs initialized');
    } catch (err) {
        console.error('❌ DB Init Error', err);
        process.exit(1);
    }
})();