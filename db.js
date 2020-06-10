const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

const https = require('https');
const qs = require('qs');

// The database part
const url = "mongodb+srv://mio:Jcu3gbEBnzhd3BHL@ggirls-rw5nh.gcp.mongodb.net/test?retryWrites=true&w=majority";
const dbName = 'ggirls';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
});

var SchemaTypes = mongoose.Schema.Types;

var userSchema = new mongoose.Schema({
    email: String,
    home: {type:String, ref:'Place'},
    work: {type:String, ref:'Place'},
    fav_places : [{place:{type:String, ref:'Place'}}],
    visited:[{
        vis_place:{type:String, ref:'Place'},
        vis_date:{type: Date, default: Date.now}
    }]
})

var placeSchema = new mongoose.Schema({
    map_id:String,
    geometry:{
        lat: SchemaTypes.Double,
        lng: SchemaTypes.Double
    },
    flag:Boolean,
    cases: [{case:{ type: Date, default: Date.now }}]
})

var caseSchema = new mongoose.Schema({
    case_id: String,
    "start_date": { type: Date, default: Date.now },
    "end_date": { type: Date, default: Date.now }
})

async function getUserID(email){
    var User = mongoose.model('users',userSchema);
    var user = new User({email:email});
    var userID;
    // find user
    User.findOne({email:email},(err,docs)=>{
        if(err) return console.error(err);
        console.log(docs);
        //If user doesn't exist
        if(docs.length===0){
             user.save((err,user)=>{
                if (err) return console.error(err);
                console.log(user);
            });
            userID = user._id;
        } else {
            userID = docs._id;
        }
        console.log(userID);
    });
}

function findPlace(input){
    var query = {
        key:"AIzaSyCfEfBinkiInzbXiapMhgpsXpN03Q3dSGc",
        input:input,
        inputtype:"textquery"
    }
    var options = {
        host: 'maps.googleapis.com',
        path:'/maps/api/place/findplacefromtext/json?'+qs.stringify(query),
        method: 'GET'
    }
    var req = https.get(options, function(res) {
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));

        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        res.on('data', function(chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
        }).on('end', function() {
            var body = Buffer.concat(bodyChunks);
            console.log('BODY: ' + body);
            // ...and/or process the entire body here
        })
    });

    req.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });
}

exports.getUserID = getUserID;
exports.findPlace = findPlace;