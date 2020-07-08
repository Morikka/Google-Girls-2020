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
        await db.findPlace(msg).then(async place =>{
            if(place[0]==='null'){
                await db.findPlace(msg).then(place=>{
                    socket.emit('searchRes', place);
                }); } else {
                    socket.emit('searchRes', place);
                };
            }
        )
        console.log("Place is", place);
    });

    socket.on('searchNearby',async (msg)=>{
        await db.searchNearby(msg["placeID"],msg["type"]).then(x=> socket.emit("searchNearbyRes",x));
    });

    //get user Info
    socket.emit('user',user);

    //set user email
    socket.on("setEmail",async (msg) => {
        console.log(msg);
        await db.setEmail(userID,msg).then(x=>{
            socket.emit("setEmailRes",x);
            }
        );
    })

    //find place by ID
    socket.on("getPlaceByID",async (msg) => {
        place = await db.getPlaceByID(msg);
        console.log("Place is", place);
        socket.emit('getPlaceByIDRes', place);
    })

    //find place by ID
    socket.on("getPlaceByID2",async (msg) => {
        place = await db.getPlaceByID(msg);
        console.log("Place is", place);
        socket.emit('getPlaceByIDRes2', place);
    })

    //set place
    socket.on('setPlace',async (msg) =>{
        console.log(msg);
        await setPlace(msg);
        // await db.setPlace(userID,msg["id"],msg["type"],msg["date"]).then(x=> {
        //     socket.emit('setPlaceRes',x);
        // })
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

async function setPlace(msg){
    var retries = 5;
    function recurse(i) {
        db.setPlace(userID,msg["id"],msg["type"],msg["date"]).then(e =>{
            // console.log("????: ",e,i);
            if (i < retries && e["n"]!==1) {
                recurse(++i);
            }
            throw e;
        }).catch(e => console.error(e));
    }
    recurse(0);
}