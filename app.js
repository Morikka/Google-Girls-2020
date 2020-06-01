const express = require("express");
const got = require('got');
const jwt = require('jsonwebtoken');
const app = express();
const MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
const mongoose = require('mongoose');
// The database part
const url = "mongodb+srv://mio:Jcu3gbEBnzhd3BHL@ggirls-rw5nh.gcp.mongodb.net/test?retryWrites=true&w=majority";
const dbName = 'ggirls';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
});
// The authorization part
let certs;
let aud;

async function certificates() {
    if (!certs) {
        let response = await got('https://www.gstatic.com/iap/verify/public_key');
        certs = JSON.parse(response.body);
    }

    return certs;
}

async function getMetadata(itemName) {
    const endpoint = 'http://metadata.google.internal';
    const path = '/computeMetadata/v1/project/';
    const url = endpoint + path + itemName;

    let response = await got(url, {
        headers: {'Metadata-Flavor': 'Google'},
    });
    return response.body;
}

async function audience() {
    if (!aud) {
        let project_number = await getMetadata('numeric-project-id');
        let project_id = await getMetadata('project-id');
        aud = '/projects/' + project_number + '/apps/' + project_id;
    }
    return aud;
}

async function validateAssertion(assertion) {
    if (!assertion) {
        return {};
    }
    // Decode the header to determine which certificate signed the assertion
    const encodedHeader = assertion.split('.')[0];
    const decodedHeader = Buffer.from(encodedHeader, 'base64').toString('utf8');
    const header = JSON.parse(decodedHeader);
    const keyId = header.kid;

    // Fetch the current certificates and verify the signature on the assertion
    const certs = await certificates();
    const payload = jwt.verify(assertion, certs[keyId]);

    // Check that the assertion's audience matches ours
    const aud = await audience();
    if (payload.aud !== aud) {
        throw new Error('Audience mismatch. {$payload.aud} should be {$aud}.');
    }

    // Return the two relevant pieces of information
    return {
        email: payload.email,
        sub: payload.sub,
    };
}

async function getUserInfo(email){
    // need rewrite
    // mongodb.collection("user").findOne({email:email},(err,res)=>{
    //     if (err) throw err;
    //     var user = res;
    //     console.log(user);
    //     if(res==null){
    //         mongodb.collection("user").insertOne({email:email});
    //     }
    // })
}

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname+'/views');
app.set("view options", {layout: false});
app.use('/', express.static(__dirname));

app.get('/', async (req, res) => {
    const assertion = req.header('X-Goog-IAP-JWT-Assertion');
    let email = 'None';
    let userid = 'None';
    try {
        const info = await validateAssertion(assertion);
        email = info.email;
        userid = info.sub;
    } catch (error) {
        console.log(error);
    }
    console.log(email,userid);
    // await getUserInfo(email);
    res.render('index.html');
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;