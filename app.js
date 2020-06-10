'use strict';

const express = require("express");
const app = express();

// var assert = require('assert');
// const events = require('events');
const update_data = require('./update_data');
const emitterFile = require('./my_emitter');
const myEmitter = emitterFile.emitter;
const db = require('./db');
const validate = require('./validate')

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname+'/views');
app.set("view options", {layout: false});
app.use('/', express.static(__dirname));

//Check user firstly
app.get('/', async (req, res) => {
    const assertion = req.header('X-Goog-IAP-JWT-Assertion');
    let email = 'None';
    // let userid = 'None';
    // try {
        // const info = await validate.validateAssertion(assertion);
        // email = info.email;
        // userid = info.sub;
    // } catch (error) {
    //     console.log(error);
    // }
    // console.log(email,userid);
    // await db.getUserID(email);
    db.findPlace();
    res.render('index.html');
});

// Search return nearby cases
app.get('/search',(req,res)=>{
    const place = req.body;

});

// Nearby cases around home
app.get('/home',(req,res)=>{

});

// Nearby cases around work
app.get('/work',(req,res)=>{

});

app.get('/api/update_data', (req,res)=>{
    update_data.auto_run();
    res.sendStatus(200);
});

//event part
myEmitter.on('update_data', (res) => {
    console.log(res);
    console.log('worked!');
});
// setTimeout(console.log, 5000, 'Done');

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;