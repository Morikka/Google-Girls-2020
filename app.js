'use strict';

const express = require("express");
const app = express();
const request = require('request');
// var assert = require('assert');
// const events = require('events');
const update_data = require('./update_data');
const emitterFile = require('./my_emitter');
const myEmitter = emitterFile.emitter;
const db = require('./db');
const validate = require('./validate');

// var http = require('http').createServer(app);
// var io = require('socket.io')(http);

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname+'/views');
app.set("view options", {layout: false});
app.use('/', express.static(__dirname));
var userID = "None";
var email = "None";
var user = "None";
//Check user firstly
app.get('/', async (req, res) => {
    const assertion = req.header('X-Goog-IAP-JWT-Assertion');
    // let userID = 'None';
    try {
        const info = await validate.validateAssertion(assertion);
        email = info.email;
        // userID = info.sub;
    } catch (error) {
        console.log(error);
    }
    // console.log(email);
    // local env cannot get email
    if (email===undefined){
        email='test@t.t'
    }
    user = await db.getUser(email);
    userID = user["_id"];
    res.render('index.html');
});

app.get('/test', async (req,res) =>{
    email='test@t.t';
    user = await db.getUser(email);
    console.log(user);
    userID = user["_id"];
    res.render('test.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    let place = null;

    socket.on("disconnect", () => {
        console.log("a user go out");
    });

    // search the place
    socket.on('search', async (msg) => {
        console.log('user ID: ' + userID);
        console.log('search: ' + msg);
        place = await db.findPlace(msg);
        console.log("Place is", place);
        socket.emit('searchRes', place);
    });

    //get user Info
    socket.emit('user',user);

    socket.on('set',(msg) =>{
        console.log("Set Home: ",place);
        db.setPlace(userID,place,1);
    });
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

// Start the server
if (module === require.main) {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
    });
}
// [END appengine_websockets_app]